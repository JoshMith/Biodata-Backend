import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "../asyncHandler";
import { UserRequest } from "../../utils/types/userTypes";
import pool from "../../config/db.config";

//Auth middleware to protect routes
export const protect = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    let token;

    //get the token from cookies
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    //trying to get token from Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    //if no token found
    if (!token) {
      res
        .status(401)
        .json({ message: "Not Authorized: No Token. Go to Login" });
      return;
    }

    try {
      //we have the token but we nneed to verify it
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }

      //verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

      // console.log("Decoded JWT:", decoded);
      if (!decoded || !decoded.userId) {
        res.status(401).json({ message: "Not authorized, token invalid" });
        return;
      }

      //get the user from database
      const [userQuery] = await pool.query("SELECT * FROM users WHERE id = ?", [
        decoded.userId,
      ]);

      if ((userQuery as any[]).length === 0) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      //attach the user to the request
      req.user = (userQuery as any[])[0];
      console.log("Authenticated user:", {
        id: req.user?.id,
        email: req.user?.email,
        role: req.user?.role,
      }); // Should show the actual user data

      next(); //proceed to next thing
    } catch (error) {
      console.error("JWT Error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  },
);
