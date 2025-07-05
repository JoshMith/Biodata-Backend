import { Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
import pool from '../config/db.config';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

// Create uploads directory if it doesn't exist
const createUploadsDirectory = () => {
  const dir = path.join(__dirname, '../../uploads/marriage_documents');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};
createUploadsDirectory();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/marriage_documents');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

export const upload = multer({ storage });

// CREATE
export const createMarriageDocument = asyncHandler(async (req: Request, res: Response) => {
    const { marriage_id, document_type } = req.body;
    const file = req.file;

    if (!file) {
        res.status(400);
        throw new Error('File is required');
    }

    const file_name = file.originalname;
    const file_path = file.path;
    const file_size = file.size;

    const result = await pool.query(
        `INSERT INTO marriage_documents (marriage_id, document_type, file_name, file_path, file_size)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [marriage_id, document_type, file_name, file_path, file_size]
    );

    res.status(201).json(result.rows[0]);
});

// READ ALL
export const getMarriageDocuments = asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query('SELECT * FROM marriage_documents');
    res.json(result.rows);
});

// READ ONE
export const getMarriageDocumentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM marriage_documents WHERE document_id = $1', [id]);
    if (result.rows.length === 0) {
        res.status(404);
        throw new Error('Document not found');
    }
    res.json(result.rows[0]);
});

// UPDATE
export const updateMarriageDocument = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { document_type } = req.body;

    const result = await pool.query(
        `UPDATE marriage_documents SET document_type = $1 WHERE document_id = $2 RETURNING *`,
        [document_type, id]
    );

    if (result.rows.length === 0) {
        res.status(404);
        throw new Error('Document not found');
    }
    res.json(result.rows[0]);
});

// DELETE
export const deleteMarriageDocument = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Get file path before deleting
    const docResult = await pool.query('SELECT file_path FROM marriage_documents WHERE document_id = $1', [id]);
    if (docResult.rows.length === 0) {
        res.status(404);
        throw new Error('Document not found');
    }
    const filePath = docResult.rows[0].file_path;

    await pool.query('DELETE FROM marriage_documents WHERE document_id = $1', [id]);

    // Remove file from disk
    fs.unlink(filePath, (err) => {
        // Ignore error if file doesn't exist
    });

    res.json({ message: 'Document deleted' });
});


// Get document URL
export const getDocumentUrl = (filePath: string): string => {
    // Convert backslashes to forward slashes for proper URL formatting
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Check if the path already contains the base URL
    if (normalizedPath.startsWith('http')) {
        return normalizedPath;
    }

    // Prepend the base URL if it's a local path
    const baseUrl = process.env.BASE_URL || '';
    return `${baseUrl}/${normalizedPath}`;
};