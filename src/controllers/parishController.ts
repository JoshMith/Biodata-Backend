import { Request, Response } from "express"
import pool from "../config/db.config"
import asyncHandler from "../middlewares/asyncHandler"

// Controllers for parish-related operations

// Create a new parish
export const createParish = asyncHandler(async (req: Request, res: Response) => {
    const { parish_name } = req.body
    if (!parish_name ) {
        return res.status(400).json({ message: "parish_name are required" })
    }
    const result = await pool.query(
        "INSERT INTO parishes (parish_name, deanery) VALUES ($1, $2) RETURNING *",
        [parish_name]
    )
    res.status(201).json(result.rows[0])
})



// Get all parishes
export const getAllParishes = asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM parishes")
    res.json(result.rows)
})

// Get parish by ID
export const getParishById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await pool.query(
        "SELECT * FROM parishes WHERE parish_id = $1",
        [id]
    )
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Parish not found" })
    }
    res.json(result.rows[0])
})


// Get parish by name
export const getParishByName = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params
    const result = await pool.query(
        "SELECT * FROM parishes WHERE to_tsvector(parish_name) @@ plainto_tsquery($1)",
        [name]
    )
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Parish not found" })
    }
    res.json(result.rows[0])
})


// Update parish by PATCH
export const updateParish = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const fields = []
    const values = []
    let idx = 1

    if (req.body.parish_name) {
        fields.push(`parish_name = $${idx++}`)
        values.push(req.body.parish_name)
    }
    if (fields.length === 0) {
        return res.status(400).json({ message: "No fields to update" })
    }
    values.push(id)
    const result = await pool.query(
        `UPDATE parishes SET ${fields.join(", ")} WHERE parish_id = $${idx} RETURNING *`,
        values
    )
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Parish not found" })
    }
    res.json(result.rows[0])
})

// Delete parish
export const deleteParish = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await pool.query(
        "DELETE FROM parishes WHERE parish_id = $1 RETURNING *",
        [id]
    )
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Parish not found" })
    }
    res.json({ message: "Parish deleted successfully" })
})