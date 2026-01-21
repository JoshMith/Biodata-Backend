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
exports.deleteMarriageParty = exports.updateMarriageParty = exports.getMarriagePartyById = exports.getMarriageParties = exports.createMarriageParty = void 0;
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const db_config_1 = __importDefault(require("../config/db.config")); // Assumes you have a PostgreSQL pool instance
// CREATE
exports.createMarriageParty = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { marriage_id, party_type, full_name, age, marital_status, residence_address, residence_county, residence_sub_county, occupation, father_name, father_occupation, father_residence, mother_name, mother_occupation, mother_residence, } = req.body;
    const [result] = yield db_config_1.default.query(`INSERT INTO marriage_parties (
            marriage_id, party_type, full_name, age, marital_status, residence_address,
            residence_county, residence_sub_county, occupation, father_name, father_occupation,
            father_residence, mother_name, mother_occupation, mother_residence
        ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
        ) RETURNING *`, [
        marriage_id, party_type, full_name, age, marital_status, residence_address,
        residence_county, residence_sub_county, occupation, father_name, father_occupation,
        father_residence, mother_name, mother_occupation, mother_residence
    ]);
    res.status(201).json(result);
}));
// READ ALL
exports.getMarriageParties = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_config_1.default.query('SELECT * FROM marriage_parties');
    res.json(result);
}));
// READ ONE
exports.getMarriagePartyById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield db_config_1.default.query('SELECT * FROM marriage_parties WHERE party_id = $1', [id]);
    if (result.length === 0) {
        res.status(404).json({ message: 'Marriage party not found' });
        return;
    }
    res.json(result[0]);
}));
// UPDATE
exports.updateMarriageParty = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const fields = [
        'marriage_id', 'party_type', 'full_name', 'age', 'marital_status', 'residence_address',
        'residence_county', 'residence_sub_county', 'occupation', 'father_name', 'father_occupation',
        'father_residence', 'mother_name', 'mother_occupation', 'mother_residence'
    ];
    const updates = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
    const values = fields.map(field => req.body[field]);
    const result = yield db_config_1.default.query(`UPDATE marriage_parties SET ${updates} WHERE party_id = $1 RETURNING *`, [id, ...values]);
    if (result.length === 0) {
        res.status(404).json({ message: 'Marriage party not found' });
        return;
    }
    res.json(result[0]);
}));
// DELETE
exports.deleteMarriageParty = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield db_config_1.default.query('DELETE FROM marriage_parties WHERE party_id = $1 RETURNING *', [id]);
    if (result.length === 0) {
        res.status(404).json({ message: 'Marriage party not found' });
        return;
    }
    res.json({ message: 'Marriage party deleted' });
}));
