import { Request, Response, NextFunction } from "express"
import pool from "../config/db.config";
import bcrypt from 'bcryptjs'
import { generateToken } from "../utils/helpers/generateToken";
import asyncHandler from "../middlewares/asyncHandler";

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role, deanery, parish_id } = req.body

    // Check if user exists
    const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (userExists.rows.length > 0) {
        res.status(400).json({ message: "User already exists. Go to login..." });
        return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //insert into users table
    const newUser = await pool.query(
        "INSERT INTO users (name, email, password_hash, role, deanery, parish_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
        [name, email, hashedPassword, role, deanery, parish_id]
    );


    // Generate user-specific token
    // generateToken(res, newUser.rows[0].id, newUser.rows[0].role)

    res.status(201).json({
        message: "User registered successfully",
        user: newUser.rows[0]
    });

    //next() - I will redirect automatically is successfully registered
})


export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Check if user exists in the database
    const userQuery = await pool.query(
        `SELECT users.id, users.name, users.email, users.password_hash, users.role, users.deanery, users.parish_id
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

    // Compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Only allow Admin and Clergy to login
    // if (user.role !== "Admin" && user.role !== "Clergy") {
    //     res.status(403).json({ message: "Access denied: Insufficient permissions. Only Admins and Clergy allowed!" });
    //     return;
    // }

    // // Check if the user is already logged in (via the cookie)
    // if (req.cookies.access_token) {
    //     return res.status(400).json({ message: "User already logged in" });
    // }

    // Generate the JWT token (custom function for token generation)
    await generateToken(res, user.id, user.role);

    // Respond with user data and success message
    res.status(200).json({
        message: "Login successful",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            deanery: user.deanery,
            parishId: user.parish_id,
        }
    });
});


export const logoutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // // Check if user exists
    // const userQuery = await pool.query(
    //     `SELECT users.id, users.name, users.email, users.password_hash, users.role
    //     FROM users
    //     WHERE email = $1`,
    //     [req.body.email]
    // );

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