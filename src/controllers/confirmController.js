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
exports.deleteConfirmation = exports.updateConfirmation = exports.getConfirmationByUserId = exports.getConfirmationById = exports.getConfirmation = exports.createConfirmation = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
//This will handle all confirmation-related operations 
//Create confirmation
exports.createConfirmation = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { confirmation_place, confirmation_date, confirmation_no, user_id, minister } = req.body;
        // Optionally, check for duplicate confirmation_no for the same user
        const duplicateCheck = yield db_config_1.default.query("SELECT confirmation_id FROM confirmation WHERE confirmation_no = $1 AND user_id = $2", [confirmation_no, user_id]);
        if (duplicateCheck.length > 0) {
            res.status(400).json({ message: "Confirmation record already exists for this user and number" });
            return;
        }
        // Proceed to create confirmation
        const confirmationResult = yield db_config_1.default.query(`INSERT INTO confirmation(confirmation_place, confirmation_date, confirmation_no, user_id, minister) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`, [confirmation_place, confirmation_date, confirmation_no, user_id, minister]);
        res.status(201).json({
            message: "Confirmation record created successfully",
            confirmation: confirmationResult[0]
        });
    }
    catch (error) {
        console.error("Error creating confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//Get All confirmation
exports.getConfirmation = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_config_1.default.query("SELECT * FROM confirmation ORDER BY confirmation_id ASC ");
        res.json(result);
    }
    catch (error) {
        console.error("Error getting confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Get single confirmation
exports.getConfirmationById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const [result] = yield db_config_1.default.query("SELECT * FROM confirmation WHERE confirmation_id = $1", [id]);
        if (result.length === 0) {
            res.status(400).json({ message: "Confirmation record not found" });
            return;
        }
        res.json(result[0]);
    }
    catch (error) {
        console.error("Error getting confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Get confirmation by user_id
exports.getConfirmationByUserId = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const result = yield db_config_1.default.query("SELECT * FROM confirmation WHERE user_id = $1", [userId]);
        // if (result.rows.length === 0) {
        //     res.status(400).json({ message: "No confirmation record found for the given user_id" });
        //     return;
        // }
        res.json(result);
    }
    catch (error) {
        console.error("Error getting confirmation records by user_id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Update confirmation
exports.updateConfirmation = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { confirmation_place, confirmation_date, confirmation_no, user_id, minister } = req.body;
        const fieldsToUpdate = [];
        const values = [];
        let index = 1;
        if (confirmation_place) {
            fieldsToUpdate.push(`confirmation_place = $${index++}`);
            values.push(confirmation_place);
        }
        if (confirmation_date) {
            fieldsToUpdate.push(`confirmation_date = $${index++}`);
            values.push(confirmation_date);
        }
        if (confirmation_no) {
            fieldsToUpdate.push(`confirmation_no = $${index++}`);
            values.push(confirmation_no);
        }
        if (minister) {
            fieldsToUpdate.push(`minister = $${index++}`);
            values.push(minister);
        }
        if (user_id) {
            fieldsToUpdate.push(`user_id = $${index++}`);
            values.push(user_id);
        }
        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields provided for update" });
            return;
        }
        values.push(id);
        const query = `UPDATE confirmation SET ${fieldsToUpdate.join(", ")} WHERE confirmation_id = $${index} RETURNING *`;
        const [confirmationResult] = yield db_config_1.default.query(query, values);
        if (confirmationResult.length === 0) {
            res.status(400).json({ message: "Confirmation record update failed" });
            return;
        }
        res.json({
            message: "Confirmation record updated successfully",
            confirmation: confirmationResult.rows[0]
        });
    }
    catch (error) {
        console.error("Error updating confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Delete confirmation
exports.deleteConfirmation = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const [confirmationResult] = yield db_config_1.default.query("DELETE FROM confirmation WHERE confirmation_id = $1 RETURNING *", [id]);
        if ([confirmationResult].length === 0) {
            res.status(400).json({ message: "Confirmation record not found" });
            return;
        }
        res.json({
            message: "Confirmation record deleted successfully",
            confirmation: confirmationResult[0]
        });
    }
    catch (error) {
        console.error("Error deleting confirmation record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
