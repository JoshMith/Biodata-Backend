"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.verifyEmail = exports.loginUser = exports.registerUser = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = require("../utils/helpers/generateToken");
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../utils/helpers/sendEmail");
exports.registerUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { first_name, last_name, middle_name, email, password, phone_number, parish_id } = req.body;
    // Check if user exists
    const [userExists] = yield db_config_1.default.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userExists.length > 0) {
        res.status(400).json({ message: "User already exists. Go to login..." });
        return;
    }
    // Hash password
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    // Insert into users table
    const newUser = yield db_config_1.default.query(`INSERT INTO users
            (first_name, last_name, middle_name, email, password_hash, role, phone_number, parish_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`, [first_name, last_name, middle_name, email, hashedPassword, "member", phone_number, parish_id]);
    const user = newUser.rows[0];
    // Fetch parish name for the user
    let parishName = null;
    if (user.parish_id) {
        const [parishResult] = yield db_config_1.default.query(`SELECT parish_name FROM parishes WHERE parish_id = $1`, [user.parish_id]);
        parishName = ((_a = parishResult[0]) === null || _a === void 0 ? void 0 : _a.parish_name) || null;
    }
    //generate verification token
    const emailToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    //send verification email
    yield (0, sendEmail_1.sendVerificationEmail)(user.email, emailToken);
    // Generate the JWT token (custom function for token generation)
    yield (0, generateToken_1.generateToken)(res, user.id, user.role);
    res.status(201).json({
        message: "User registered successfully.Please Chck your email to verify your account",
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
}));
exports.loginUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, password } = req.body;
    // Check if user exists in the database
    const [userQuery] = yield db_config_1.default.query(`SELECT users.id, users.first_name, users.last_name, users.middle_name, users.email, users.password_hash, users.role, users.parish_id
        FROM users
        WHERE email = $1`, [email]);
    // If no user is found, return an error
    if (userQuery.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    // Retrieve the user data from the query result
    const user = userQuery[0];
    // Check if user is verified
    const [verifiedQuery] = yield db_config_1.default.query(`SELECT verified FROM users WHERE email = $1`, [email]);
    if (verifiedQuery.length === 0 || !verifiedQuery[0].verified) {
        return res.status(401).json({ message: "Please verify your email before logging in." });
    }
    // Compare the entered password with the stored hash
    const isMatch = yield bcryptjs_1.default.compare(password, user.password_hash);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    // Fetch parish name for the user
    let parishName = null;
    if (user.parish_id) {
        const [parishResult] = yield db_config_1.default.query(`SELECT parish_name FROM parishes WHERE parish_id = $1`, [user.parish_id]);
        parishName = ((_a = parishResult[0]) === null || _a === void 0 ? void 0 : _a.parish_name) || null;
    }
    // Generate the JWT token (custom function for token generation)
    yield (0, generateToken_1.generateToken)(res, user.id, user.role);
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
}));
exports.verifyEmail = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("verify email called")
    const token = req.query.token;
    console.log("recived token");
    if (!token) {
        return res.status(400).json({ message: "Invalid or missing token" });
    }
    try {
        // Decode the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Update user as verified
        const [result] = yield db_config_1.default.query("UPDATE users SET verified = TRUE WHERE id = $1 RETURNING id, email, verified", [decoded.userId]);
        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "Email successfully verified", user: result[0] });
    }
    catch (error) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }
}));
exports.logoutUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
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
