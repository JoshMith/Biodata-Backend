import { Request, Response, NextFunction } from "express"
import pool from "../config/db.config";
import bcrypt from 'bcryptjs'
import { generateToken } from "../utils/helpers/generateToken";
import asyncHandler from "../middlewares/asyncHandler";
import jwt from 'jsonwebtoken'
import { sendVerificationEmail } from "../utils/helpers/sendEmail";


export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { first_name, last_name, middle_name, email, password, roles, phone_number, parish_id } = req.body;

    // Check if user exists
    const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (userExists.rows.length > 0) {
        res.status(400).json({ message: "User already exists. Go to login..." });
        return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert into users table
    const newUser = await pool.query(
        `INSERT INTO users
            (first_name, last_name, middle_name, email, password_hash, roles, phone_number, parish_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [first_name, last_name, middle_name, email, hashedPassword, roles, phone_number, parish_id]
    );

    const user = newUser.rows[0];

    // Fetch parish name for the user
    let parishName: string | null = null;
    if (user.parish_id) {
        const parishResult = await pool.query(
            `SELECT parish_name FROM parishes WHERE parish_id = $1`,
            [user.parish_id]
        );
        parishName = parishResult.rows[0]?.parish_name || null;
    }


    //generate verification token
    const emailToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    //send verification email
    await sendVerificationEmail(user.email, emailToken)

    // Generate the JWT token (custom function for token generation)
    await generateToken(res, user.id, user.roles);

    res.status(201).json({
        message: "User registered successfully.Please Chck your email to verify your account",
        user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            middleName: user.middle_name,
            email: user.email,
            roles: user.roles,
            verified: user.verified,
            parishId: user.parish_id,
            parishName: parishName,
        }
    });
});


export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;


    // Check if user exists in the database
    const userQuery = await pool.query(
        `SELECT users.id, users.first_name, users.last_name, users.middle_name, users.email, users.password_hash, users.roles, users.parish_id
        FROM users
        WHERE email = $1`,
        [email]
    );

    // If no user is found, return an error
    if (userQuery.rows.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // Retrieve the user data from the query result
    const user = userQuery.rows[0];

    // Check if user is verified
    const verifiedQuery = await pool.query(
        `SELECT verified FROM users WHERE email = $1`,
        [email]
    );
    if (verifiedQuery.rows.length === 0 || !verifiedQuery.rows[0].verified) {
        return res.status(401).json({ message: "Please verify your email before logging in." });
    }

    // Compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // Fetch parish name for the user
    let parishName: string | null = null;
    if (user.parish_id) {
        const parishResult = await pool.query(
            `SELECT parish_name FROM parishes WHERE parish_id = $1`,
            [user.parish_id]
        );
        parishName = parishResult.rows[0]?.parish_name || null;
    }

    // Generate the JWT token (custom function for token generation)
    await generateToken(res, user.id, user.roles);

    // Respond with user data and success message
    res.status(200).json({
        message: "Login successful",
        user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            middleName: user.middle_name,
            email: user.email,
            roles: user.roles,
            verified: user.verified,
            parishId: user.parish_id,
            parishName: parishName,
        }
    });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {

    // console.log("verify email called")
    const token = req.query.token as string;
    console.log("recived token")
    if (!token) {
        return res.status(400).json({ message: "Invalid or missing token" });
    }


    try {
        // Decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        // Update user as verified
        const result = await pool.query(
            "UPDATE users SET verified = TRUE WHERE id = $1 RETURNING id, email, verified",
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Email successfully verified", user: result.rows[0] });

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