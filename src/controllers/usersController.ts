import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"
import bcrypt from "bcrypt"


// Add a new user
export const addUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, role, father, mother, tribe, clan, birth_place, birth_date, sub_county, residence, deanery, parish_id } = req.body;

        // Check if email already exists
        const emailCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (emailCheck.rows.length > 0) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }

        // Optionally, check if parish_id exists in parish table
        // if (parish_id) {
        //     const parishResult = await pool.query("SELECT parish_id FROM parish WHERE parish_id = $1", [parish_id]);
        //     if (parishResult.rows.length === 0) {
        //         res.status(400).json({ message: "Parish not found" });
        //         return;
        //     }
        // }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert the new user
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password_hash, role, father, mother, tribe, clan, birth_place, birth_date, sub_county, residence, deanery, parish_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *",
            [name, email, hashedPassword, role, father, mother, tribe, clan, birth_place, birth_date, sub_county, residence, deanery, parish_id]
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
        const { name, email, password, role, father, mother, tribe, clan, birth_place, birth_date, sub_county, residence, deanery, parish_id } = req.body;

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

        if (name) {
            fieldsToUpdate.push(`name=$${index++}`);
            values.push(name);
        }
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
        if (role) {
            fieldsToUpdate.push(`role=$${index++}`);
            values.push(role);
        }
        if (father) {
            fieldsToUpdate.push(`father=$${index++}`);
            values.push(father);
        }
        if (mother) {
            fieldsToUpdate.push(`mother=$${index++}`);
            values.push(mother);
        }
        if (tribe) {
            fieldsToUpdate.push(`tribe=$${index++}`);
            values.push(tribe);
        }
        if (clan) {
            fieldsToUpdate.push(`clan=$${index++}`);
            values.push(clan);
        }
        if (birth_place) {
            fieldsToUpdate.push(`birth_place=$${index++}`);
            values.push(birth_place);
        }
        if (birth_date) {
            fieldsToUpdate.push(`birth_date=$${index++}`);
            values.push(birth_date);
        }
        if (sub_county) {
            fieldsToUpdate.push(`sub_county=$${index++}`);
            values.push(sub_county);
        }
        if (residence) {
            fieldsToUpdate.push(`residence=$${index++}`);
            values.push(residence);
        }
        if (deanery) {
            fieldsToUpdate.push(`deanery=$${index++}`);
            values.push(deanery);
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
