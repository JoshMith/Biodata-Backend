import express from 'express';
import { protect } from '../middlewares/auth/protect';
import {

    createMarriageParty,
    getMarriageParties,
    getMarriagePartyById,
    updateMarriageParty,
    deleteMarriageParty
} from '../controllers/marriagePartiesController';
import { adminsPlusOwnersGuard, allAdminsGuard } from '../middlewares/auth/roleMiddleWare';
import { auditLog } from '../middlewares/auditLogger';

const router = express.Router();

// Marriage Parties routes
router.post('/', protect, adminsPlusOwnersGuard, auditLog('CREATE', 'marriageParties'), createMarriageParty);
router.get('/', protect, getMarriageParties);
router.get('/:id', protect, getMarriagePartyById);
router.put('/:id', protect, adminsPlusOwnersGuard, auditLog('UPDATE', 'marriageParties'), updateMarriageParty);
router.delete('/:id', protect, allAdminsGuard, auditLog('DELETE', 'marriageParties'), deleteMarriageParty);

export default router;