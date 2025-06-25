import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"
import multer, { FileFilterCallback } from 'multer'
import path from 'path'

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: (arg0: null, arg1: string) => void) => {
        cb(null, 'uploads/marriage-certificates/') // Make sure this directory exists
    },
    filename: (req: any, file: { originalname: string }, cb: (arg0: null, arg1: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'marriage-cert-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
        }
    }
});

// Middleware for single file upload
export const uploadMarriageCertificate = upload.single('marriage_certificate')

// Create marriage with file upload support
export const createMarriage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const {
            user_id,
            marriage_date,
            place_of_marriage,
            marriage_certificate_no,
            entry_no,
            county,
            subcounty,
            firstname_groom,
            lastname_groom,
            occupation_groom,
            residence_groom,
            age_groom,
            firstname_bride,
            lastname_bride,
            occupation_bride,
            residence_bride,
            age_bride,
            firstname_witness1,
            lastname_witness1,
            firstname_witness2,
            lastname_witness2,
            registrar,
            ref_number
        } = req.body;

        // Get file URL if file was uploaded
        const file_url = req.file ? `/uploads/marriage-certificates/${req.file.filename}` : null;

        // Insert new marriage record
        const marriageResult = await pool.query(
            `INSERT INTO marriage(
                user_id,
                marriage_date,
                place_of_marriage,
                marriage_certificate_no,
                entry_no,
                county,
                subcounty,
                firstname_groom,
                lastname_groom,
                occupation_groom,
                residence_groom,
                age_groom,
                firstname_bride,
                lastname_bride,
                occupation_bride,
                residence_bride,
                age_bride,
                firstname_witness1,
                lastname_witness1,
                firstname_witness2,
                lastname_witness2,
                registrar,
                ref_number,
                file_url
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24
            ) RETURNING *`,
            [
                user_id,
                marriage_date,
                place_of_marriage,
                marriage_certificate_no,
                entry_no,
                county,
                subcounty,
                firstname_groom,
                lastname_groom,
                occupation_groom,
                residence_groom,
                age_groom,
                firstname_bride,
                lastname_bride,
                occupation_bride,
                residence_bride,
                age_bride,
                firstname_witness1,
                lastname_witness1,
                firstname_witness2,
                lastname_witness2,
                registrar,
                ref_number,
                file_url
            ]
        );

        res.status(201).json({
            message: "Marriage record created successfully",
            marriage: marriageResult.rows[0]
        });

    } catch (error) {
        console.error("Error creating marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update marriage with file upload support
export const updateMarriage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            user_id,
            marriage_date,
            place_of_marriage,
            marriage_certificate_no,
            entry_no,
            county,
            subcounty,
            firstname_groom,
            lastname_groom,
            occupation_groom,
            residence_groom,
            age_groom,
            firstname_bride,
            lastname_bride,
            occupation_bride,
            residence_bride,
            age_bride,
            firstname_witness1,
            lastname_witness1,
            firstname_witness2,
            lastname_witness2,
            registrar,
            ref_number
        } = req.body;

        const fieldsToUpdate = [];
        const values = [];
        let index = 1;

        // Handle file upload
        if (req.file) {
            const file_url = `/uploads/marriage-certificates/${req.file.filename}`;
            fieldsToUpdate.push(`file_url = $${index++}`);
            values.push(file_url);
        }

        // Dynamic field updates (same as before)
        if (marriage_date) {
            fieldsToUpdate.push(`marriage_date = $${index++}`);
            values.push(marriage_date);
        }
        if (place_of_marriage) {
            fieldsToUpdate.push(`place_of_marriage = $${index++}`);
            values.push(place_of_marriage);
        }
        if (marriage_certificate_no) {
            fieldsToUpdate.push(`marriage_certificate_no = $${index++}`);
            values.push(marriage_certificate_no);
        }
        if (entry_no) {
            fieldsToUpdate.push(`entry_no = $${index++}`);
            values.push(entry_no);
        }
        if (county) {
            fieldsToUpdate.push(`county = $${index++}`);
            values.push(county);
        }
        if (subcounty) {
            fieldsToUpdate.push(`subcounty = $${index++}`);
            values.push(subcounty);
        }
        if (firstname_groom) {
            fieldsToUpdate.push(`firstname_groom = $${index++}`);
            values.push(firstname_groom);
        }
        if (lastname_groom) {
            fieldsToUpdate.push(`lastname_groom = $${index++}`);
            values.push(lastname_groom);
        }
        if (occupation_groom) {
            fieldsToUpdate.push(`occupation_groom = $${index++}`);
            values.push(occupation_groom);
        }
        if (residence_groom) {
            fieldsToUpdate.push(`residence_groom = $${index++}`);
            values.push(residence_groom);
        }
        if (age_groom) {
            fieldsToUpdate.push(`age_groom = $${index++}`);
            values.push(age_groom);
        }
        if (firstname_bride) {
            fieldsToUpdate.push(`firstname_bride = $${index++}`);
            values.push(firstname_bride);
        }
        if (lastname_bride) {
            fieldsToUpdate.push(`lastname_bride = $${index++}`);
            values.push(lastname_bride);
        }
        if (occupation_bride) {
            fieldsToUpdate.push(`occupation_bride = $${index++}`);
            values.push(occupation_bride);
        }
        if (residence_bride) {
            fieldsToUpdate.push(`residence_bride = $${index++}`);
            values.push(residence_bride);
        }
        if (age_bride) {
            fieldsToUpdate.push(`age_bride = $${index++}`);
            values.push(age_bride);
        }
        if (firstname_witness1) {
            fieldsToUpdate.push(`firstname_witness1 = $${index++}`);
            values.push(firstname_witness1);
        }
        if (lastname_witness1) {
            fieldsToUpdate.push(`lastname_witness1 = $${index++}`);
            values.push(lastname_witness1);
        }
        if (firstname_witness2) {
            fieldsToUpdate.push(`firstname_witness2 = $${index++}`);
            values.push(firstname_witness2);
        }
        if (lastname_witness2) {
            fieldsToUpdate.push(`lastname_witness2 = $${index++}`);
            values.push(lastname_witness2);
        }
        if (registrar) {
            fieldsToUpdate.push(`registrar = $${index++}`);
            values.push(registrar);
        }
        if (ref_number) {
            fieldsToUpdate.push(`ref_number = $${index++}`);
            values.push(ref_number);
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
        const query = `UPDATE marriage SET ${fieldsToUpdate.join(", ")} WHERE marriage_id = $${index} RETURNING *`;

        const marriageResult = await pool.query(query, values);

        if (marriageResult.rows.length === 0) {
            res.status(400).json({ message: "Marriage record update failed" });
            return;
        }

        res.json({
            message: "Marriage record updated successfully",
            marriage: marriageResult.rows[0]
        });

    } catch (error) {
        console.error("Error updating marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Keep your existing GET and DELETE methods unchanged
export const getMarriage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM marriage ORDER BY marriage_id ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("Error getting marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export const getMarriageById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM marriage WHERE marriage_id = $1", [id]);

        if (result.rows.length === 0) {
            res.status(400).json({ message: "Marriage record not found" });
            return;
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error getting marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export const getMarriageByUserId = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await pool.query("SELECT * FROM marriage WHERE user_id = $1", [userId]);
        res.json(result.rows);

    } catch (error) {
        console.error("Error getting marriage records by user_id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export const deleteMarriage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const marriageResult = await pool.query(
            "DELETE FROM marriage WHERE marriage_id = $1 RETURNING *",
            [id]
        );

        if (marriageResult.rows.length === 0) {
            res.status(400).json({ message: "Marriage record not found" });
            return;
        }

        res.json({
            message: "Marriage record deleted successfully",
            marriage: marriageResult.rows[0]
        });

    } catch (error) {
        console.error("Error deleting marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});