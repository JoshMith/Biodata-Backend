import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

//This will handle all marriage-related operations 
//Create marriage
export const createMarriage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const {
            user_id,
            marriage_date,
            marriage_certificate_no,
            entry_no,
            county,
            sub_county,
            place_of_marriage,
            name1,
            age1,
            marital_status1,
            occupation1,
            residence1,
            name2,
            age2,
            marital_status2,
            occupation2,
            residence2,
            witnessed_by,
            registrar,
            ref_number
        } = req.body;

        // Insert new marriage record
        const marriageResult = await pool.query(
            `INSERT INTO marriage(
                user_id,
                marriage_date,
                marriage_certificate_no,
                entry_no,
                county,
                sub_county,
                place_of_marriage,
                name1,
                age1,
                marital_status1,
                occupation1,
                residence1,
                name2,
                age2,
                marital_status2,
                occupation2,
                residence2,
                witnessed_by,
                registrar,
                ref_number
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
            ) RETURNING *`,
            [
                user_id,
                marriage_date,
                marriage_certificate_no,
                entry_no,
                county,
                sub_county,
                place_of_marriage,
                name1,
                age1,
                marital_status1,
                occupation1,
                residence1,
                name2,
                age2,
                marital_status2,
                occupation2,
                residence2,
                witnessed_by,
                registrar,
                ref_number
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
            marriage_certificate_no,
            entry_no,
            county,
            sub_county,
            place_of_marriage,
            name1,
            age1,
            marital_status1,
            occupation1,
            residence1,
            name2,
            age2,
            marital_status2,
            occupation2,
            residence2,
            witnessed_by,
            registrar,
            ref_number
        } = req.body;

        const fieldsToUpdate: string[] = [];
        const values: any[] = [];
        let index = 1;

        if (user_id ) {
            fieldsToUpdate.push(`user_id = $${index++}`);
            values.push(user_id);
        }
        if (marriage_date ) {
            fieldsToUpdate.push(`marriage_date = $${index++}`);
            values.push(marriage_date);
        }
        if (marriage_certificate_no ) {
            fieldsToUpdate.push(`marriage_certificate_no = $${index++}`);
            values.push(marriage_certificate_no);
        }
        if (entry_no ) {
            fieldsToUpdate.push(`entry_no = $${index++}`);
            values.push(entry_no);
        }
        if (county ) {
            fieldsToUpdate.push(`county = $${index++}`);
            values.push(county);
        }
        if (sub_county ) {
            fieldsToUpdate.push(`sub_county = $${index++}`);
            values.push(sub_county);
        }
        if (place_of_marriage ) {
            fieldsToUpdate.push(`place_of_marriage = $${index++}`);
            values.push(place_of_marriage);
        }
        if (name1 ) {
            fieldsToUpdate.push(`name1 = $${index++}`);
            values.push(name1);
        }
        if (age1 ) {
            fieldsToUpdate.push(`age1 = $${index++}`);
            values.push(age1);
        }
        if (marital_status1 ) {
            fieldsToUpdate.push(`marital_status1 = $${index++}`);
            values.push(marital_status1);
        }
        if (occupation1 ) {
            fieldsToUpdate.push(`occupation1 = $${index++}`);
            values.push(occupation1);
        }
        if (residence1 ) {
            fieldsToUpdate.push(`residence1 = $${index++}`);
            values.push(residence1);
        }
        if (name2 ) {
            fieldsToUpdate.push(`name2 = $${index++}`);
            values.push(name2);
        }
        if (age2 ) {
            fieldsToUpdate.push(`age2 = $${index++}`);
            values.push(age2);
        }
        if (marital_status2 ) {
            fieldsToUpdate.push(`marital_status2 = $${index++}`);
            values.push(marital_status2);
        }
        if (occupation2 ) {
            fieldsToUpdate.push(`occupation2 = $${index++}`);
            values.push(occupation2);
        }
        if (residence2 ) {
            fieldsToUpdate.push(`residence2 = $${index++}`);
            values.push(residence2);
        }
        if (witnessed_by ) {
            fieldsToUpdate.push(`witnessed_by = $${index++}`);
            values.push(witnessed_by);
        }
        if (registrar ) {
            fieldsToUpdate.push(`registrar = $${index++}`);
            values.push(registrar);
        }
        if (ref_number ) {
            fieldsToUpdate.push(`ref_number = $${index++}`);
            values.push(ref_number);
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