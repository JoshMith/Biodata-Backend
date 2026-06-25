import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

const FULL_ACCESS_ROLES = ['superadmin', 'superviewer'];
const DEANERY_ACCESS_ROLES = ['deaneryviewer'];
const OWN_PARISH_ROLES = ['parishadmin', 'parishviewer', 'secretary', 'editor'];
const MEMBER_ROLE = ['member'];

//This will handle all eucharist-related operations 
//Create eucharist
export const createEucharist = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { eucharist_place, eucharist_date, user_id } = req.body;

        // Optional: Check if a eucharist record already exists for this user and date/place
        // (Remove or adjust this logic as needed for your business rules)
        const [eucharistCheck] = await pool.query(
            "SELECT eucharist_id FROM eucharist WHERE user_id = ? AND eucharist_date = ?",
            [user_id, eucharist_date]
        );

        if ((eucharistCheck as any[]).length > 0) {
            res.status(400).json({ message: "Eucharist record already exists for this user and date" });
            return;
        }

        // Proceed to create eucharist
        const [eucharistResult] = await pool.query(
            `INSERT INTO eucharist(eucharist_place, eucharist_date, user_id) 
             VALUES (?, ?, ?) `,
            [eucharist_place, eucharist_date, user_id]
        );

        res.status(201).json({
            message: "Eucharist record created successfully",
            eucharist: (eucharistResult as any[])[0]
        });

    } catch (error) {
        console.error("Error creating eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//Get All eucharist
export const getEucharist = asyncHandler(async (req: any, res: Response) => {
    try {
        const role = req.user?.role;
        const parishId = req.user?.parish_id;
        const userId = req.user?.id;

        let query = "SELECT e.* FROM eucharist e JOIN users u ON e.user_id = u.id";
        const params: any[] = [];

        if (FULL_ACCESS_ROLES.includes(role)) {
            // full access
        } else if (DEANERY_ACCESS_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " JOIN parishes p ON u.parish_id = p.parish_id WHERE p.deanery = (SELECT deanery FROM parishes WHERE parish_id = ?)";
            params.push(parishId);
        } else if (OWN_PARISH_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " WHERE u.parish_id = ?";
            params.push(parishId);
        } else if (MEMBER_ROLE.includes(role)) {
            if (!userId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " WHERE e.user_id = ?";
            params.push(userId);
        } else {
            return res.status(403).json({ message: "Forbidden" });
        }

        query += " ORDER BY e.eucharist_id ASC";
        const [result] = await pool.query(query, params);
        res.json(result as any[]);
    } catch (error) {
        console.error("Error getting eucharist records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Get single eucharist
export const getEucharistById = asyncHandler(async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const role = req.user?.role;
        const parishId = req.user?.parish_id;
        const userId = req.user?.id;

        let query = "SELECT e.* FROM eucharist e JOIN users u ON e.user_id = u.id";
        const params: any[] = [];

        if (FULL_ACCESS_ROLES.includes(role)) {
            query += " WHERE e.eucharist_id = ?";
            params.push(id);
        } else if (DEANERY_ACCESS_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " JOIN parishes p ON u.parish_id = p.parish_id WHERE e.eucharist_id = ? AND p.deanery = (SELECT deanery FROM parishes WHERE parish_id = ?)";
            params.push(id, parishId);
        } else if (OWN_PARISH_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " WHERE e.eucharist_id = ? AND u.parish_id = ?";
            params.push(id, parishId);
        } else if (MEMBER_ROLE.includes(role)) {
            if (!userId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " WHERE e.eucharist_id = ? AND e.user_id = ?";
            params.push(id, userId);
        } else {
            return res.status(403).json({ message: "Forbidden" });
        }

        const [result] = await pool.query(query, params) as any[];

        if ((result as any[]).length === 0) {
            res.status(400).json({ message: "Eucharist record not found" });
            return
        }

        res.json((result as any[])[0]);

    } catch (error) {
        console.error("Error getting eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get eucharist by user_id
export const getEucharistByUserId = asyncHandler(async (req: any, res: Response) => {
    try {
        const { userId: requestedUserId } = req.params;
        const role = req.user?.role;
        const parishId = req.user?.parish_id;
        const userId = req.user?.id;

        if (MEMBER_ROLE.includes(role) && String(requestedUserId) !== String(userId)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        let query = "SELECT e.* FROM eucharist e JOIN users u ON e.user_id = u.id";
        const params: any[] = [];

        if (FULL_ACCESS_ROLES.includes(role)) {
            query += " WHERE e.user_id = ?";
            params.push(requestedUserId);
        } else if (DEANERY_ACCESS_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " JOIN parishes p ON u.parish_id = p.parish_id WHERE e.user_id = ? AND p.deanery = (SELECT deanery FROM parishes WHERE parish_id = ?)";
            params.push(requestedUserId, parishId);
        } else if (OWN_PARISH_ROLES.includes(role)) {
            if (!parishId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            query += " WHERE e.user_id = ? AND u.parish_id = ?";
            params.push(requestedUserId, parishId);
        } else if (MEMBER_ROLE.includes(role)) {
            query += " WHERE e.user_id = ?";
            params.push(requestedUserId);
        } else {
            return res.status(403).json({ message: "Forbidden" });
        }

        const [result] = await pool.query(query, params);
        res.json(result as any[]);

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
            fieldsToUpdate.push(`eucharist_place = ?`);
            values.push(eucharist_place);
        }
        if (eucharist_date) {
            fieldsToUpdate.push(`eucharist_date = ?`);
            values.push(eucharist_date);
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
        const query = `UPDATE eucharist SET ${fieldsToUpdate.join(", ")} WHERE eucharist_id = ?`;

        const [eucharistResult] = await pool.query(query, values);

        if ((eucharistResult as any[]).length === 0) {
            res.status(400).json({ message: "Eucharist record update failed" });
            return;
        }

        res.json({
            message: "Eucharist record updated successfully",
            eucharist: (eucharistResult as any[])[0]
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

        const [eucharistResult] = await pool.query(
            "DELETE FROM eucharist WHERE eucharist_id = ?",
            [id]
        );

        if ((eucharistResult as any[]).length === 0) {
            res.status(400).json({ message: "Eucharist record not found" });
            return
        }

        res.json({
            message: "Eucharist record deleted successfully",
            book: (eucharistResult as any[])[0]
        });

    } catch (error) {
        console.error("Error deleting eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
);