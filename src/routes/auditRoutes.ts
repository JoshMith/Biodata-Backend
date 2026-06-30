import express from 'express';
import { protect } from '../middlewares/auth/protect';
import { superAdminGuard } from '../middlewares/auth/roleMiddleWare';
import { getAuditLogs, downloadAuditLogs } from '../controllers/auditController';

const router = express.Router();

// GET /audit-logs?page=&limit=&entity=&action=&actorEmail=&from=&to=
// Paginated list — superadmin & superviewer only
router.get('/', protect, superAdminGuard, getAuditLogs);

// GET /audit-logs/download?entity=&action=&from=&to=
// Streams a CSV file — superadmin only (existing)
router.get('/download', protect, superAdminGuard, downloadAuditLogs);

export default router;