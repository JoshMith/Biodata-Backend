import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

//This will handle all baptism-related operations 
// Create baptism
export const createBaptism = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { user_id, parish, baptism_date, minister, sponsor } = req.body;

        // Optionally, check if a baptism record already exists for this user
        const baptismCheck = await pool.query(
            "SELECT baptism_id FROM baptism WHERE user_id = $1",
            [user_id]
        );

        if (baptismCheck.rows.length > 0) {
            res.status(400).json({ message: "Baptism record for this user already exists" });
            return;
        }

        // Proceed to create baptism
        const baptismResult = await pool.query(
            `INSERT INTO baptism(user_id, parish, baptism_date, minister, sponsor) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, parish, baptism_date, minister, sponsor]
        );

        res.status(201).json({
            message: "Baptism record created successfully",
            baptism: baptismResult.rows[0]
        });

    } catch (error) {
        console.error("Error creating baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//Get All baptism
export const getBaptism = asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM baptism ORDER BY baptism_id ASC ");
        res.json(result.rows);
    } catch (error) {
        console.error("Error getting baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Get single baptism
export const getBaptismById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM baptism WHERE baptism_id = $1", [id]);

        if (result.rows.length === 0) {
            res.status(400).json({ message: "Baptism record not found" });
            return
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error getting baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get baptism by user_id
export const getBaptismByUserId = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await pool.query("SELECT * FROM baptism WHERE user_id = $1", [userId]);

        // if (result.rows.length === 0) {
        //     res.status(400).json({ message: "No baptism record found for the given user" });
        //     return;
        // }

        res.json(result.rows);

    } catch (error) {
        console.error("Error getting baptism record by user_id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update baptism
export const updateBaptism = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { parish, baptism_date, minister, sponsor, user_id } = req.body;

        const fieldsToUpdate = [];
        const values = [];
        let index = 1;

        if (parish) {
            fieldsToUpdate.push(`parish = $${index++}`);
            values.push(parish);
        }
        if (baptism_date) {
            fieldsToUpdate.push(`baptism_date = $${index++}`);
            values.push(baptism_date);
        }
        if (minister) {
            fieldsToUpdate.push(`minister = $${index++}`);
            values.push(minister);
        }
        if (sponsor) {
            fieldsToUpdate.push(`sponsor = $${index++}`);
            values.push(sponsor);
        }
        if (user_id) {
            fieldsToUpdate.push(`user_id = $${index++}`);
            values.push(user_id);
        }

        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields to update" });
            return;
        }

        values.push(id);

        const baptismResult = await pool.query(
            `UPDATE baptism SET ${fieldsToUpdate.join(", ")} WHERE baptism_id = $${index} RETURNING *`,
            values
        );

        if (baptismResult.rows.length === 0) {
            res.status(400).json({ message: "Baptism record update failed" });
            return;
        }

        res.json({
            message: "Baptism record updated successfully",
            baptism: baptismResult.rows[0]
        });

    } catch (error) {
        console.error("Error updating baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Delete baptism
export const deleteBaptism = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const baptismResult = await pool.query(
            "DELETE FROM baptism WHERE baptism_id = $1 RETURNING *",
            [id]
        );

        if (baptismResult.rows.length === 0) {
            res.status(400).json({ message: "Baptism record not found" });
            return
        }

        res.json({
            message: "Baptism record deleted successfully",
            book: baptismResult.rows[0]
        });

    } catch (error) {
        console.error("Error deleting baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
);