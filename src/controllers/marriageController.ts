import { Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
import pool from '../config/db.config';

const FULL_ACCESS_ROLES = ['superadmin', 'superviewer'];
const DEANERY_ACCESS_ROLES = ['deaneryviewer'];
const OWN_PARISH_ROLES = ['parishadmin', 'parishviewer', 'secretary', 'editor'];
const MEMBER_ROLE = ['member'];

const buildMarriageAccessFilter = (role: string, parishId: any, userId: any) => {
    if (FULL_ACCESS_ROLES.includes(role)) {
        return { join: '', condition: '', params: [] };
    }

    if (DEANERY_ACCESS_ROLES.includes(role)) {
        if (!parishId) {
            return null;
        }
        return {
            join: ' JOIN parishes p ON u.parish_id = p.parish_id',
            condition: 'p.deanery = (SELECT deanery FROM parishes WHERE parish_id = ?)',
            params: [parishId]
        };
    }

    if (OWN_PARISH_ROLES.includes(role)) {
        if (!parishId) {
            return null;
        }
        return {
            join: '',
            condition: 'u.parish_id = ?',
            params: [parishId]
        };
    }

    if (MEMBER_ROLE.includes(role)) {
        if (!userId) {
            return null;
        }
        return {
            join: '',
            condition: 'm.user_id = ?',
            params: [userId]
        };
    }

    return null;
};

const buildMarriageQuery = (baseQuery: string, accessFilter: { join: string; condition: string; params: any[] }, additionalCondition?: string) => {
    let query = baseQuery;
    query += accessFilter.join;

    if (accessFilter.condition) {
        query += ` WHERE ${accessFilter.condition}`;
    }

    if (additionalCondition) {
        query += accessFilter.condition ? ` AND ${additionalCondition}` : ` WHERE ${additionalCondition}`;
    }

    return query;
};

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
                user_id, civil_marriage_certificate_number,
                submission_location, submission_sub_county, submission_county,
                marriage_date, conducted_by,
                witness1_name, witness1_son_of, witness1_clan,
                witness2_name, witness2_son_of, witness2_clan
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
export const getAllMarriages = asyncHandler(async (req: any, res: Response) => {
    const role = req.user?.role;
    const parishId = req.user?.parish_id;
    const userId = req.user?.id;

    const accessFilter = buildMarriageAccessFilter(role, parishId, userId);
    if (!accessFilter) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const query = buildMarriageQuery(
        'SELECT m.* FROM marriages m JOIN users u ON m.user_id = u.id',
        accessFilter
    );

    const [result] = await pool.query(query, accessFilter.params);
    res.json(result as any[]);
});

// READ all marriage records for a specific user
export const getUserMarriages = asyncHandler(async (req: any, res: Response) => {
    const { user_id } = req.params;
    const role = req.user?.role;
    const parishId = req.user?.parish_id;
    const userId = req.user?.id;

    const accessFilter = buildMarriageAccessFilter(role, parishId, userId);
    if (!accessFilter) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    if (MEMBER_ROLE.includes(role) && String(userId) !== String(user_id)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const query = buildMarriageQuery(
        'SELECT m.* FROM marriages m JOIN users u ON m.user_id = u.id',
        accessFilter,
        MEMBER_ROLE.includes(role) ? undefined : 'm.user_id = ?'
    );

    const params = [...accessFilter.params];
    if (!MEMBER_ROLE.includes(role)) {
        params.push(user_id);
    }

    const [result] = await pool.query(query, params);
    if ((result as any[]).length === 0) {
        return res.status(404).json({ error: 'No marriage records found for this user' });
    }
    res.json(result as any[]);
});

// Get full marriage details with parties — compatible with MySQL < 5.7.22
export const getFullMarriageByUserId = asyncHandler(async (req: any, res: Response) => {
    const { user_id } = req.params;
    const role = req.user?.role;
    const parishId = req.user?.parish_id;
    const userId = req.user?.id;

    const accessFilter = buildMarriageAccessFilter(role, parishId, userId);
    if (!accessFilter) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    if (MEMBER_ROLE.includes(role) && String(userId) !== String(user_id)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const query = buildMarriageQuery(
        'SELECT m.* FROM marriages m JOIN users u ON m.user_id = u.id',
        accessFilter,
        MEMBER_ROLE.includes(role) ? undefined : 'm.user_id = ?'
    );

    const params = [...accessFilter.params];
    if (!MEMBER_ROLE.includes(role)) {
        params.push(user_id);
    }

    const [marriages] = await pool.query(query, params) as any[];

    if (!marriages || marriages.length === 0) {
        return res.status(404).json({ error: 'No marriage records found for this user' });
    }

    const results = await Promise.all(
        marriages.map(async (marriage: any) => {
            const [parties] = await pool.query(
                `SELECT * FROM marriage_parties WHERE marriage_id = ?`,
                [marriage.marriage_id]
            ) as any[];

            return {
                ...marriage,
                parties: parties as any[]
            };
        })
    );

    res.json(results);
});

// READ a single marriage record by ID
export const getMarriageById = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const role = req.user?.role;
    const parishId = req.user?.parish_id;
    const userId = req.user?.id;

    const accessFilter = buildMarriageAccessFilter(role, parishId, userId);
    if (!accessFilter) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const query = buildMarriageQuery(
        'SELECT m.* FROM marriages m JOIN users u ON m.user_id = u.id',
        accessFilter,
        'm.marriage_id = ?'
    );

    const params = [...accessFilter.params, id];
    const [result] = await pool.query(query, params);

    if ((result as any[]).length === 0) {
        return res.status(404).json({ error: 'Marriage record not found' });
    }
    res.json((result as any[])[0]);
});

// UPDATE a marriage record — uses only columns that still exist after databaseCorrections.sql
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

        const fieldMap: Record<string, any> = {
            'civil_marriage_certificate_number': civil_marriage_certificate_number,
            'submission_location': submission_location,
            'submission_sub_county': submission_sub_county,
            'submission_county': submission_county,
            'marriage_date': marriage_date,
            'conducted_by': conducted_by,
            'witness1_name': witness1_name,
            'witness1_son_of': witness1_son_of,
            'witness1_clan': witness1_clan,
            'witness2_name': witness2_name,
            'witness2_son_of': witness2_son_of,
            'witness2_clan': witness2_clan,
        };

        for (const [col, val] of Object.entries(fieldMap)) {
            if (val !== undefined) {
                fieldsToUpdate.push(`${col} = ?`);
                values.push(val);
            }
        }

        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: 'No fields provided for update' });
            return;
        }

        fieldsToUpdate.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const [result] = await pool.query(
            `UPDATE marriages SET ${fieldsToUpdate.join(', ')} WHERE marriage_id = ?`,
            values
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Marriage record not found' });
        }

        res.json({ message: 'Marriage record updated successfully', marriage_id: id });

    } catch (error) {
        console.error('Error updating marriage record:', error);
        res.status(500).json({ message: 'Internal server error' });
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