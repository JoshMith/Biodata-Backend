import express from 'express';
import { protect } from '../middlewares/auth/protect';

// Import the new controller and multer upload
import { createMarriageDocument, getMarriageDocuments, getMarriageDocumentById, updateMarriageDocument, deleteMarriageDocument, upload, downloadMarriageDocument, getMarriageDocumentList } from '../controllers/marriageDocumentController';

const router = express.Router();

// Marriage Document File routes
router.post('/', protect, upload.single('file'), createMarriageDocument);
router.get('/', protect, getMarriageDocuments);
router.get('/:id', protect, getMarriageDocumentById);
router.put('/:id', protect, updateMarriageDocument);
router.delete('/:id', protect, deleteMarriageDocument);

// New routes for document download
router.get('/download/:filename', protect, downloadMarriageDocument);
router.get('/list/:marriageId', protect, getMarriageDocumentList);


export default router;
