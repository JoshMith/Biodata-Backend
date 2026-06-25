import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

const FULL_ACCESS_ROLES = ['superadmin', 'superviewer'];
const DEANERY_ACCESS_ROLES = ['deaneryviewer'];
const OWN_PARISH_ROLES = ['parishadmin', 'parishviewer', 'secretary', 'editor'];
const MEMBER_ROLE = ['member'];

//This will handle all confirmation-related operations 
//Create confirmation
export const createConfirmation = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { confirmation_place, confirmation_date, confirmation_no, user_id, minister } = req.body;

        // Optionally, check for duplicate confirmation_no for the same user
        const [duplicateCheck] = await pool.query(
            "SELECT confirmation_id FROM confirmation WHERE confirmation_no = ? AND user_id = ?",
            [confirmation_no, user_id]
        );

        if ((duplicateCheck as any[]).length > 0) {
            res.status(400).json({ message: "Confirmation record already exists for this user and number" });
            return;
        }

        // Proceed to create confirmation
        const [confirmationResult] = await pool.query(
            `INSERT INTO confirmation(confirmation_place, confirmation_date, confirmation_no, user_id, minister) 
             VALUES (?, ?, ?, ?, ?) `,
            [confirmation_place, confirmation_date, confirmation_no, user_id, minister]
        );

        res.status(201).json({
            message: "Confirmation record created successfully",
            confirmation: (confirmationResult as any[])[0]
        });

    } catch (error) {
        console.error("Error creating confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//Get All confirmation
export const getConfirmation = asyncHandler(async (req: any, res: Response) => {
    try {
        const role = req.user?.role;
        const parishId = req.user?.parish_id;
        const userId = req.user?.id;

        let query = "SELECT c.* FROM confirmation c JOIN users u ON c.user_id = u.id";
        const params: any[] = [];
        const conditions: string[] = [];

        if (FULL_ACCESS_ROLES.includes(role)) {
            // full access; no filters
        } else if (DEANERY_ACCESS_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " JOIN parishes p ON u.parish_id = p.parish_id";
            conditions.push("p.deanery = (SELECT deanery FROM parishes WHERE parish_id = ?)");
            params.push(parishId);
        } else if (OWN_PARISH_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            conditions.push("u.parish_id = ?");
            params.push(parishId);
        } else if (MEMBER_ROLE.includes(role)) {
            if (!userId) {
                return res.status(403).json({ message: "Forbidden" });
            }

            conditions.push("c.user_id = ?");
            params.push(userId);
        } else {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += " ORDER BY c.confirmation_id ASC";
        const [result] = await pool.query(query, params);
        res.json(result as any[]);
    } catch (error) {
        console.error("Error getting confirmation records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Get single confirmation
export const getConfirmationById = asyncHandler(async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const role = req.user?.role;
        const parishId = req.user?.parish_id;
        const userId = req.user?.id;
        const deanery = req.user?.deanery;

        let query = "SELECT c.* FROM confirmation c JOIN users u ON c.user_id = u.id";
        const params: any[] = [id];
        const conditions: string[] = ["c.confirmation_id = ?"];

        if (FULL_ACCESS_ROLES.includes(role)) {
            // Full access
        } else if (DEANERY_ACCESS_ROLES.includes(role)) {
            if (!deanery) {
                res.status(403).json({ message: "Access denied" });
                return;
            }
            query += " JOIN parishes p ON u.parish_id = p.parish_id";
            conditions.push("p.deanery = ?");
            params.push(deanery);
        } else if (OWN_PARISH_ROLES.includes(role)) {
            if (!parishId) {
                res.status(403).json({ message: "Access denied" });
                return;
            }
            conditions.push("u.parish_id = ?");
            params.push(parishId);
        } else if (MEMBER_ROLE.includes(role)) {
            if (!userId) {
                res.status(403).json({ message: "Access denied" });
                return;
            }
            conditions.push("c.user_id = ?");
            params.push(userId);
        } else {
            res.status(403).json({ message: "Access denied" });
            return;
        }

        query += ` WHERE ${conditions.join(" AND ")}`;
        const [result] = await pool.query(query, params) as any[];

        if ((result as any[]).length === 0) {
            res.status(400).json({ message: "Confirmation record not found" });
            return;
        }

        res.json((result as any[])[0]);

    } catch (error) {
        console.error("Error getting confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get confirmation by user_id
export const getConfirmationByUserId = asyncHandler(async (req: any, res: Response) => {
    try {
        const { userId } = req.params;
        const role = req.user?.role;
        const parishId = req.user?.parish_id;

        let query = "SELECT c.* FROM confirmation c JOIN users u ON c.user_id = u.id";
        const params: any[] = [userId];
        const conditions: string[] = ["c.user_id = ?"];

        if (FULL_ACCESS_ROLES.includes(role)) {
            // full access; no filters
        } else if (DEANERY_ACCESS_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " JOIN parishes p ON c.parish = p.parish_id WHERE p.deanery = (SELECT deanery FROM parishes WHERE parish_id = ?)";
            params.push(parishId);
        } else if (OWN_PARISH_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " WHERE c.parish = ?";
            params.push(parishId);
        } else if (MEMBER_ROLE.includes(role)) {
            if (!userId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " WHERE c.user_id = ?";
            params.push(userId);
        } else {
            return res.status(403).json({ message: "Forbidden" });
        }

        query += ` WHERE ${conditions.join(" AND ")}`;
        const [result] = await pool.query(query, params);

        res.json(result as any[]);

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
            fieldsToUpdate.push(`confirmation_place = ?`);
            values.push(confirmation_place);
        }
        if (confirmation_date) {
            fieldsToUpdate.push(`confirmation_date = ?`);
            values.push(confirmation_date);
        }
        if (confirmation_no) {
            fieldsToUpdate.push(`confirmation_no = ?`);
            values.push(confirmation_no);
        }
        if (minister) {
            fieldsToUpdate.push(`minister = ?`);
            values.push(minister);
        }
        if (user_id) {
            fieldsToUpdate.push(`user_id = ?`);
            values.push(user_id);
        }


        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields provided for update" });
            return;
        }

        values.push(id);
        const query = `UPDATE confirmation SET ${fieldsToUpdate.join(", ")} WHERE confirmation_id = ?`;

        const [confirmationResult] = await pool.query(query, values) as any[];

        if (confirmationResult.affectedRows === 0) {
            res.status(404).json({ message: "Confirmation record not found" });
            return;
        }

        // Fetch the updated record
        const [updated] = await pool.query('SELECT * FROM confirmation WHERE confirmation_id = ?', [id]);

        res.json({
            message: "Confirmation record updated successfully",
            confirmation: (updated as any[])[0]
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

        const [confirmationResult] = await pool.query(
            "DELETE FROM confirmation WHERE confirmation_id = ?",
            [id]
        );

        if ([confirmationResult as any].length === 0) {
            res.status(400).json({ message: "Confirmation record not found" });
            return
        }

        res.json({
            message: "Confirmation record deleted successfully",
            confirmation: (confirmationResult as any[])[0]
        });

    } catch (error) {
        console.error("Error deleting confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
);