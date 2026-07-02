import { Response, NextFunction } from 'express';
import pool from '../config/db.config';
import { UserRequest } from '../utils/types/userTypes';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

/**
 * Factory that returns Express middleware logging an audit entry
 * AFTER the response finishes (so only successful writes are logged).
 *
 * Usage:  router.post('/', protect, editorGuard, auditLog('CREATE', 'users'), createUser)
 */
export const auditLog = (action: AuditAction, entity: string) => {
  return (req: UserRequest, res: Response, next: NextFunction): void => {

    res.on('finish', async () => {
      // Only log successful mutations (2xx responses)
      if (res.statusCode < 200 || res.statusCode >= 300) return;

      try {
        const actor = req.user;
        if (!actor) return; // unauthenticated — nothing to log

        // Best-effort entity ID extraction from params or response body
        const extractParam = (p: any): string | undefined => {
          if (!p) return undefined;
          return Array.isArray(p) ? p[0] : String(p);
        };

        const entityId: string =
          extractParam(req.params?.id) ||
          extractParam(req.params?.userId) ||
          extractParam(req.params?.user_id) ||
          '';

        // Sanitise body — remove password fields before storing
        const safeBody = { ...req.body };
        delete safeBody.password;
        delete safeBody.password_hash;
        delete safeBody.newPassword;
        delete safeBody.confirmPassword;

        const ip =
          (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
          req.socket?.remoteAddress ||
          null;

        await pool.query(
          `INSERT INTO audit_log
            (actor_id, actor_role, actor_email, action, entity, entity_id, detail, ip_address)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            actor.id,
            actor.role,
            actor.email,
            action,
            entity,
            entityId || null,
            JSON.stringify(safeBody),
            ip
          ]
        );
      } catch (err) {
        // Never crash the request over a logging failure
        console.error('Audit log write failed:', err);
      }
    });

    next();
  };
};