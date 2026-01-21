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
exports.deleteBaptism = exports.updateBaptism = exports.getBaptismByUserId = exports.getBaptismById = exports.getBaptism = exports.createBaptism = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
//This will handle all baptism-related operations 
// Create baptism
exports.createBaptism = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, parish, baptism_date, baptism_number, minister, sponsor } = req.body;
        // Optionally, check if a baptism record already exists for this user
        const [baptismRows] = yield db_config_1.default.query("SELECT baptism_id FROM baptism WHERE user_id = ?", [user_id]);
        if (baptismRows.length > 0) {
            res.status(400).json({ message: "Baptism record for this user already exists" });
            return;
        }
        // Proceed to create baptism
        const [baptismResultRows] = yield db_config_1.default.query(`INSERT INTO baptism(user_id, parish, baptism_date, baptism_number, minister, sponsor) 
             VALUES (?, ?, ?, ?, ?, ?)`, [user_id, parish, baptism_date, baptism_number, minister, sponsor]);
        res.status(201).json({
            message: "Baptism record created successfully",
            baptism: baptismResultRows[0]
        });
    }
    catch (error) {
        console.error("Error creating baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//Get All baptism
exports.getBaptism = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_config_1.default.query("SELECT * FROM baptism ORDER BY baptism_id ASC ");
        res.json(rows);
    }
    catch (error) {
        console.error("Error getting baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Get single baptism
exports.getBaptismById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const [rows] = yield db_config_1.default.query("SELECT * FROM baptism WHERE baptism_id = ?", [id]);
        if (rows.length === 0) {
            res.status(400).json({ message: "Baptism record not found" });
            return;
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error("Error getting baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Get baptism by user_id
exports.getBaptismByUserId = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const [rows] = yield db_config_1.default.query("SELECT * FROM baptism WHERE user_id = ?", [userId]);
        // if ((rows as any[]).length === 0) {
        //     res.status(400).json({ message: "No baptism record found for the given user" });
        //     return;
        // }
        res.json(rows);
    }
    catch (error) {
        console.error("Error getting baptism record by user_id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Update baptism
exports.updateBaptism = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { parish, baptism_date, baptism_number, minister, sponsor, user_id } = req.body;
        const fieldsToUpdate = [];
        const values = [];
        if (parish) {
            fieldsToUpdate.push(`parish = ?`);
            values.push(parish);
        }
        if (baptism_date) {
            fieldsToUpdate.push(`baptism_date = ?`);
            values.push(baptism_date);
        }
        if (baptism_number) {
            fieldsToUpdate.push(`baptism_number = ?`);
            values.push(baptism_number);
        }
        if (minister) {
            fieldsToUpdate.push(`minister = ?`);
            values.push(minister);
        }
        if (sponsor) {
            fieldsToUpdate.push(`sponsor = ?`);
            values.push(sponsor);
        }
        if (user_id) {
            fieldsToUpdate.push(`user_id = ?`);
            values.push(user_id);
        }
        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields to update" });
            return;
        }
        values.push(id);
        const [result] = yield db_config_1.default.query(`UPDATE baptism SET ${fieldsToUpdate.join(", ")} WHERE baptism_id = ?`, values);
        if (result.affectedRows === 0) {
            res.status(400).json({ message: "Baptism record update failed" });
            return;
        }
        res.json({
            message: "Baptism record updated successfully"
        });
    }
    catch (error) {
        console.error("Error updating baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Delete baptism
exports.deleteBaptism = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const [result] = yield db_config_1.default.query("DELETE FROM baptism WHERE baptism_id = ?", [id]);
        if (result.affectedRows === 0) {
            res.status(400).json({ message: "Baptism record not found" });
            return;
        }
        res.json({
            message: "Baptism record deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting baptism record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
