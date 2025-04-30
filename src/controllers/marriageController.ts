import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

//This will handle all marriage-related operations 
//Create marriage
export const createMarriage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { spouse_name, marriage_place, marriage_date, marriage_no, user_id } = req.body;

        // First, dynamically verify the marriage record exists:
        const marriageCheck = await pool.query(
            "SELECT marriage_id FROM marriage WHERE marriage_id = $1",
            [id]
        );

        if (marriageCheck.rows.length > 0) {
            res.status(400).json({ message: "Marriage record exists" });
            return
        }

        // Proceed to create marriage
        const marriageResult = await pool.query(
            `INSERT INTO marriage(spouse_name, marriage_place, marriage_date, marriage_no, user_id) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [spouse_name, marriage_place, marriage_date, marriage_no, user_id]
        );

        res.status(201).json({
            message: "Marriage record created successfully",
            event: marriageCheck.rows[0]
        });

    } catch (error) {
        console.error("Error creating marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//Get All marriages
export const getMarriage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM marriage ORDER BY marriage_id ASC ");
        res.json(result.rows);
    } catch (error) {
        console.error("Error getting marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Get single marriage
export const getMarriageById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM marriage WHERE marriage_id = $1", [id]);

        if (result.rows.length === 0) {
            res.status(400).json({ message: "Marriage record not found" });
            return
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error getting marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Update marriage
export const updateMarriage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { spouse_name, marriage_place, marriage_date, marriage_no, user_id } = req.body;

        const marriageResult = await pool.query(
            `UPDATE books SET baptism_place = $1, baptism_date = $2, baptised_by = $3, administrator = $4, user_id = $5
             WHERE baptism_id = $6 RETURNING *`,
            [spouse_name, marriage_place, marriage_date, marriage_no, user_id, id]
        );

        if (marriageResult.rows.length === 0) {
            res.status(400).json({ message: "Marriage record not found" });
            return
        }

        res.json({
            message: "Marriage record updated successfully",
            book: marriageResult.rows[0]
        });

    } catch (error) {
        console.error("Error updating marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Delete marriage
export const deleteMarriage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const marriageResult = await pool.query(
            "DELETE FROM marriage WHERE marriage_id = $1 RETURNING *",
            [id]
        );

        if (marriageResult.rows.length === 0) {
            res.status(400).json({ message: "Marriage record not found" });
            return
        }

        res.json({
            message: "Marriage record deleted successfully",
            book: marriageResult.rows[0]
        });

    } catch (error) {
        console.error("Error deleting marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
);