import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

//This will handle all eucharist-related operations 
//Create eucharist
export const createEucharist = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { eucharist_place, eucharist_date, user_id } = req.body;

        // Optional: Check if a eucharist record already exists for this user and date/place
        // (Remove or adjust this logic as needed for your business rules)
        const eucharistCheck = await pool.query(
            "SELECT eucharist_id FROM eucharist WHERE user_id = $1 AND eucharist_date = $2",
            [user_id, eucharist_date]
        );

        if (eucharistCheck.rows.length > 0) {
            res.status(400).json({ message: "Eucharist record already exists for this user and date" });
            return;
        }

        // Proceed to create eucharist
        const eucharistResult = await pool.query(
            `INSERT INTO eucharist(eucharist_place, eucharist_date, user_id) 
             VALUES ($1, $2, $3) RETURNING *`,
            [eucharist_place, eucharist_date, user_id]
        );

        res.status(201).json({
            message: "Eucharist record created successfully",
            eucharist: eucharistResult.rows[0]
        });

    } catch (error) {
        console.error("Error creating eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//Get All eucharist
export const getEucharist = asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM eucharist ORDER BY eucharist_id ASC ");
        res.json(result.rows);
    } catch (error) {
        console.error("Error getting eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Get single eucharist
export const getEucharistById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM eucharist WHERE eucharist_id = $1", [id]);

        if (result.rows.length === 0) {
            res.status(400).json({ message: "Eucharist record not found" });
            return
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error getting eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get eucharist by user_id
export const getEucharistByUserId = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await pool.query("SELECT * FROM eucharist WHERE user_id = $1", [userId]);

        // if (result.rows.length === 0) {
        //     res.status(400).json({ message: "No eucharist records found for the given user_id" });
        //     return;
        // }

        res.json(result.rows);

    } catch (error) {
        console.error("Error getting eucharist records by user_id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update eucharist
export const updateEucharist = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { eucharist_place, eucharist_date, user_id } = req.body;

        const fieldsToUpdate = [];
        const values = [];
        let index = 1;

        if (eucharist_place) {
            fieldsToUpdate.push(`eucharist_place = $${index++}`);
            values.push(eucharist_place);
        }
        if (eucharist_date) {
            fieldsToUpdate.push(`eucharist_date = $${index++}`);
            values.push(eucharist_date);
        }
        if (user_id) {
            fieldsToUpdate.push(`user_id = $${index++}`);
            values.push(user_id);
        }

        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields provided for update" });
            return;
        }

        values.push(id);
        const query = `UPDATE eucharist SET ${fieldsToUpdate.join(", ")} WHERE eucharist_id = $${index} RETURNING *`;

        const eucharistResult = await pool.query(query, values);

        if (eucharistResult.rows.length === 0) {
            res.status(400).json({ message: "Eucharist record update failed" });
            return;
        }

        res.json({
            message: "Eucharist record updated successfully",
            eucharist: eucharistResult.rows[0]
        });

    } catch (error) {
        console.error("Error updating eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Delete eucharist
export const deleteEucharist = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const eucharistResult = await pool.query(
            "DELETE FROM eucharist WHERE eucharist_id = $1 RETURNING *",
            [id]
        );

        if (eucharistResult.rows.length === 0) {
            res.status(400).json({ message: "Eucharist record not found" });
            return
        }

        res.json({
            message: "Eucharist record deleted successfully",
            book: eucharistResult.rows[0]
        });

    } catch (error) {
        console.error("Error deleting eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
);