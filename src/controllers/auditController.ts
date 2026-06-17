import { Response } from 'express';
import pool from '../config/db.config';
import asyncHandler from '../middlewares/asyncHandler';
import { UserRequest } from '../utils/types/userTypes';

/** Convert rows to CSV string */
function toCSV(rows: any[]): string {
  if (rows.length === 0) return '';

  const headers = [
    'id', 'created_at', 'actor_email', 'actor_role',
    'action', 'entity', 'entity_id', 'detail', 'ip_address'
  ];

  const escape = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    // Wrap in quotes and escape any internal quotes
    return `"${str.replace(/"/g, '""')}"`;
  };

  const lines = [
    headers.join(','),
    ...rows.map(r =>
      headers.map(h => escape(r[h])).join(',')
    )
  ];

  return lines.join('\r\n');
}

export const downloadAuditLogs = asyncHandler(async (req: UserRequest, res: Response) => {
  const {
    entity, action, actor_id, from, to
  } = req.query as Record<string, string>;

  const conditions: string[] = [];
  const params: any[] = [];

  if (entity)   { conditions.push('entity = ?');      params.push(entity); }
  if (action)   { conditions.push('action = ?');      params.push(action); }
  if (actor_id) { conditions.push('actor_id = ?');    params.push(actor_id); }
  if (from)     { conditions.push('created_at >= ?'); params.push(from); }
  if (to)       { conditions.push('created_at <= ?'); params.push(`${to} 23:59:59`); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const [rows] = await pool.query(
    `SELECT
       id, created_at, actor_email, actor_role,
       action, entity, entity_id, detail, ip_address
     FROM audit_log
     ${where}
     ORDER BY created_at DESC`,
    params
  );

  const csv = toCSV(rows as any[]);
  const filename = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});