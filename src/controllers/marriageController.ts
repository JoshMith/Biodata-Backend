import { Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
import pool from '../config/db.config';

// CREATE a new marriage record
export const createMarriage = asyncHandler(async (req: Request, res: Response) => {
    const {
        user_id,
        civil_marriage_certificate_number,
        submission_location,
        submission_sub_county,
        submission_county,
        marriage_date,
        conducted_by,
        witness1_name,
        witness1_son_of,
        witness1_clan,
        witness2_name,
        witness2_son_of,
        witness2_clan
    } = req.body;

    try {
        const [result] = await pool.query(
            `INSERT INTO marriages (
                user_id, civil_marriage_certificate_number, submission_location, submission_sub_county, submission_county,
                marriage_date, conducted_by, witness1_name, witness1_son_of, witness1_clan, witness2_name, witness2_son_of, witness2_clan
            ) VALUES (
                ?,?,?,?,?,?,?,?,?,?,?,?,?
            )`,
            [
                user_id,
                civil_marriage_certificate_number,
                submission_location,
                submission_sub_county,
                submission_county,
                marriage_date,
                conducted_by,
                witness1_name,
                witness1_son_of,
                witness1_clan,
                witness2_name,
                witness2_son_of,
                witness2_clan
            ]
        );

        // Return the inserted ID
        res.status(201).json({
            message: 'Marriage created successfully',
            marriage_id: (result as any).insertId
        });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                message: 'A marriage record with this certificate number already exists'
            });
            return;
        }
        throw error;
    }
});

// READ all marriage records
export const getAllMarriages = asyncHandler(async (_req: Request, res: Response) => {
    const [result] = await pool.query('SELECT * FROM marriages');
    res.json(result as any[]);
});

// READ all marriage records for a specific user
export const getUserMarriages = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const [result] = await pool.query('SELECT * FROM marriages WHERE user_id = ?', [user_id]);
    if ((result as any[]).length === 0) {
        return res.status(404).json({ error: 'No marriage records found for this user' });
    }
    res.json(result as any[]);
});

// Get full marriage details with parties and documents
export const getFullMarriageByUserId = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params;

    const query = `
        SELECT 
            m.*,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'party_id', mp.party_id,
                    'party_type', mp.party_type,
                    'full_name', mp.full_name,
                    'marital_status', mp.marital_status,
                    'domicile', mp.domicile,
                    'father_name', mp.father_name,
                    'mother_name', mp.mother_name
                )
            ) AS parties
        FROM marriages m
        LEFT JOIN marriage_parties mp ON m.marriage_id = mp.marriage_id
        WHERE m.user_id = ?
        GROUP BY m.marriage_id
        ORDER BY m.marriage_date DESC
    `;

    const [result] = await pool.query(query, [user_id]);

    if ((result as any[]).length === 0) {
        return res.status(404).json({
            error: 'No marriage records found for this user'
        });
    }

    res.json(result as any[]);
});

// READ a single marriage record by ID
export const getMarriageById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const [result] = await pool.query('SELECT * FROM marriages WHERE marriage_id = ?', [id]);
    if ((result as any[]).length === 0) {
        return res.status(404).json({ error: 'Marriage record not found' });
    }
    res.json((result as any[])[0]);
});

// UPDATE a marriage record
export const updateMarriage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            civil_marriage_certificate_number,
            submission_location,
            submission_sub_county,
            submission_county,
            marriage_date,
            conducted_by,
            witness1_name,
            witness1_son_of,
            witness1_clan,
            witness2_name,
            witness2_son_of,
            witness2_clan
        } = req.body;

        const fieldsToUpdate: string[] = [];
        const values: any[] = [];

        if (civil_marriage_certificate_number !== undefined) {
            fieldsToUpdate.push(`certificate_number = ?`);
            values.push(civil_marriage_certificate_number);
        }
        if (submission_location !== undefined) {
            fieldsToUpdate.push(`submission_location = ?`);
            values.push(submission_location);
        }
        if (submission_sub_county !== undefined) {
            fieldsToUpdate.push(`submission_sub_county = ?`);
            values.push(submission_sub_county);
        }
        if (submission_county !== undefined) {
            fieldsToUpdate.push(`submission_county = ?`);
            values.push(submission_county);
        }
        if (marriage_date !== undefined) {
            fieldsToUpdate.push(`marriage_date = ?`);
            values.push(marriage_date);
        }
        if (conducted_by !== undefined) {
            fieldsToUpdate.push(`conducted_by = ?`);
            values.push(conducted_by);
        }
        if (witness1_name !== undefined) {
            fieldsToUpdate.push(`witness1_name = ?`);
            values.push(witness1_name);
        }
        if (witness1_son_of !== undefined) {
            fieldsToUpdate.push(`witness1_son_of = ?`);
            values.push(witness1_son_of);
        }
        if (witness1_clan !== undefined) {
            fieldsToUpdate.push(`witness1_clan = ?`);
            values.push(witness1_clan);
        }
        if (witness2_name !== undefined) {
            fieldsToUpdate.push(`witness2_name = ?`);
            values.push(witness2_name);
        }
        if (witness2_son_of !== undefined) {
            fieldsToUpdate.push(`witness2_son_of = ?`);
            values.push(witness2_son_of);
        }
        if (witness2_clan !== undefined) {
            fieldsToUpdate.push(`witness2_clan = ?`);
            values.push(witness2_clan);
        }
        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields provided for update" });
            return;
        }

        // Always update updated_at
        fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);

        values.push(id);
        const query = `UPDATE marriages SET ${fieldsToUpdate.join(", ")} WHERE marriage_id = ?`;

        const [result] = await pool.query(query, values);

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Marriage record not found' });
        }

        res.json({
            message: "Marriage record updated successfully",
            marriage_id: id
        });

    } catch (error) {
        console.error("Error updating marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE a marriage record
export const deleteMarriage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM marriages WHERE marriage_id = ?', [id]);
    if ((result as any).affectedRows === 0) {
        return res.status(404).json({ error: 'Marriage record not found' });
    }
    res.json({ message: 'Marriage record deleted successfully' });
});