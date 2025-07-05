import express from 'express';
import { protect } from '../middlewares/auth/protect';
import {

createMarriageParty,
getMarriageParties,
getMarriagePartyById,
updateMarriageParty,
deleteMarriageParty
} from '../controllers/marriagePartiesController';

const router = express.Router();

// Marriage Parties routes
router.post('/', protect, createMarriageParty);
router.get('/', protect, getMarriageParties);
router.get('/:id', protect, getMarriagePartyById);
router.put('/:id', protect, updateMarriageParty);
router.delete('/:id', protect, deleteMarriageParty);

export default router;