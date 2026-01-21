"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/auth/protect");
// Import the new controller and multer upload
const marriageDocumentController_1 = require("../controllers/marriageDocumentController");
const roleMiddleWare_1 = require("../middlewares/auth/roleMiddleWare");
const router = express_1.default.Router();
// Marriage Document File routes
router.post('/', protect_1.protect, marriageDocumentController_1.upload.single('file'), roleMiddleWare_1.ownUserSuperUserEditorGuard, marriageDocumentController_1.createMarriageDocument);
router.get('/', protect_1.protect, marriageDocumentController_1.getMarriageDocuments);
router.get('/:id', protect_1.protect, marriageDocumentController_1.getMarriageDocumentById);
router.put('/:id', protect_1.protect, roleMiddleWare_1.ownUserSuperUserEditorGuard, marriageDocumentController_1.updateMarriageDocument);
router.delete('/:id', protect_1.protect, roleMiddleWare_1.superUserEditorGuard, marriageDocumentController_1.deleteMarriageDocument);
// New routes for document download
router.get('/download/:filename', protect_1.protect, marriageDocumentController_1.downloadMarriageDocument);
router.get('/list/:marriageId', protect_1.protect, marriageDocumentController_1.getMarriageDocumentList);
exports.default = router;
