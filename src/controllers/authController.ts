import { Request, Response, NextFunction } from "express";
import pool from "../config/db.config";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/helpers/generateToken";
import asyncHandler from "../middlewares/asyncHandler";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/helpers/sendMail";
import { generateRegistrationNumber } from "../utils/helpers/generateRegNum";
import dotenv from "dotenv";

dotenv.config();

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        first_name,
        last_name,
        middle_name,
        email,
        password,
        phone_number,
        parish_id,
      } = req.body;

      // ✅ FIXED: Use ? for MySQL
      const [userExistsRows] = await pool.query(
        "SELECT id FROM users WHERE email = ?",
        [email],
      );

      // Convert to array properly for MySQL
      const userExistsArray = userExistsRows as any[];
      if (userExistsArray.length > 0) {
        res
          .status(400)
          .json({ message: "User already exists. Go to login..." });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const insertResult = await pool.query(
        `INSERT INTO users
                (first_name, last_name, middle_name, email, password_hash, role, phone_number, parish_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          first_name,
          last_name,
          middle_name,
          email,
          hashedPassword,
          "superuser",
          phone_number,
          parish_id,
        ],
      );

      // ✅ FIXED: Get insertId from MySQL result
      const insertId = (insertResult as any)[0]?.insertId;

      if (!insertId) {
        throw new Error("Failed to get user ID after insertion");
      }

      // ✅ FIXED: Fetch the user using the insertId
      const [userRows] = await pool.query("SELECT * FROM users WHERE id = ?", [
        insertId,
      ]);
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
          [user.parish_id],
        );
        const parishArray = parishRows as any[];
        parishName = parishArray[0]?.parish_name || null;
      }

      // Generate registration number
      const registration_number = await generateRegistrationNumber(user.id);

      // Update the user with registration number
      await pool.query("UPDATE users SET registration_number = ? WHERE id = ?", [registration_number, user.id]);

      // Generate verification token
      const emailToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" },
      );

      console.log("User registered successfully:", email); // Debug log

      // Send verification email (don't await if you want to continue)
      sendVerificationEmail(user.email, emailToken).catch((err) => {
        console.error("Email sending failed:", err);
      });


      // Generate the JWT token
      await generateToken(res, user.id, user.role);

      res.status(201).json({
        message:
          "User registered successfully. Please check your email to verify your account",
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
        },
      });
    } catch (error) {
      console.error("❌ Registration error:", error);

      res.status(500).json({
        message: "Internal server error during registration",
        error: (error as Error).message,
      });
    }
  },
);

export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Check if user exists in the database
    const [userQuery] = (await pool.query(
      `SELECT users.id, users.first_name, users.last_name, users.middle_name, users.email, users.password_hash, users.role, users.parish_id
        FROM users
        WHERE email = ?`,
      [email],
    )) as any;

    // If no user is found, return an error
    if ((userQuery as any[]).length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Retrieve the user data from the query result
    const user = (userQuery as any[])[0];

    // Check if user is verified
    const [verifiedQuery] = (await pool.query(
      `SELECT verified FROM users WHERE email = ?`,
      [email],
    )) as any;
    if (
      (verifiedQuery as any[]).length === 0 ||
      !(verifiedQuery as any[])[0].verified
    ) {
      return res
        .status(401)
        .json({
          message:
            "Please verify your email before logging in. Check your email for the verification link.",
        });
    }

    // Compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Fetch parish name for the user
    let parishName: string | null = null;
    if (user.parish_id) {
      const [parishResult] = (await pool.query(
        `SELECT parish_name FROM parishes WHERE parish_id = ?`,
        [user.parish_id],
      )) as any;
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
      },
    });
  },
);

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = req.query.token as string;
  console.log("Verification Token Received");

  if (!token) {
    return res.status(400).json({ message: "Invalid or missing token" });
  }

  try {
    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    //  Update user as verified
    const [result] = await pool.query(
      "UPDATE users SET verified = TRUE WHERE id = ?",
      [decoded.userId],
    );

    //  Check affectedRows
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    //  Fetch the updated user separately
    const [userRows] = await pool.query(
      "SELECT id, email, verified FROM users WHERE id = ?",
      [decoded.userId],
    );

    return res.status(200).json({
      message: "Email successfully verified",
      user: (userRows as any[])[0],
    });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
});

export const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if user is logged in
    if (!req.cookies.access_token && !req.cookies.refresh_token) {
      res.status(401).json({ message: "User not logged in!" });
      return;
    }

    // Clear access and refresh tokens for this specific user
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      domain: ".cbms.adnyeri.org",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      domain: ".cbms.adnyeri.org",
    });

    res.status(200).json({ message: "User logged out successfully" });

  },
);


// Request password reset - sends reset token via email
export const requestPasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      // Check if user exists
      const [userRows] = await pool.query(
        "SELECT id, email, first_name FROM users WHERE email = ?",
        [email]
      );

      if ((userRows as any[]).length === 0) {
        // Don't reveal if user exists or not for security
        res.status(200).json({
          message: "If that email exists, a reset link has been sent",
        });
        return;
      }

      const user = (userRows as any[])[0];

      // Generate reset token (valid for 15 minutes)
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
      );

      // Send reset email
      await sendPasswordResetEmail(user.email, resetToken, user.first_name);

      res.status(200).json({
        message: "If that email exists, a reset link has been sent",
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Verify reset token (optional - for checking token validity before showing form)
export const verifyResetToken = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const token = req.query.token as string;

      if (!token) {
        res.status(400).json({ message: "Reset token is required" });
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: number;
        email: string;
      };

      // Check if user still exists
      const [userRows] = await pool.query(
        "SELECT id, email FROM users WHERE id = ? AND email = ?",
        [decoded.userId, decoded.email]
      );

      if ((userRows as any[]).length === 0) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json({
        message: "Token is valid",
        email: decoded.email,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(400).json({ message: "Reset token has expired" });
      } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(400).json({ message: "Invalid reset token" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }
);

// Reset password with token
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      // Validation
      if (!token || !newPassword || !confirmPassword) {
        res.status(400).json({
          message: "Token, new password, and confirmation are required",
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ message: "Passwords do not match" });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          message: "Password must be at least 6 characters long",
        });
        return;
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          userId: number;
          email: string;
        };
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          res.status(400).json({ message: "Reset token has expired" });
          return;
        }
        res.status(400).json({ message: "Invalid reset token" });
        return;
      }

      // Check if user exists
      const [userRows] = await pool.query(
        "SELECT id, email FROM users WHERE id = ? AND email = ?",
        [decoded.userId, decoded.email]
      );

      if ((userRows as any[]).length === 0) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password in database
      const [result] = await pool.query(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        [hashedPassword, decoded.userId]
      );

      if ((result as any).affectedRows === 0) {
        res.status(500).json({ message: "Failed to update password" });
        return;
      }

      res.status(200).json({
        message: "Password has been reset successfully. You can now log in with your new password.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
