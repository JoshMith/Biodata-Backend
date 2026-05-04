import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"
import { RowDataPacket, ResultSetHeader } from "mysql2"

// Controllers for parish-related operations
// Create a new parish
export const createParish = asyncHandler(async (req: Request, res: Response) => {
    const { parish_name, deanery } = req.body
    if (!parish_name) {
        return res.status(400).json({ message: "parish_name is required" })
    }
    const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO parishes (parish_name, deanery) VALUES (?, ?)",
        [parish_name, deanery || null]
    )
    // Fetch the newly created parish
    const [newParish] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM parishes WHERE parish_id = ?",
        [result.insertId]
    )
    res.status(201).json(newParish[0])
})

// Get all parishes
export const getAllParishes = asyncHandler(async (req: Request, res: Response) => {
    const [parishes] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM parishes ORDER BY parish_name"
    )
    res.json(parishes)
})

// Get parish by ID
export const getParishById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const [parishes] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM parishes WHERE parish_id = ?",
        [id]
    )
    if (parishes.length === 0) {
        return res.status(404).json({ message: "Parish not found" })
    }
    res.json(parishes[0])
})

// Get parish by name (using LIKE for text search)
export const getParishByName = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params
    const [parishes] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM parishes WHERE parish_name LIKE ?",
        [`%${name}%`]
    )
    if (parishes.length === 0) {
        return res.status(404).json({ message: "Parish not found" })
    }
    res.json(parishes[0])
})

// Get parishes by deanery (using LIKE for text search)
export const getParishByDeanery = asyncHandler(async (req: Request, res: Response) => {
    const { deanery } = req.params
    const [parishes] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM parishes WHERE deanery LIKE ?",
        [`%${deanery}%`]
    )
    if (parishes.length === 0) {
        return res.status(404).json({ message: "No parishes found for this deanery" })
    }
    res.json(parishes)
})

// Update parish by PATCH
export const updateParish = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const fields: string[] = []
    const values: any[] = []
    if (req.body.parish_name) {
        fields.push("parish_name = ?")
        values.push(req.body.parish_name)
    }
    if (req.body.deanery) {
        fields.push("deanery = ?")
        values.push(req.body.deanery)
    }
    if (fields.length === 0) {
        return res.status(400).json({ message: "No fields to update" })
    }
    values.push(id)
    const [result] = await pool.query<ResultSetHeader>(
        `UPDATE parishes SET ${fields.join(", ")} WHERE parish_id = ?`,
        values
    )
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Parish not found" })
    }
    // Fetch the updated parish
    const [updatedParish] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM parishes WHERE parish_id = ?",
        [id]
    )
    res.json(updatedParish[0])
})

// Delete parish
export const deleteParish = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const [result] = await pool.query<ResultSetHeader>(
        "DELETE FROM parishes WHERE parish_id = ?",
        [id]
    )
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Parish not found" })
    }
    res.json({ message: "Parish deleted successfully" })
})