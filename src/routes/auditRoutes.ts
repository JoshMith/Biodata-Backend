import express from 'express';
import { protect } from '../middlewares/auth/protect';
import { superuserGuard } from '../middlewares/auth/roleMiddleWare';
import { downloadAuditLogs } from '../controllers/auditController';

const router = express.Router();

// GET /audit-logs/download?entity=&action=&from=&to=
// Streams a CSV file — superuser only
router.get('/download', protect, superuserGuard, downloadAuditLogs);

export default router;