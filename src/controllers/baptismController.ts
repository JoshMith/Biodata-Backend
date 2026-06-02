import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

//This will handle all baptism-related operations 
// Create baptism
export const createBaptism = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { user_id, parish, baptism_date, baptism_number, minister, sponsor } = req.body;

        // Optionally, check if a baptism record already exists for this user
        const [baptismRows] = await pool.query(
            "SELECT baptism_id FROM baptism WHERE user_id = ?",
            [user_id]
        );

        if ((baptismRows as any[]).length > 0) {
            res.status(400).json({ message: "Baptism record for this user already exists" });
            return;
        }

        // Proceed to create baptism
        const [baptismResultRows] = await pool.query(
            `INSERT INTO baptism(user_id, parish, baptism_date, baptism_number, minister, sponsor) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, parish, baptism_date, baptism_number, minister, sponsor]
        );

        res.status(201).json({
            message: "Baptism record created successfully",
            baptism: (baptismResultRows as any)[0]
        });

    } catch (error) {
        console.error("Error creating baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//Get All baptism
export const getBaptism = asyncHandler(async (req: any, res: Response) => {
    try {
        const role = req.user?.role;
        const parishId = req.user?.parish_id;
        const userId = req.user?.id;

        let query = "SELECT b.* FROM baptism b JOIN users u ON b.user_id = u.id";
        const params: any[] = [];

        if (role === 'editor') {
            query += " WHERE u.parish_id = ?";
            params.push(parishId);
        } else if (role === 'member') {
            query += " WHERE b.user_id = ?";
            params.push(userId);
        }

        query += " ORDER BY b.baptism_id ASC";
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error getting baptism records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Get single baptism
export const getBaptismById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT * FROM baptism WHERE baptism_id = ?", [id]);

        if ((rows as any[]).length === 0) {
            res.status(400).json({ message: "Baptism record not found" });
            return;
        }

        res.json((rows as any[])[0]);

    } catch (error) {
        console.error("Error getting baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get baptism by user_id
export const getBaptismByUserId = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const [rows] = await pool.query("SELECT * FROM baptism WHERE user_id = ?", [userId]);

        // if ((rows as any[]).length === 0) {
        //     res.status(400).json({ message: "No baptism record found for the given user" });
        //     return;
        // }

        res.json(rows);

    } catch (error) {
        console.error("Error getting baptism record by user_id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update baptism
export const updateBaptism = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { parish, baptism_date, baptism_number, minister, sponsor, user_id } = req.body;

        const fieldsToUpdate = [];
        const values = [];

        if (parish) {
            fieldsToUpdate.push(`parish = ?`);
            values.push(parish);
        }
        if (baptism_date) {
            fieldsToUpdate.push(`baptism_date = ?`);
            values.push(baptism_date);
        }
        if (baptism_number) {
            fieldsToUpdate.push(`baptism_number = ?`);
            values.push(baptism_number);
        }
        if (minister) {
            fieldsToUpdate.push(`minister = ?`);
            values.push(minister);
        }
        if (sponsor) {
            fieldsToUpdate.push(`sponsor = ?`);
            values.push(sponsor);
        }
        if (user_id) {
            fieldsToUpdate.push(`user_id = ?`);
            values.push(user_id);
        }

        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields to update" });
            return;
        }

        values.push(id);

        const [result] = await pool.query(
            `UPDATE baptism SET ${fieldsToUpdate.join(", ")} WHERE baptism_id = ?`,
            values
        );

        if ((result as any).affectedRows === 0) {
            res.status(400).json({ message: "Baptism record update failed" });
            return;
        }

        res.json({
            message: "Baptism record updated successfully"
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

        const [result] = await pool.query(
            "DELETE FROM baptism WHERE baptism_id = ?",
            [id]
        );

        if ((result as any).affectedRows === 0) {
            res.status(400).json({ message: "Baptism record not found" });
            return;
        }

        res.json({
            message: "Baptism record deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
);