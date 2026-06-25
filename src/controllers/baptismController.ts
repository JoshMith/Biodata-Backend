import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

const FULL_ACCESS_ROLES = ['superadmin', 'superviewer'];
const DEANERY_ACCESS_ROLES = ['deaneryviewer'];
const OWN_PARISH_ROLES = ['parishadmin', 'parishviewer', 'secretary', 'editor'];
const MEMBER_ROLE = ['member'];

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

        let query = "SELECT b.* FROM baptism b";
        const params: any[] = [];

        if (FULL_ACCESS_ROLES.includes(role)) {
            // full access; no filters
        } else if (DEANERY_ACCESS_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " JOIN users u ON b.user_id = u.id JOIN parishes p ON u.parish_id = p.parish_id WHERE p.deanery = (SELECT deanery FROM parishes WHERE parish_id = ?)";
            params.push(parishId);
        } else if (OWN_PARISH_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " JOIN users u ON b.user_id = u.id WHERE u.parish_id = ?";
            params.push(parishId);
        } else if (MEMBER_ROLE.includes(role)) {
            if (!userId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " WHERE b.user_id = ?";
            params.push(userId);
        } else {
            return res.status(403).json({ message: "Forbidden" });
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
export const getBaptismById = asyncHandler(async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const role = req.user?.role;
        const parishId = req.user?.parish_id;
        const userId = req.user?.id;

        let query = "SELECT b.* FROM baptism b";
        const params: any[] = [];

        if (FULL_ACCESS_ROLES.includes(role)) {
            query += " WHERE b.baptism_id = ?";
            params.push(id);
        } else if (DEANERY_ACCESS_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " JOIN users u ON b.user_id = u.id JOIN parishes p ON u.parish_id = p.parish_id WHERE b.baptism_id = ? AND p.deanery = (SELECT deanery FROM parishes WHERE parish_id = ?)";
            params.push(id, parishId);
        } else if (OWN_PARISH_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " JOIN users u ON b.user_id = u.id WHERE b.baptism_id = ? AND u.parish_id = ?";
            params.push(id, parishId);
        } else if (MEMBER_ROLE.includes(role)) {
            if (!userId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " WHERE b.baptism_id = ? AND b.user_id = ?";
            params.push(id, userId);
        } else {
            return res.status(403).json({ message: "Forbidden" });
        }

        const [rows] = await pool.query(query, params);

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
export const getBaptismByUserId = asyncHandler(async (req: any, res: Response) => {
    try {
        const { userId } = req.params;
        const role = req.user?.role;
        const parishId = req.user?.parish_id;
        const currentUserId = String(req.user?.id ?? "");
        const targetUserId = String(userId);

        let query = "SELECT b.* FROM baptism b";
        const params: any[] = [];

        if (FULL_ACCESS_ROLES.includes(role)) {
            query += " WHERE b.user_id = ?";
            params.push(userId);
        } else if (DEANERY_ACCESS_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " JOIN users u ON b.user_id = u.id JOIN parishes p ON u.parish_id = p.parish_id WHERE b.user_id = ? AND p.deanery = (SELECT deanery FROM parishes WHERE parish_id = ?)";
            params.push(userId, parishId);
        } else if (OWN_PARISH_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " JOIN users u ON b.user_id = u.id WHERE b.user_id = ? AND u.parish_id = ?";
            params.push(userId, parishId);
        } else if (MEMBER_ROLE.includes(role)) {
            if (currentUserId !== targetUserId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " WHERE b.user_id = ?";
            params.push(userId);
        } else {
            return res.status(403).json({ message: "Forbidden" });
        }

        const [rows] = await pool.query(query, params);
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