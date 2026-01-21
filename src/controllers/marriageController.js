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
exports.deleteMarriage = exports.updateMarriage = exports.getMarriageById = exports.getFullMarriageByUserId = exports.getUserMarriages = exports.getAllMarriages = exports.createMarriage = void 0;
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const db_config_1 = __importDefault(require("../config/db.config"));
// CREATE a new marriage record
exports.createMarriage = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, certificate_number, submission_location, submission_sub_county, submission_county, marriage_date, marriage_entry_number, registrar_certification_number, special_license_number, conducted_by, private_parties_count, private_parties_names, } = req.body;
    const result = yield db_config_1.default.query(`INSERT INTO marriages (
            user_id, certificate_number, submission_location, submission_sub_county, submission_county,
            marriage_date, marriage_entry_number, registrar_certification_number, special_license_number,
            conducted_by, private_parties_count, private_parties_names
        ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
        ) RETURNING *`, [
        user_id,
        certificate_number,
        submission_location,
        submission_sub_county,
        submission_county,
        marriage_date,
        marriage_entry_number,
        registrar_certification_number,
        special_license_number,
        conducted_by,
        private_parties_count,
        private_parties_names,
    ]);
    res.status(201).json(result);
}));
// READ all marriage records
exports.getAllMarriages = (0, asyncHandler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_config_1.default.query('SELECT * FROM marriages');
    res.json(result);
}));
// READ all marriage records for a specific user
exports.getUserMarriages = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    const result = yield db_config_1.default.query('SELECT * FROM marriages WHERE user_id = $1', [user_id]);
    if (result.length === 0) {
        return res.status(404).json({ error: 'No marriage records found for this user' });
    }
    res.json(result);
}));
// Add this new function to your marriages2Controller.ts
exports.getFullMarriageByUserId = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    const query = `
        SELECT 
            m.*,
            json_agg(
                DISTINCT jsonb_build_object(
                    'party_id', mp.party_id,
                    'party_type', mp.party_type,
                    'full_name', mp.full_name,
                    'age', mp.age,
                    'marital_status', mp.marital_status,
                    'residence_address', mp.residence_address,
                    'residence_county', mp.residence_county,
                    'residence_sub_county', mp.residence_sub_county,
                    'occupation', mp.occupation,
                    'father_name', mp.father_name,
                    'father_occupation', mp.father_occupation,
                    'father_residence', mp.father_residence,
                    'mother_name', mp.mother_name,
                    'mother_occupation', mp.mother_occupation,
                    'mother_residence', mp.mother_residence
                )
            ) AS parties,
            json_agg(
                DISTINCT jsonb_build_object(
                    'document_id', md.document_id,
                    'document_type', md.document_type,
                    'file_name', md.file_name,
                    'file_path', md.file_path,
                    'file_size', md.file_size,
                    'uploaded_at', md.uploaded_at
                )
            ) AS documents
        FROM marriages m
        LEFT JOIN marriage_parties mp ON m.marriage_id = mp.marriage_id
        LEFT JOIN marriage_documents md ON m.marriage_id = md.marriage_id
        WHERE m.user_id = $1
        GROUP BY m.marriage_id
        ORDER BY m.marriage_date DESC
    `;
    const result = yield db_config_1.default.query(query, [user_id]);
    if (result.length === 0) {
        return res.status(404).json({
            error: 'No marriage records found for this user'
        });
    }
    res.json(result);
}));
// READ a single marriage record by ID
exports.getMarriageById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield db_config_1.default.query('SELECT * FROM marriages WHERE marriage_id = $1', [id]);
    if (result.length === 0) {
        return res.status(404).json({ error: 'Marriage record not found' });
    }
    res.json(result[0]);
}));
// UPDATE a marriage record with file upload support
exports.updateMarriage = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { certificate_number, submission_location, submission_sub_county, submission_county, marriage_date, marriage_entry_number, registrar_certification_number, special_license_number, conducted_by, private_parties_count, private_parties_names, } = req.body;
        const fieldsToUpdate = [];
        const values = [];
        let index = 1;
        if (certificate_number) {
            fieldsToUpdate.push(`certificate_number = $${index++}`);
            values.push(certificate_number);
        }
        if (submission_location) {
            fieldsToUpdate.push(`submission_location = $${index++}`);
            values.push(submission_location);
        }
        if (submission_sub_county) {
            fieldsToUpdate.push(`submission_sub_county = $${index++}`);
            values.push(submission_sub_county);
        }
        if (submission_county) {
            fieldsToUpdate.push(`submission_county = $${index++}`);
            values.push(submission_county);
        }
        if (marriage_date) {
            fieldsToUpdate.push(`marriage_date = $${index++}`);
            values.push(marriage_date);
        }
        if (marriage_entry_number) {
            fieldsToUpdate.push(`marriage_entry_number = $${index++}`);
            values.push(marriage_entry_number);
        }
        if (registrar_certification_number) {
            fieldsToUpdate.push(`registrar_certification_number = $${index++}`);
            values.push(registrar_certification_number);
        }
        if (special_license_number) {
            fieldsToUpdate.push(`special_license_number = $${index++}`);
            values.push(special_license_number);
        }
        if (conducted_by) {
            fieldsToUpdate.push(`conducted_by = $${index++}`);
            values.push(conducted_by);
        }
        if (private_parties_count) {
            fieldsToUpdate.push(`private_parties_count = $${index++}`);
            values.push(private_parties_count);
        }
        if (private_parties_names) {
            fieldsToUpdate.push(`private_parties_names = $${index++}`);
            values.push(private_parties_names);
        }
        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields provided for update" });
            return;
        }
        // Always update updated_at
        fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const query = `UPDATE marriages SET ${fieldsToUpdate.join(", ")} WHERE marriage_id = $${index} RETURNING *`;
        const result = yield db_config_1.default.query(query, values);
        if (result.length === 0) {
            return res.status(404).json({ error: 'Marriage record not found' });
        }
        res.json({
            message: "Marriage record updated successfully",
            marriage: result[0]
        });
    }
    catch (error) {
        console.error("Error updating marriage record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// DELETE a marriage record
exports.deleteMarriage = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield db_config_1.default.query('DELETE FROM marriages WHERE marriage_id = $1 RETURNING *', [id]);
    if (result.length === 0) {
        return res.status(404).json({ error: 'Marriage record not found' });
    }
    res.json({ message: 'Marriage record deleted successfully' });
}));
