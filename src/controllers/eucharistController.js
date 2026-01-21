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
exports.deleteEucharist = exports.updateEucharist = exports.getEucharistByUserId = exports.getEucharistById = exports.getEucharist = exports.createEucharist = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
//This will handle all eucharist-related operations 
//Create eucharist
exports.createEucharist = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eucharist_place, eucharist_date, user_id } = req.body;
        // Optional: Check if a eucharist record already exists for this user and date/place
        // (Remove or adjust this logic as needed for your business rules)
        const eucharistCheck = yield db_config_1.default.query("SELECT eucharist_id FROM eucharist WHERE user_id = $1 AND eucharist_date = $2", [user_id, eucharist_date]);
        if (eucharistCheck.length > 0) {
            res.status(400).json({ message: "Eucharist record already exists for this user and date" });
            return;
        }
        // Proceed to create eucharist
        const eucharistResult = yield db_config_1.default.query(`INSERT INTO eucharist(eucharist_place, eucharist_date, user_id) 
             VALUES ($1, $2, $3) RETURNING *`, [eucharist_place, eucharist_date, user_id]);
        res.status(201).json({
            message: "Eucharist record created successfully",
            eucharist: eucharistResult[0]
        });
    }
    catch (error) {
        console.error("Error creating eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//Get All eucharist
exports.getEucharist = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_config_1.default.query("SELECT * FROM eucharist ORDER BY eucharist_id ASC ");
        res.json(result);
    }
    catch (error) {
        console.error("Error getting eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Get single eucharist
exports.getEucharistById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const [result] = yield db_config_1.default.query("SELECT * FROM eucharist WHERE eucharist_id = $1", [id]);
        if (result.length === 0) {
            res.status(400).json({ message: "Eucharist record not found" });
            return;
        }
        res.json(result[0]);
    }
    catch (error) {
        console.error("Error getting eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Get eucharist by user_id
exports.getEucharistByUserId = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const result = yield db_config_1.default.query("SELECT * FROM eucharist WHERE user_id = $1", [userId]);
        // if (result.rows.length === 0) {
        //     res.status(400).json({ message: "No eucharist records found for the given user_id" });
        //     return;
        // }
        res.json(result);
    }
    catch (error) {
        console.error("Error getting eucharist records by user_id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Update eucharist
exports.updateEucharist = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { eucharist_place, eucharist_date, user_id } = req.body;
        const fieldsToUpdate = [];
        const values = [];
        let index = 1;
        if (eucharist_place) {
            fieldsToUpdate.push(`eucharist_place = $${index++}`);
            values.push(eucharist_place);
        }
        if (eucharist_date) {
            fieldsToUpdate.push(`eucharist_date = $${index++}`);
            values.push(eucharist_date);
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
        const query = `UPDATE eucharist SET ${fieldsToUpdate.join(", ")} WHERE eucharist_id = $${index} RETURNING *`;
        const eucharistResult = yield db_config_1.default.query(query, values);
        if (eucharistResult.length === 0) {
            res.status(400).json({ message: "Eucharist record update failed" });
            return;
        }
        res.json({
            message: "Eucharist record updated successfully",
            eucharist: eucharistResult[0]
        });
    }
    catch (error) {
        console.error("Error updating eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Delete eucharist
exports.deleteEucharist = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const eucharistResult = yield db_config_1.default.query("DELETE FROM eucharist WHERE eucharist_id = $1 RETURNING *", [id]);
        if (eucharistResult.length === 0) {
            res.status(400).json({ message: "Eucharist record not found" });
            return;
        }
        res.json({
            message: "Eucharist record deleted successfully",
            book: eucharistResult[0]
        });
    }
    catch (error) {
        console.error("Error deleting eucharist record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
