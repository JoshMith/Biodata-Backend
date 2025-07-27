import express from 'express';
import { protect } from '../middlewares/auth/protect';
import {
// Import the marriages2 controller
    createMarriage,
    getAllMarriages,
    getUserMarriages,
    getMarriageById,
    updateMarriage,
    deleteMarriage,
    getFullMarriageByUserId
} from '../controllers/marriages2Controller';
import { superUserEditorGuard } from '../middlewares/auth/roleMiddleWare';

const router = express.Router();

// Marriage routes
router.post('/', protect, superUserEditorGuard, createMarriage);
router.get('/', protect, getAllMarriages);
// router.get('/user/:user_id', protect, getUserMarriages);
router.get('/user/:user_id/full', protect, getFullMarriageByUserId);
router.get('/:id', protect, getMarriageById);
router.put('/:id', protect, superUserEditorGuard, updateMarriage);
router.delete('/:id', protect, superUserEditorGuard, deleteMarriage);

export default router;