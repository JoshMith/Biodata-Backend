import express from 'express';
import { protect } from '../middlewares/auth/protect';
import {

createMarriageParty,
getMarriageParties,
getMarriagePartyById,
updateMarriageParty,
deleteMarriageParty
} from '../controllers/marriagePartiesController';
import { ownUserSuperUserEditorGuard, superUserEditorGuard } from '../middlewares/auth/roleMiddleWare';
import { auditLog } from '../middlewares/auditLogger';

const router = express.Router();

// Marriage Parties routes
router.post('/', protect, ownUserSuperUserEditorGuard, auditLog('CREATE', 'marriageParties'), createMarriageParty);
router.get('/', protect, getMarriageParties);
router.get('/:id', protect, getMarriagePartyById);
router.put('/:id', protect, ownUserSuperUserEditorGuard, auditLog('UPDATE', 'marriageParties'), updateMarriageParty);
router.delete('/:id', protect, superUserEditorGuard, auditLog('DELETE', 'marriageParties'), deleteMarriageParty);

export default router;