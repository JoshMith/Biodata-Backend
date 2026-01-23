import { Request, Response, NextFunction } from "express"
import pool from "../config/db.config";
import bcrypt from 'bcryptjs'
import { generateToken } from "../utils/helpers/generateToken";
import asyncHandler from "../middlewares/asyncHandler";
import jwt from 'jsonwebtoken'
import { sendVerificationEmail } from "../utils/helpers/sendEmail";


export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { first_name, last_name, middle_name, email, password, phone_number, parish_id } = req.body;

        console.log("Attempting to register:", email); // Debug log

        // ✅ FIXED: Use ? for MySQL
        const [userExistsRows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        
        // Convert to array properly for MySQL
        const userExistsArray = userExistsRows as any[];
        if (userExistsArray.length > 0) {
            res.status(400).json({ message: "User already exists. Go to login..." });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const insertResult = await pool.query(
            `INSERT INTO users
                (first_name, last_name, middle_name, email, password_hash, role, phone_number, parish_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, middle_name, email, hashedPassword, "member", phone_number, parish_id]
        );

        // ✅ FIXED: Get insertId from MySQL result
        const insertId = (insertResult as any)[0]?.insertId;
        
        if (!insertId) {
            throw new Error("Failed to get user ID after insertion");
        }

        // ✅ FIXED: Fetch the user using the insertId
        const [userRows] = await pool.query("SELECT * FROM users WHERE id = ?", [insertId]);
        const userArray = userRows as any[];
        const user = userArray[0];

        if (!user) {
            throw new Error("User not found after creation");
        }

        // ✅ FIXED: Use ? for MySQL
        let parishName: string | null = null;
        if (user.parish_id) {
            const [parishRows] = await pool.query(
                `SELECT parish_name FROM parishes WHERE parish_id = ?`,
                [user.parish_id]
            );
            const parishArray = parishRows as any[];
            parishName = parishArray[0]?.parish_name || null;
        }

        // Generate verification token
        const emailToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

        // Send verification email (don't await if you want to continue)
        sendVerificationEmail(user.email, emailToken).catch(err => {
            console.error("Email sending failed:", err);
        });

        // Generate JWT token
        await generateToken(res, user.id, user.role);

        res.status(201).json({
            message: "User registered successfully. Please check your email to verify your account",
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                middleName: user.middle_name,
                email: user.email,
                role: user.role,
                verified: user.verified || false,
                parishId: user.parish_id,
                parishName: parishName,
            }
        });

    } catch (error) {
        console.error("❌ Registration error:", error);

        
        res.status(500).json({ 
            message: "Internal server error during registration",
            error: (error as Error).message
        });
    }
});


export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;


    // Check if user exists in the database
    const [userQuery] = await pool.query(
        `SELECT users.id, users.first_name, users.last_name, users.middle_name, users.email, users.password_hash, users.role, users.parish_id
        FROM users
        WHERE email = ?`,
        [email]
    ) as any;

    // If no user is found, return an error
    if ((userQuery as any[]).length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // Retrieve the user data from the query result
    const user = (userQuery as any[])[0];

    // Check if user is verified
    const [verifiedQuery] = await pool.query(
        `SELECT verified FROM users WHERE email = ?`,
        [email]
    ) as any;
    if ((verifiedQuery as any[]).length === 0 || !(verifiedQuery as any[])[0].verified) {
        return res.status(401).json({ message: "Please verify your email before logging in. Check your email for the verification link." });
    }

    // Compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // Fetch parish name for the user
    let parishName: string | null = null;
    if (user.parish_id) {
        const [parishResult] = await pool.query(
            `SELECT parish_name FROM parishes WHERE parish_id = ?`,
            [user.parish_id]
        ) as any;
        parishName = (parishResult as any[])[0]?.parish_name || null;
    }

    // Generate the JWT token (custom function for token generation)
    await generateToken(res, user.id, user.role);

    // Respond with user data and success message
    res.status(200).json({
        message: "Login successful",
        user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            middleName: user.middle_name,
            email: user.email,
            role: user.role,
            verified: user.verified,
            parishId: user.parish_id,
            parishName: parishName,
        }
    });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const token = req.query.token as string;
    console.log("received token");
    
    if (!token) {
        return res.status(400).json({ message: "Invalid or missing token" });
    }

    try {
        // Decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        //  Update user as verified
        const [result] = await pool.query(
            "UPDATE users SET verified = TRUE WHERE id = ?",
            [decoded.userId]
        );

        //  Check affectedRows
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        //  Fetch the updated user separately
        const [userRows] = await pool.query(
            "SELECT id, email, verified FROM users WHERE id = ?",
            [decoded.userId]
        );

        return res.status(200).json({ 
            message: "Email successfully verified", 
            user: (userRows as any[])[0] 
        });

    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }
});


export const logoutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Check if user is logged in
    if (!req.cookies.access_token && !req.cookies.refresh_token) {
        res.status(401).json({ message: "User not logged in!" });
        return;
    }
    // Clear access and refresh tokens for this specific user
    // const user = userQuery.rows[0];

    res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        // expires: new Date(0) // Expire immediately
    });

    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        // expires: new Date(0) // Expire immediately
    });

    res.status(200).json({ message: "User logged out successfully" });

    // Optionally, you can include a response body to confirm the logout
    // res.status(200).json({
    //     message: "User logged out successfully",
    //     user: {
    //         id: user.id,
    //         email: user.email
    //     }
    // });




    // Alternatively, you can clear all cookies if needed
    // res.clearCookie("access_token");
    // res.clearCookie("refresh_token");
    // res.clearCookie("access_token", { path: "/" });
    // res.clearCookie("refresh_token", { path: "/" });

    // // Clear access and refresh tokens properly
    // res.cookie(`access_token_${}`, "", {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV !== "development",
    //     sameSite: "strict",
    //     expires: new Date(0) // Expire immediately
    // });

    // res.cookie(`refresh_token_${}`, "", {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV !== "development",
    //     sameSite: "strict",
    //     expires: new Date(0) // Expire immediately
    // });

    // res.status(200).json({ message: "User logged out successfully" });
});


// 😐 {
//     'content-type': 'application/json',
//     'user-agent': 'PostmanRuntime/7.43.2',
//     accept: '*/*',
//     'cache-control': 'no-cache',
//     'postman-token': 'bb7c709f-7dcd-43ae-b722-c2b69e0a0944',
//     host: 'localhost:3000',
//     'accept-encoding': 'gzip, deflate, br',
//     connection: 'keep-alive',
//     'content-length': '68',
//     cookie: 'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsInJvbGVJZCI6MiwiaWF0IjoxNzQxOTQzNjc0LCJleHAiOjE3NDE5NDQ1NzR9.O_0lQVeM3VW6tWo8b1SJHUudZsgFRbA_ODhQPD8G-Bk; refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTc0MTk0MzY3NCwiZXhwIjoxNzQ0NTM1Njc0fQ.sak_bhDvyo-NGeqqpKKf4tnGUZ3Jlx3lMsPMknqGujk'
//   }