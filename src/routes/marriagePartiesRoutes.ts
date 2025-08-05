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

const router = express.Router();

// Marriage Parties routes
router.post('/', protect, ownUserSuperUserEditorGuard, createMarriageParty);
router.get('/', protect, getMarriageParties);
router.get('/:id', protect, getMarriagePartyById);
router.put('/:id', protect, ownUserSuperUserEditorGuard, updateMarriageParty);
router.delete('/:id', protect, superUserEditorGuard, deleteMarriageParty);

export default router;