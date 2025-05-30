import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

//This will handle all marriage-related operations 
// Create marriage
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
            first_name_groom,
            last_name_groom,
            occupation_groom,
            residence_groom,
            age_groom,
            first_name_bride,
            last_name_bride,
            occupation_bride,
            residence_bride,
            age_bride,
            first_name_witness1,
            last_name_witness1,
            first_name_witness2,
            last_name_witness2,
            registrar,
            ref_number,
            file_url
        } = req.body;

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
                first_name_groom,
                last_name_groom,
                occupation_groom,
                residence_groom,
                age_groom,
                first_name_bride,
                last_name_bride,
                occupation_bride,
                residence_bride,
                age_bride,
                first_name_witness1,
                last_name_witness1,
                first_name_witness2,
                last_name_witness2,
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
                first_name_groom,
                last_name_groom,
                occupation_groom,
                residence_groom,
                age_groom,
                first_name_bride,
                last_name_bride,
                occupation_bride,
                residence_bride,
                age_bride,
                first_name_witness1,
                last_name_witness1,
                first_name_witness2,
                last_name_witness2,
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

// Get marriage by user_id
export const getMarriageByUserId = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await pool.query("SELECT * FROM marriage WHERE user_id = $1", [userId]);

        // if (result.rows.length === 0) {
        //     res.status(400).json({ message: "No marriage records found for the given user_id" });
        //     return;
        // }

        res.json(result.rows);

    } catch (error) {
        console.error("Error getting marriage records by user_id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Update marriage
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
            first_name_groom,
            last_name_groom,
            occupation_groom,
            residence_groom,
            age_groom,
            first_name_bride,
            last_name_bride,
            occupation_bride,
            residence_bride,
            age_bride,
            first_name_witness1,
            last_name_witness1,
            first_name_witness2,
            last_name_witness2,
            registrar,
            ref_number,
            file_url
        } = req.body;

        const fieldsToUpdate = [];
        const values = [];
        let index = 1;

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
        if (first_name_groom) {
            fieldsToUpdate.push(`first_name_groom = $${index++}`);
            values.push(first_name_groom);
        }
        if (last_name_groom) {
            fieldsToUpdate.push(`last_name_groom = $${index++}`);
            values.push(last_name_groom);
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
        if (first_name_bride) {
            fieldsToUpdate.push(`first_name_bride = $${index++}`);
            values.push(first_name_bride);
        }
        if (last_name_bride) {
            fieldsToUpdate.push(`last_name_bride = $${index++}`);
            values.push(last_name_bride);
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
        if (first_name_witness1) {
            fieldsToUpdate.push(`first_name_witness1 = $${index++}`);
            values.push(first_name_witness1);
        }
        if (last_name_witness1) {
            fieldsToUpdate.push(`last_name_witness1 = $${index++}`);
            values.push(last_name_witness1);
        }
        if (first_name_witness2) {
            fieldsToUpdate.push(`first_name_witness2 = $${index++}`);
            values.push(first_name_witness2);
        }
        if (last_name_witness2) {
            fieldsToUpdate.push(`last_name_witness2 = $${index++}`);
            values.push(last_name_witness2);
        }
        if (registrar) {
            fieldsToUpdate.push(`registrar = $${index++}`);
            values.push(registrar);
        }
        if (ref_number) {
            fieldsToUpdate.push(`ref_number = $${index++}`);
            values.push(ref_number);
        }
        if (file_url) {
            fieldsToUpdate.push(`file_url = $${index++}`);
            values.push(file_url);
        }
        if (user_id) {
            fieldsToUpdate.push(`user_id = $${index++}`);
            values.push(user_id);
        }

        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields provided for update" });
            return;
        }

        values.push(id); // Add the marriage_id at the end for the WHERE clause
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