import { Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
import pool from '../config/db.config'; // Assumes you have a PostgreSQL pool instance

// CREATE
export const createMarriageParty = asyncHandler(async (req: Request, res: Response) => {
    const {
        marriage_id,
        party_type,
        full_name,
        marital_status,
        domicile,
        father_name,
        mother_name
    } = req.body;

    const [result] = await pool.query(
        `INSERT INTO marriage_parties (
            marriage_id, party_type, full_name, marital_status, domicile, father_name, mother_name
        ) VALUES (
            ?,?,?,?,?,?,?
        )`,
        [
            marriage_id, party_type, full_name, marital_status, domicile, father_name, mother_name
        ]
    );
    res.status(201).json(result);
});

// READ ALL
export const getMarriageParties = asyncHandler(async (req: Request, res: Response) => {
    const [result] = await pool.query('SELECT * FROM marriage_parties');
    res.json(result as any[]);
});

// READ ONE
export const getMarriagePartyById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const [result] = await pool.query('SELECT * FROM marriage_parties WHERE party_id = ?', [id]);
    if ((result as any).length === 0) {
        res.status(404).json({ message: 'Marriage party not found' });
        return;
    }
    res.json((result as any[])[0]);
});

// UPDATE
export const updateMarriageParty = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    
    const possibleFields = {
        marriage_id: req.body.marriage_id,
        party_type: req.body.party_type,
        full_name: req.body.full_name,
        marital_status: req.body.marital_status,
        domicile: req.body.domicile,
        father_name: req.body.father_name,
        mother_name: req.body.mother_name
    };

    Object.entries(possibleFields).forEach(([key, value]) => {
        if (value !== undefined) {
            fieldsToUpdate.push(`${key} = ?`);
            values.push(value);
        }
    });

    if (fieldsToUpdate.length === 0) {
        res.status(400).json({ message: 'No fields to update' });
        return;
    }

    values.push(id);
    const query = `UPDATE marriage_parties SET ${fieldsToUpdate.join(', ')} WHERE party_id = ?`;
    
    const [result] = await pool.query(query, values);
    
    if ((result as any).affectedRows === 0) {
        res.status(404).json({ message: 'Marriage party not found' });
        return;
    }
    
    // Fetch and return the updated record
    const [updated] = await pool.query('SELECT * FROM marriage_parties WHERE party_id = ?', [id]);
    res.json((updated as any[])[0]);
});

// DELETE
export const deleteMarriageParty = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM marriage_parties WHERE party_id = ?', [id]);
    if ((result as any[]).length === 0) {
        res.status(404).json({ message: 'Marriage party not found' });
        return;
    }
    res.json({ message: 'Marriage party deleted' });
});