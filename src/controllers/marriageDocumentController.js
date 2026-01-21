"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarriageDocumentList = exports.downloadMarriageDocument = exports.deleteMarriageDocument = exports.updateMarriageDocument = exports.getMarriageDocumentById = exports.getMarriageDocuments = exports.createMarriageDocument = exports.upload = void 0;
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const db_config_1 = __importDefault(require("../config/db.config"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
// Create uploads directory if it doesn't exist
const createUploadsDirectory = () => {
    const dir = path_1.default.join(__dirname, '../../uploads/marriage_documents');
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
};
createUploadsDirectory();
// Multer setup for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.join(__dirname, '../../uploads/marriage_documents');
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
exports.upload = (0, multer_1.default)({ storage });
// CREATE
exports.createMarriageDocument = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { marriage_id, document_type } = req.body;
    const file = req.file;
    if (!file) {
        res.status(400);
        throw new Error('File is required');
    }
    // Store only the filename (not full path)
    const file_name = file.originalname;
    const file_path = file.filename; // Just the filename
    const file_size = file.size;
    const result = yield db_config_1.default.query(`INSERT INTO marriage_documents (marriage_id, document_type, file_name, file_path, file_size)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`, [marriage_id, document_type, file_name, file_path, file_size]);
    res.status(201).json(result);
}));
// READ ALL
exports.getMarriageDocuments = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_config_1.default.query('SELECT * FROM marriage_documents');
    res.json(result);
}));
// READ ONE
exports.getMarriageDocumentById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield db_config_1.default.query('SELECT * FROM marriage_documents WHERE document_id = $1', [id]);
    if (result.length === 0) {
        res.status(404);
        throw new Error('Document not found');
    }
    res.json(result[0]);
}));
// UPDATE
exports.updateMarriageDocument = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { document_type } = req.body;
    const result = yield db_config_1.default.query(`UPDATE marriage_documents SET document_type = $1 WHERE document_id = $2 RETURNING *`, [document_type, id]);
    if (result.length === 0) {
        res.status(404);
        throw new Error('Document not found');
    }
    res.json(result[0]);
}));
// DELETE
exports.deleteMarriageDocument = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Get file path before deleting
    const docResult = yield db_config_1.default.query('SELECT file_path FROM marriage_documents WHERE document_id = $1', [id]);
    if (docResult.length === 0) {
        res.status(404);
        throw new Error('Document not found');
    }
    const filePath = docResult[0].file_path;
    yield db_config_1.default.query('DELETE FROM marriage_documents WHERE document_id = $1', [id]);
    // Remove file from disk
    fs_1.default.unlink(filePath, (err) => {
        // Ignore error if file doesn't exist
    });
    res.json({ message: 'Document deleted' });
}));
// DOWNLOAD
exports.downloadMarriageDocument = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filename } = req.params;
    // Decode the filename in case it was encoded
    const decodedFilename = decodeURIComponent(filename);
    // Construct the file path safely using just the filename
    const uploadsDir = path_1.default.join(__dirname, '../../uploads/marriage_documents');
    const filePath = path_1.default.join(uploadsDir, decodedFilename);
    // Security check to prevent directory traversal
    if (!filePath.startsWith(uploadsDir)) {
        return res.status(400).json({ message: 'Invalid file path' });
    }
    // Check if file exists
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }
    // Set proper headers
    res.setHeader('Content-Disposition', `attachment; filename="${decodedFilename}"`);
    // Determine content type
    const ext = path_1.default.extname(decodedFilename).toLowerCase();
    const contentType = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png'
    }[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    // Stream the file
    const fileStream = fs_1.default.createReadStream(filePath);
    fileStream.pipe(res);
}));
exports.getMarriageDocumentList = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { marriageId } = req.params;
    const result = yield db_config_1.default.query('SELECT * FROM marriage_documents WHERE marriage_id = $1', [marriageId]);
    const documents = result.map(doc => (Object.assign(Object.assign({}, doc), { 
        // Ensure downloadUrl uses just the filename
        downloadUrl: `/marriage-documents/download/${encodeURIComponent(doc.file_path)}` })));
    res.json(documents);
}));
