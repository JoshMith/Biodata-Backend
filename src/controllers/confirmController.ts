import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

//This will handle all confirmation-related operations 
//Create confirmation
export const createConfirmation = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { confirmation_place, confirmation_date, confirmation_no, user_id } = req.body;

        // First, dynamically verify the confirmation record exists:
        const confirmationCheck = await pool.query(
            "SELECT confirmation_id FROM confirmation WHERE confirmation_id = $1",
            [id]
        );

        if (confirmationCheck.rows.length > 0) {
            res.status(400).json({ message: "Confirmation record exists" });
            return
        }

        // Proceed to create confirmation
        const confirmationResult = await pool.query(
            `INSERT INTO confirmation(confirmation_place, confirmation_date, confirmation_no, user_id ) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [confirmation_place, confirmation_date, confirmation_no, user_id ]
        );

        res.status(201).json({
            message: "Confirmation record created successfully",
            event: confirmationCheck.rows[0]
        });

    } catch (error) {
        console.error("Error creating confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//Get All confirmation
export const getConfirmation = asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM confirmation ORDER BY confirmation_id ASC ");
        res.json(result.rows);
    } catch (error) {
        console.error("Error getting confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Get single confirmation
export const getConfirmationById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM confirmation WHERE confirmation_id = $1", [id]);

        if (result.rows.length === 0) {
            res.status(400).json({ message: "Confirmation record not found" });
            return
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error getting confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Update confirmation
export const updateConfirmation = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { confirmation_place, confirmation_date, confirmation_no, user_id } = req.body;

        const confirmationResult = await pool.query(
            `UPDATE books SET confirmation_place = $1, baptism_date = $2, baptised_by = $3, administrator = $4, user_id = $5
             WHERE confirmation_id = $6 RETURNING *`,
            [confirmation_place, confirmation_date, confirmation_no,  user_id, id]
        );

        if (confirmationResult.rows.length === 0) {
            res.status(400).json({ message: "Confirmation record not found" });
            return
        }

        res.json({
            message: "Confirmation record updated successfully",
            book: confirmationResult.rows[0]
        });

    } catch (error) {
        console.error("Error updating confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Delete confirmation
export const deleteConfirmation = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const confirmationResult = await pool.query(
            "DELETE FROM confirmation WHERE confirmation_id = $1 RETURNING *",
            [id]
        );

        if (confirmationResult.rows.length === 0) {
            res.status(400).json({ message: "Confirmation record not found" });
            return
        }

        res.json({
            message: "Confirmation record deleted successfully",
            book: confirmationResult.rows[0]
        });

    } catch (error) {
        console.error("Error deleting confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
);