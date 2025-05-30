import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

//This will handle all confirmation-related operations 
//Create confirmation
export const createConfirmation = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { confirmation_place, confirmation_date, confirmation_no, user_id, minister } = req.body;

        // Optionally, check for duplicate confirmation_no for the same user
        const duplicateCheck = await pool.query(
            "SELECT confirmation_id FROM confirmation WHERE confirmation_no = $1 AND user_id = $2",
            [confirmation_no, user_id]
        );

        if (duplicateCheck.rows.length > 0) {
            res.status(400).json({ message: "Confirmation record already exists for this user and number" });
            return;
        }

        // Proceed to create confirmation
        const confirmationResult = await pool.query(
            `INSERT INTO confirmation(confirmation_place, confirmation_date, confirmation_no, user_id, minister) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [confirmation_place, confirmation_date, confirmation_no, user_id, minister]
        );

        res.status(201).json({
            message: "Confirmation record created successfully",
            confirmation: confirmationResult.rows[0]
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

// Get confirmation by user_id
export const getConfirmationByUserId = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await pool.query("SELECT * FROM confirmation WHERE user_id = $1", [userId]);

        // if (result.rows.length === 0) {
        //     res.status(400).json({ message: "No confirmation record found for the given user_id" });
        //     return;
        // }

        res.json(result.rows);

    } catch (error) {
        console.error("Error getting confirmation records by user_id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Update confirmation
export const updateConfirmation = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { confirmation_place, confirmation_date, confirmation_no, user_id, minister } = req.body;

        const fieldsToUpdate = [];
        const values = [];
        let index = 1;

        if (confirmation_place) {
            fieldsToUpdate.push(`confirmation_place = $${index++}`);
            values.push(confirmation_place);
        }
        if (confirmation_date) {
            fieldsToUpdate.push(`confirmation_date = $${index++}`);
            values.push(confirmation_date);
        }
        if (confirmation_no) {
            fieldsToUpdate.push(`confirmation_no = $${index++}`);
            values.push(confirmation_no);
        }
        if (minister) {
            fieldsToUpdate.push(`minister = $${index++}`);
            values.push(minister);
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
        const query = `UPDATE confirmation SET ${fieldsToUpdate.join(", ")} WHERE confirmation_id = $${index} RETURNING *`;

        const confirmationResult = await pool.query(query, values);

        if (confirmationResult.rows.length === 0) {
            res.status(400).json({ message: "Confirmation record update failed" });
            return;
        }

        res.json({
            message: "Confirmation record updated successfully",
            confirmation: confirmationResult.rows[0]
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