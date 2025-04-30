import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

//This will handle all eucharist-related operations 
//Create eucharist
export const createEucharist = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { eucharist_place, eucharist_date, user_id } = req.body;

        // First, dynamically verify the eucharist record exists:
        const eucharistCheck = await pool.query(
            "SELECT eucharist_id FROM eucharist WHERE eucharist_id = $1",
            [id]
        );

        if (eucharistCheck.rows.length > 0) {
            res.status(400).json({ message: "Eucharist record exists" });
            return
        }

        // Proceed to create eucharist
        const baptismResult = await pool.query(
            `INSERT INTO eucharist(eucharist_place, eucharist_date, user_id) 
             VALUES ($1, $2, $3) RETURNING *`,
            [eucharist_place, eucharist_date, user_id]
        );

        res.status(201).json({
            message: "Eucharist record created successfully",
            event: eucharistCheck.rows[0]
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


// Update eucharist
export const updateEucharist = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { baptism_place, eucharist_date, user_id } = req.body;

        const eucharistResult = await pool.query(
            `UPDATE eucharist SET eucharist_place = $1, eucharist_date = $2, user_id = $3
             WHERE eucharist_id = $4 RETURNING *`,
            [baptism_place, eucharist_date, user_id, id]
        );

        if (eucharistResult.rows.length === 0) {
            res.status(400).json({ message: "Eucharist record not found" });
            return
        }

        res.json({
            message: "Eucharist record updated successfully",
            book: eucharistResult.rows[0]
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