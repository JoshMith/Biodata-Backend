import { Response } from "express";
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

export const generateToken = (res: Response, userId: string, role: string) => {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!jwtSecret || !refreshSecret) {
        throw new Error("JWT_SECRET or REFRESH_TOKEN_SECRET is not defined in environment variables");
    }

    try {
        const accessToken = jwt.sign({ userId, role }, jwtSecret, { expiresIn: "24h" })
        const refreshToken = jwt.sign({ userId }, refreshSecret, { expiresIn: "30d" })

        // Cookie settings for production with proxy
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "none" as const,
            path: "/", // IMPORTANT: Set path to root so it's sent to /api too
            domain: ".cbms.adnyeri.org", // IMPORTANT: Use dot prefix for subdomains
        };

        // Set Access token
        res.cookie("access_token", accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        // Set Refresh Token
        res.cookie("refresh_token", refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return { accessToken, refreshToken }

    } catch (error) {
        console.error("Error generating JWT:", error);
        throw new Error("Error generating authentication tokens");
    }
}