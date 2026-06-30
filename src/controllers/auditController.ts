import { Response } from 'express';
import pool from '../config/db.config';
import asyncHandler from '../middlewares/asyncHandler';
import { UserRequest } from '../utils/types/userTypes';

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: build shared WHERE clause from query params
// ─────────────────────────────────────────────────────────────────────────────
function buildWhere(query: Record<string, string>, userRole: string, userParishId?: string | number) {
  const conditions: string[] = [];
  const params: any[] = [];

  // parishadmin is scoped to their own parish's actors
  if (userRole === 'parishadmin' && userParishId) {
    conditions.push('actor_id IN (SELECT id FROM users WHERE parish_id = ?)');
    params.push(userParishId);
  }

  if (query.entity)    { conditions.push('entity = ?');         params.push(query.entity); }
  if (query.action)    { conditions.push('action = ?');         params.push(query.action); }
  if (query.actor_id)  { conditions.push('actor_id = ?');       params.push(query.actor_id); }
  if (query.actorEmail){ conditions.push('actor_email LIKE ?'); params.push(`%${query.actorEmail}%`); }
  if (query.from)      { conditions.push('created_at >= ?');    params.push(query.from); }
  if (query.to)        { conditions.push('created_at <= ?');    params.push(`${query.to} 23:59:59`); }

  return {
    where: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '',
    params,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /audit-logs
//  Paginated list — superadmin, superviewer, parishadmin
// ─────────────────────────────────────────────────────────────────────────────
export const getAuditLogs = asyncHandler(async (req: UserRequest, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  const user = req.user!;
  const { where, params } = buildWhere(
    req.query as Record<string, string>,
    user.role,
    user.parish_id
  );

  const [[{ total }]]: any = await pool.query(
    `SELECT COUNT(*) AS total FROM audit_log ${where}`,
    params
  );

  const [rows]: any = await pool.query(
    `SELECT id, created_at, actor_id, actor_email, actor_role,
            action, entity, entity_id, detail, ip_address
     FROM audit_log
     ${where}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    data: rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /audit-logs/download
//  CSV export — existing, untouched except scoping added
// ─────────────────────────────────────────────────────────────────────────────
function toCSV(rows: any[]): string {
  if (rows.length === 0) return '';

  const headers = [
    'id', 'created_at', 'actor_email', 'actor_role',
    'action', 'entity', 'entity_id', 'detail', 'ip_address',
  ];

  const escape = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  return [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ].join('\r\n');
}

export const downloadAuditLogs = asyncHandler(async (req: UserRequest, res: Response) => {
  const user = req.user!;
  const { where, params } = buildWhere(
    req.query as Record<string, string>,
    user.role,
    user.parish_id
  );

  const [rows]: any = await pool.query(
    `SELECT id, created_at, actor_email, actor_role,
            action, entity, entity_id, detail, ip_address
     FROM audit_log
     ${where}
     ORDER BY created_at DESC`,
    params
  );

  const csv      = toCSV(rows as any[]);
  const filename = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});