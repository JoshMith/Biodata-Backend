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
exports.deleteParish = exports.updateParish = exports.getParishByDeanery = exports.getParishByName = exports.getParishById = exports.getAllParishes = exports.createParish = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
// Controllers for parish-related operations
// Create a new parish
exports.createParish = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { parish_name } = req.body;
    if (!parish_name) {
        return res.status(400).json({ message: "parish_name are required" });
    }
    const result = yield db_config_1.default.query("INSERT INTO parishes (parish_name, deanery) VALUES ($1, $2) RETURNING *", [parish_name]);
    res.status(201).json(result);
}));
// Get all parishes
exports.getAllParishes = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_config_1.default.query("SELECT * FROM parishes ");
    res.json(result);
}));
// Get parish by ID
exports.getParishById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield db_config_1.default.query("SELECT * FROM parishes WHERE parish_id = $1", [id]);
    if (result.length === 0) {
        return res.status(404).json({ message: "Parish not found" });
    }
    res.json(result[0]);
}));
// Get parish by name
exports.getParishByName = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.params;
    const result = yield db_config_1.default.query("SELECT * FROM parishes WHERE to_tsvector(parish_name) @@ plainto_tsquery($1)", [name]);
    if (result.length === 0) {
        return res.status(404).json({ message: "Parish not found" });
    }
    res.json(result[0]);
}));
exports.getParishByDeanery = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deanery } = req.params;
    const result = yield db_config_1.default.query("SELECT * FROM parishes WHERE to_tsvector(deanery) @@ plainto_tsquery($1)", [deanery]);
    if (result.length === 0) {
        return res.status(404).json({ message: "No parishes found for this deanery" });
    }
    res.json(result);
}));
// Update parish by PATCH
exports.updateParish = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let idx = 1;
    if (req.body.parish_name) {
        fields.push(`parish_name = $${idx++}`);
        values.push(req.body.parish_name);
    }
    if (fields.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
    }
    values.push(id);
    const result = yield db_config_1.default.query(`UPDATE parishes SET ${fields.join(", ")} WHERE parish_id = $${idx} RETURNING *`, values);
    if (result.length === 0) {
        return res.status(404).json({ message: "Parish not found" });
    }
    res.json(result[0]);
}));
// Delete parish
exports.deleteParish = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield db_config_1.default.query("DELETE FROM parishes WHERE parish_id = $1 RETURNING *", [id]);
    if (result.length === 0) {
        return res.status(404).json({ message: "Parish not found" });
    }
    res.json({ message: "Parish deleted successfully" });
}));
