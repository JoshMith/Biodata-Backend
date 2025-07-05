import { Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
import pool from '../config/db.config'; // Assumes you have a PostgreSQL pool instance

// CREATE
export const createMarriageParty = asyncHandler(async (req: Request, res: Response) => {
    const {
        marriage_id,
        party_type,
        full_name,
        age,
        marital_status,
        residence_address,
        residence_county,
        residence_sub_county,
        occupation,
        father_name,
        father_occupation,
        father_residence,
        mother_name,
        mother_occupation,
        mother_residence,
    } = req.body;

    const result = await pool.query(
        `INSERT INTO marriage_parties (
            marriage_id, party_type, full_name, age, marital_status, residence_address,
            residence_county, residence_sub_county, occupation, father_name, father_occupation,
            father_residence, mother_name, mother_occupation, mother_residence
        ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
        ) RETURNING *`,
        [
            marriage_id, party_type, full_name, age, marital_status, residence_address,
            residence_county, residence_sub_county, occupation, father_name, father_occupation,
            father_residence, mother_name, mother_occupation, mother_residence
        ]
    );
    res.status(201).json(result.rows[0]);
});

// READ ALL
export const getMarriageParties = asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query('SELECT * FROM marriage_parties');
    res.json(result.rows);
});

// READ ONE
export const getMarriagePartyById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM marriage_parties WHERE party_id = $1', [id]);
    if (result.rows.length === 0) {
        res.status(404).json({ message: 'Marriage party not found' });
        return;
    }
    res.json(result.rows[0]);
});

// UPDATE
export const updateMarriageParty = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const fields = [
        'marriage_id', 'party_type', 'full_name', 'age', 'marital_status', 'residence_address',
        'residence_county', 'residence_sub_county', 'occupation', 'father_name', 'father_occupation',
        'father_residence', 'mother_name', 'mother_occupation', 'mother_residence'
    ];
    const updates = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
    const values = fields.map(field => req.body[field]);
    const result = await pool.query(
        `UPDATE marriage_parties SET ${updates} WHERE party_id = $1 RETURNING *`,
        [id, ...values]
    );
    if (result.rows.length === 0) {
        res.status(404).json({ message: 'Marriage party not found' });
        return;
    }
    res.json(result.rows[0]);
});

// DELETE
export const deleteMarriageParty = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM marriage_parties WHERE party_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
        res.status(404).json({ message: 'Marriage party not found' });
        return;
    }
    res.json({ message: 'Marriage party deleted' });
});