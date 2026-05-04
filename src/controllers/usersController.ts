import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import { sendVerificationEmail } from "../utils/helpers/sendMail";
import { generateRegistrationNumber } from "../utils/helpers/generateRegNum"


// Add a new user
export const addUser = asyncHandler(async (req, res) => {
    try {
        const {
            email, password, phone_number, first_name, last_name, middle_name, mother, father,
            birth_place, subcounty, birth_date, tribe, clan, domicile, parish_id
        } = req.body;

        // Check if email already exists
        const [emailCheck] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if ((emailCheck as any[]).length > 0) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert the new user
        const [newUser] = await pool.query(
            `INSERT INTO users (
                email, password_hash, role, phone_number, first_name, last_name, middle_name, mother, father, 
                birth_place, subcounty, birth_date, tribe, clan, domicile, parish_id
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )`,
            [
                email, hashedPassword, "member", phone_number, first_name, last_name, middle_name, mother, father,
                birth_place, subcounty, birth_date, tribe, clan, domicile, parish_id
            ]
        );

        const insertResult = newUser as any;
        const userId = insertResult.insertId;

        // Generate registration number
        const registration_number = await generateRegistrationNumber(userId);

        // Update the user with registration number
        await pool.query("UPDATE users SET registration_number = ? WHERE id = ?", [registration_number, userId]);

        //generate verification token
        const emailToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET!, { expiresIn: "1h" });

        //send verification email
        // await sendVerificationEmail(email, emailToken)

        // Generate the JWT token (custom function for token generation)
        // await generateToken(res, userId, "member");


        res.status(201).json({
            message: "User successfully added",
            user: { id: userId, email },
        });
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Get All users 
export const getUsers = asyncHandler(async (req, res) => {
    try {
        const [result] = await pool.query("SELECT * FROM users ORDER BY id ASC ");
        res.json((result as any[]));
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})


//Get total number of users 
export const getUserCount = asyncHandler(async (_req: Request, res: Response) => {
    try {
        const [result] = await pool.query(
            "SELECT COUNT(*) AS usercount FROM users"
        );
        const userCount: number = parseInt((result as any[])[0].usercount, 10);
        res.json({ userCount });
        // console.log("User count:", userCount);
    } catch (error) {
        console.error("Error fetching user count:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//Get single user by name
export const getUserByName = asyncHandler(async (req, res) => {
    try {
        const { name } = req.params;
        const [result] = await pool.query(
            "SELECT * FROM users WHERE TRIM(LOWER(name)) = TRIM(LOWER(?))",
            [name]
        );
        if ((result as any[]).length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        res.json((result as any[])[0]);
    } catch (error) {
        console.error("Error fetching user by name:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Get single user by Id
export const getUserById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params
        const [result] = await pool.query("SELECT * FROM users WHERE id = ?", [id])
        if ((result as any[]).length === 0) {
            res.status(400).json({ message: "User not found" });
            return
        }
        res.json((result as any[])[0])
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})



//update user
export const updateUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const {
            email, password, role, phone_number, registration_number, first_name, last_name, middle_name, mother, father,
            birth_place, subcounty, birth_date, tribe, clan, domicile, parish_id
        } = req.body;

        // Check if user exists
        const [userCheck] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
        if ((userCheck as any[]).length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        // Prepare fields for update
        const fieldsToUpdate = [];
        const values = [];

        if (email) {
            fieldsToUpdate.push(`email= ?`);
            values.push(email);
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            fieldsToUpdate.push(`password_hash=?`);
            values.push(hashedPassword);
        }
        if (role) {
            fieldsToUpdate.push(`role=?`);
            values.push(role);
        }
        if (phone_number) {
            fieldsToUpdate.push(`phone_number=?`);
            values.push(phone_number);
        }
        if (registration_number) {
            fieldsToUpdate.push(`registration_number=?`);
            values.push(registration_number);
        }
        if (first_name) {
            fieldsToUpdate.push(`first_name= ?`);
            values.push(first_name);
        }
        if (last_name) {
            fieldsToUpdate.push(`last_name= ?`);
            values.push(last_name);
        }
        if (middle_name) {
            fieldsToUpdate.push(`middle_name= ?`);
            values.push(middle_name);
        }
        if (mother) {
            fieldsToUpdate.push(`mother= ?`);
            values.push(mother);
        }
        if (father) {
            fieldsToUpdate.push(`father= ?`);
            values.push(father);
        }
        if (birth_place) {
            fieldsToUpdate.push(`birth_place= ?`);
            values.push(birth_place);
        }
        if (subcounty) {
            fieldsToUpdate.push(`subcounty= ?`);
            values.push(subcounty);
        }
        if (birth_date) {
            fieldsToUpdate.push(`birth_date= ?`);
            values.push(birth_date);
        }
        if (tribe) {
            fieldsToUpdate.push(`tribe= ?`);
            values.push(tribe);
        }
        if (clan) {
            fieldsToUpdate.push(`clan= ?`);
            values.push(clan);
        }
        if (domicile) {
            fieldsToUpdate.push(`domicile= ?`);
            values.push(domicile);
        }
        if (parish_id) {
            fieldsToUpdate.push(`parish_id= ?`);
            values.push(parish_id);
        }

        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields to update" });
            return;
        }

        values.push(id);

        // Update the user
        const [updatedUser] = await pool.query(
            `UPDATE users SET ${fieldsToUpdate.join(", ")} WHERE id = ?`,
            values
        );

        res.json({
            message: "User successfully updated",
            user: (updatedUser as any[])[0],
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//delete user
export const deleteUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params
        const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id])
        if ((result as any[]).length === 0) {
            res.status(400).json({ message: "User not found" });
            return
        }
        res.json({ message: "User deleted" })
    } catch (error) {
        console.error("Error Deleting this user", error);
        res.status(500).json({ message: "Internal server error" });
    }
})
