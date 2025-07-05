import { Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
import pool from '../config/db.config';

// CREATE a new marriage record
export const createMarriage = asyncHandler(async (req: Request, res: Response) => {
    const {
        user_id,
        certificate_number,
        submission_location,
        submission_sub_county,
        submission_county,
        marriage_date,
        marriage_entry_number,
        registrar_certification_number,
        special_license_number,
        conducted_by,
        private_parties_count,
        private_parties_names,
    } = req.body;

    const result = await pool.query(
        `INSERT INTO marriages (
            user_id, certificate_number, submission_location, submission_sub_county, submission_county,
            marriage_date, marriage_entry_number, registrar_certification_number, special_license_number,
            conducted_by, private_parties_count, private_parties_names
        ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
        ) RETURNING *`,
        [
            user_id,
            certificate_number,
            submission_location,
            submission_sub_county,
            submission_county,
            marriage_date,
            marriage_entry_number,
            registrar_certification_number,
            special_license_number,
            conducted_by,
            private_parties_count,
            private_parties_names,
        ]
    );
    res.status(201).json(result.rows[0]);
});

// READ all marriage records
export const getAllMarriages = asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query('SELECT * FROM marriages');
    res.json(result.rows);
});

// READ all marriage records for a specific user
export const getUserMarriages = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const result = await pool.query('SELECT * FROM marriages WHERE user_id = $1', [user_id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No marriage records found for this user' });
    }
    res.json(result.rows);
});

// Add this new function to your marriages2Controller.ts
export const getFullMarriageByUserId = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params;
    
    const query = `
        SELECT 
            m.*,
            json_agg(
                DISTINCT jsonb_build_object(
                    'party_id', mp.party_id,
                    'party_type', mp.party_type,
                    'full_name', mp.full_name,
                    'age', mp.age,
                    'marital_status', mp.marital_status,
                    'residence_address', mp.residence_address,
                    'residence_county', mp.residence_county,
                    'residence_sub_county', mp.residence_sub_county,
                    'occupation', mp.occupation,
                    'father_name', mp.father_name,
                    'father_occupation', mp.father_occupation,
                    'father_residence', mp.father_residence,
                    'mother_name', mp.mother_name,
                    'mother_occupation', mp.mother_occupation,
                    'mother_residence', mp.mother_residence
                )
            ) AS parties,
            json_agg(
                DISTINCT jsonb_build_object(
                    'document_id', md.document_id,
                    'document_type', md.document_type,
                    'file_name', md.file_name,
                    'file_path', md.file_path,
                    'file_size', md.file_size,
                    'uploaded_at', md.uploaded_at
                )
            ) AS documents
        FROM marriages m
        LEFT JOIN marriage_parties mp ON m.marriage_id = mp.marriage_id
        LEFT JOIN marriage_documents md ON m.marriage_id = md.marriage_id
        WHERE m.user_id = $1
        GROUP BY m.marriage_id
        ORDER BY m.marriage_date DESC
    `;

    const result = await pool.query(query, [user_id]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ 
            error: 'No marriage records found for this user' 
        });
    }
    
    res.json(result.rows);
});

// READ a single marriage record by ID
export const getMarriageById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM marriages WHERE marriage_id = $1', [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Marriage record not found' });
    }
    res.json(result.rows[0]);
});

// UPDATE a marriage record with file upload support
export const updateMarriage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            certificate_number,
            submission_location,
            submission_sub_county,
            submission_county,
            marriage_date,
            marriage_entry_number,
            registrar_certification_number,
            special_license_number,
            conducted_by,
            private_parties_count,
            private_parties_names,
        } = req.body;

        const fieldsToUpdate: string[] = [];
        const values: any[] = [];
        let index = 1;

        if (certificate_number) {
            fieldsToUpdate.push(`certificate_number = $${index++}`);
            values.push(certificate_number);
        }
        if (submission_location) {
            fieldsToUpdate.push(`submission_location = $${index++}`);
            values.push(submission_location);
        }
        if (submission_sub_county) {
            fieldsToUpdate.push(`submission_sub_county = $${index++}`);
            values.push(submission_sub_county);
        }
        if (submission_county) {
            fieldsToUpdate.push(`submission_county = $${index++}`);
            values.push(submission_county);
        }
        if (marriage_date) {
            fieldsToUpdate.push(`marriage_date = $${index++}`);
            values.push(marriage_date);
        }
        if (marriage_entry_number) {
            fieldsToUpdate.push(`marriage_entry_number = $${index++}`);
            values.push(marriage_entry_number);
        }
        if (registrar_certification_number) {
            fieldsToUpdate.push(`registrar_certification_number = $${index++}`);
            values.push(registrar_certification_number);
        }
        if (special_license_number) {
            fieldsToUpdate.push(`special_license_number = $${index++}`);
            values.push(special_license_number);
        }
        if (conducted_by) {
            fieldsToUpdate.push(`conducted_by = $${index++}`);
            values.push(conducted_by);
        }
        if (private_parties_count) {
            fieldsToUpdate.push(`private_parties_count = $${index++}`);
            values.push(private_parties_count);
        }
        if (private_parties_names) {
            fieldsToUpdate.push(`private_parties_names = $${index++}`);
            values.push(private_parties_names);
        }

        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields provided for update" });
            return;
        }

        // Always update updated_at
        fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);

        values.push(id);
        const query = `UPDATE marriages SET ${fieldsToUpdate.join(", ")} WHERE marriage_id = $${index} RETURNING *`;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Marriage record not found' });
        }

        res.json({
            message: "Marriage record updated successfully",
            marriage: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE a marriage record
export const deleteMarriage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM marriages WHERE marriage_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Marriage record not found' });
    }
    res.json({ message: 'Marriage record deleted successfully' });
});
