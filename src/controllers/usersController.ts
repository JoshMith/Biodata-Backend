import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"
import bcrypt from "bcrypt"


// Add a new user
export const addUser = asyncHandler(async (req, res) => {
    try {
        const {
            email,password,roles,phone_number,first_name,last_name,middle_name,mother,father,siblings,
            birth_place,subcounty,birth_date,tribe,clan,residence,parish_id
        } = req.body;

        // Check if email already exists
        const emailCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (emailCheck.rows.length > 0) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert the new user
        const newUser = await pool.query(
            `INSERT INTO users (
                email, password_hash, roles, phone_number, first_name, last_name, middle_name, mother, father, siblings,
                birth_place, subcounty, birth_date, tribe, clan, residence, parish_id
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
            ) RETURNING *`,
            [
                email,hashedPassword,roles,phone_number,first_name,last_name,middle_name,mother,father,siblings,
                birth_place,subcounty,birth_date,tribe,clan,residence,parish_id
            ]
        );

        res.status(201).json({
            message: "User successfully added",
            user: newUser.rows[0],
        });
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Get All users 
export const getUsers = asyncHandler(async (req, res) => {
    try {
        const
            result = await pool.query("SELECT * FROM users ORDER BY id ASC ")
        res.json(result.rows)
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})


//Get total number of users 
export const getUserCount = asyncHandler(async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT COUNT(*) AS usercount FROM users"
        );
        const userCount: number = parseInt(result.rows[0].usercount, 10);
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
        const result = await pool.query(
            "SELECT * FROM users WHERE TRIM(LOWER(name)) = TRIM(LOWER($1))",
            [name]
        );
        if (result.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user by name:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Get single user by Id
export const getUserById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params
        const
            result = await pool.query("SELECT * FROM users WHERE id = $1", [id])
        if (result.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return
        }
        res.json(result.rows[0])
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
            email,password,roles,phone_number,first_name,last_name,middle_name,mother,father,siblings,
            birth_place,subcounty,birth_date,tribe,clan,residence,parish_id
        } = req.body;

        // Check if user exists
        const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        if (userCheck.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        // Prepare fields for update
        const fieldsToUpdate = [];
        const values = [];
        let index = 1;

        if (email) {
            fieldsToUpdate.push(`email=$${index++}`);
            values.push(email);
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            fieldsToUpdate.push(`password_hash=$${index++}`);
            values.push(hashedPassword);
        }
        if (roles) {
            fieldsToUpdate.push(`roles=$${index++}`);
            values.push(roles);
        }
        if (phone_number) {
            fieldsToUpdate.push(`phone_number=$${index++}`);
            values.push(phone_number);
        }
        if (first_name) {
            fieldsToUpdate.push(`first_name=$${index++}`);
            values.push(first_name);
        }
        if (last_name) {
            fieldsToUpdate.push(`last_name=$${index++}`);
            values.push(last_name);
        }
        if (middle_name) {
            fieldsToUpdate.push(`middle_name=$${index++}`);
            values.push(middle_name);
        }
        if (mother) {
            fieldsToUpdate.push(`mother=$${index++}`);
            values.push(mother);
        }
        if (father) {
            fieldsToUpdate.push(`father=$${index++}`);
            values.push(father);
        }
        if (siblings) {
            fieldsToUpdate.push(`siblings=$${index++}`);
            values.push(siblings);
        }
        if (birth_place) {
            fieldsToUpdate.push(`birth_place=$${index++}`);
            values.push(birth_place);
        }
        if (subcounty) {
            fieldsToUpdate.push(`subcounty=$${index++}`);
            values.push(subcounty);
        }
        if (birth_date) {
            fieldsToUpdate.push(`birth_date=$${index++}`);
            values.push(birth_date);
        }
        if (tribe) {
            fieldsToUpdate.push(`tribe=$${index++}`);
            values.push(tribe);
        }
        if (clan) {
            fieldsToUpdate.push(`clan=$${index++}`);
            values.push(clan);
        }
        if (residence) {
            fieldsToUpdate.push(`residence=$${index++}`);
            values.push(residence);
        }
        if (parish_id) {
            fieldsToUpdate.push(`parish_id=$${index++}`);
            values.push(parish_id);
        }

        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields to update" });
            return;
        }

        values.push(id);

        // Update the user
        const updatedUser = await pool.query(
            `UPDATE users SET ${fieldsToUpdate.join(", ")} WHERE id = $${index} RETURNING *`,
            values
        );

        res.json({
            message: "User successfully updated",
            user: updatedUser.rows[0],
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
        const
            result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id])
        if (result.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return
        }
        res.json({ message: "User deleted" })
    } catch (error) {
        console.error("Error fetching users count:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})
