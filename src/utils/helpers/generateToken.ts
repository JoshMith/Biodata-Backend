import { Response } from "express";
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

//Debugging  - check if env var are loaded correctly  
// console.log("JWT_SECRET: ", process.env.JWT_SECRET )
// console.log("REFRESH_TOKEN_SECRET: ", process.env.REFRESH_TOKEN_SECRET )

export const generateToken = (res: Response, userId: string, roles: string) => {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!jwtSecret || !refreshSecret) {
        throw new Error("JWT_SECRET or REFRESH_TOKEN_SECRET is not defined in environment variables");
    }

    try {
        //Lets generate a short - lived acccess token for 60 minutes
        // sign(payload: string | Buffer | object, secretOrPrivateKey: null, options?: jwt.SignOptions & { algorithm: "none"; }): string
        const accessToken = jwt.sign({ userId, roles }, jwtSecret, { expiresIn: "60m" })
        //Lets generate a long - lived acccess token for 30days
        const refreshToken = jwt.sign({ userId }, refreshSecret, { expiresIn: "30d" })

        //set Access token as HTTP-Only secure cookie 
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: true, // Secure in production
            sameSite: "none",
            maxAge: 60 * 60 * 1000, // 60 minutes
        });


        // Set Refresh Token as HTTP-Only Secure Cookie
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });


        return { accessToken, refreshToken }

    } catch (error) {
        console.error("Error generating JWT:", error);
        throw new Error("Error generating authentication tokens");
    }
}