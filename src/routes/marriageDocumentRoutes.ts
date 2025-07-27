import express from 'express';
import { protect } from '../middlewares/auth/protect';

// Import the new controller and multer upload
import { createMarriageDocument, getMarriageDocuments, getMarriageDocumentById, updateMarriageDocument, deleteMarriageDocument, upload, downloadMarriageDocument, getMarriageDocumentList } from '../controllers/marriageDocumentController';
import { superUserEditorGuard } from '../middlewares/auth/roleMiddleWare';

const router = express.Router();

// Marriage Document File routes
router.post('/', protect, upload.single('file'), superUserEditorGuard, createMarriageDocument);
router.get('/', protect, getMarriageDocuments);
router.get('/:id', protect, getMarriageDocumentById);
router.put('/:id', protect, superUserEditorGuard, updateMarriageDocument);
router.delete('/:id', protect, superUserEditorGuard, deleteMarriageDocument);

// New routes for document download
router.get('/download/:filename', protect, downloadMarriageDocument);
router.get('/list/:marriageId', protect, getMarriageDocumentList);


export default router;
