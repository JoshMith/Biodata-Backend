import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"
import bcrypt from "bcrypt"


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



//Get total number of users 
export const getUserCount = asyncHandler(async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) AS userCount FROM users');
        const count = parseInt(result.rows[0].userCount, 10);
        res.json({ count });
        console.log('User count:', count);
    } catch (error) {
        console.error("Error fetching user count:", error);
        res.status(500).json({ message: "Internal server error", error: error });
    }
});

//update user

export const updateUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, father, mother, tribe, clan, birth_place, birth_date, sub_county, residence } = req.body;

        // Check if user exists
        const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        if (userCheck.rows.length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        //before updating a user, we need to hash the passwords
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Update the user
        const updatedUser = await pool.query(
            "UPDATE users SET name=$1, email=$2, password_hash=$3, role=$4, father=$5, mother=$6, tribe=$7, clan=$8, birth_place=$9, birth_date=$10, sub_county=$11, residence=$12 WHERE id = $13 RETURNING *",
            [name, email, hashedPassword, role, father, mother, tribe, clan, birth_place, birth_date, sub_county, residence, id]
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
