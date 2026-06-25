import express from 'express';
import { protect } from '../middlewares/auth/protect';
import {
// Import the marriages2 controller
    createMarriage,
    getAllMarriages,
    getMarriageById,
    updateMarriage,
    deleteMarriage,
    getFullMarriageByUserId
} from '../controllers/marriageController';
import { adminsPlusOwnersGuard, allAdminsGuard } from '../middlewares/auth/roleMiddleWare';
import { auditLog } from '../middlewares/auditLogger';

const router = express.Router();

// Marriage routes
router.post('/', protect, adminsPlusOwnersGuard, auditLog('CREATE', 'marriages'), createMarriage);
router.get('/', protect, getAllMarriages);
// router.get('/user/:user_id', protect, getUserMarriages);
router.get('/user/:user_id/full', protect, getFullMarriageByUserId);
router.get('/:id', protect, getMarriageById);
router.put('/:id', protect, adminsPlusOwnersGuard, auditLog('UPDATE', 'marriages'), updateMarriage);
router.delete('/:id', protect, allAdminsGuard, auditLog('DELETE', 'marriages'), deleteMarriage);

export default router;