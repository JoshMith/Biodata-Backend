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
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUserByName = exports.getUserCount = exports.getUsers = exports.addUser = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../utils/helpers/sendEmail");
// Add a new user
exports.addUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role, phone_number, registration_number, first_name, last_name, middle_name, mother, father, birth_place, subcounty, birth_date, tribe, clan, residence, parish_id } = req.body;
        // Check if email already exists
        const emailCheck = yield db_config_1.default.query("SELECT * FROM users WHERE email = $1", [email]);
        if (emailCheck.length > 0) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }
        // Hash the password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        // Insert the new user
        const newUser = yield db_config_1.default.query(`INSERT INTO users (
                email, password_hash, role, phone_number, registration_number, first_name, last_name, middle_name, mother, father, 
                birth_place, subcounty, birth_date, tribe, clan, residence, parish_id
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
            ) RETURNING *`, [
            email, hashedPassword, "member", phone_number, registration_number, first_name, last_name, middle_name, mother, father,
            birth_place, subcounty, birth_date, tribe, clan, residence, parish_id
        ]);
        const user = newUser[0];
        //generate verification token
        const emailToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        //send verification email
        yield (0, sendEmail_1.sendVerificationEmail)(user.email, emailToken);
        // Generate the JWT token (custom function for token generation)
        // await generateToken(res, user.id, user.role);
        res.status(201).json({
            message: "User successfully added",
            user: newUser[0],
        });
    }
    catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//Get All users 
exports.getUsers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_config_1.default.query("SELECT * FROM users ORDER BY id ASC ");
        res.json(result);
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//Get total number of users 
exports.getUserCount = (0, asyncHandler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_config_1.default.query("SELECT COUNT(*) AS usercount FROM users");
        const userCount = parseInt(result[0].usercount, 10);
        res.json({ userCount });
        // console.log("User count:", userCount);
    }
    catch (error) {
        console.error("Error fetching user count:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//Get single user by name
exports.getUserByName = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.params;
        const result = yield db_config_1.default.query("SELECT * FROM users WHERE TRIM(LOWER(name)) = TRIM(LOWER($1))", [name]);
        if (result.length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        res.json(result[0]);
    }
    catch (error) {
        console.error("Error fetching user by name:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//Get single user by Id
exports.getUserById = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield db_config_1.default.query("SELECT * FROM users WHERE id = $1", [id]);
        if (result.length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        res.json(result[0]);
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//update user
exports.updateUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { email, password, role, phone_number, registration_number, first_name, last_name, middle_name, mother, father, birth_place, subcounty, birth_date, tribe, clan, residence, parish_id } = req.body;
        // Check if user exists
        const userCheck = yield db_config_1.default.query("SELECT * FROM users WHERE id = $1", [id]);
        if (userCheck.length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        // Prepare fields for update
        const fieldsToUpdate = [];
        const values = [];
        let index = 1;
        if (email) {
            fieldsToUpdate.push(`email=$${index++}`);
            values.push(email);
        }
        if (password) {
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(password, salt);
            fieldsToUpdate.push(`password_hash=$${index++}`);
            values.push(hashedPassword);
        }
        if (role) {
            fieldsToUpdate.push(`role=$${index++}`);
            values.push(role);
        }
        if (phone_number) {
            fieldsToUpdate.push(`phone_number=$${index++}`);
            values.push(phone_number);
        }
        if (registration_number) {
            fieldsToUpdate.push(`registration_number=$${index++}`);
            values.push(registration_number);
        }
        if (first_name) {
            fieldsToUpdate.push(`first_name=$${index++}`);
            values.push(first_name);
        }
        if (last_name) {
            fieldsToUpdate.push(`last_name=$${index++}`);
            values.push(last_name);
        }
        if (middle_name) {
            fieldsToUpdate.push(`middle_name=$${index++}`);
            values.push(middle_name);
        }
        if (mother) {
            fieldsToUpdate.push(`mother=$${index++}`);
            values.push(mother);
        }
        if (father) {
            fieldsToUpdate.push(`father=$${index++}`);
            values.push(father);
        }
        if (birth_place) {
            fieldsToUpdate.push(`birth_place=$${index++}`);
            values.push(birth_place);
        }
        if (subcounty) {
            fieldsToUpdate.push(`subcounty=$${index++}`);
            values.push(subcounty);
        }
        if (birth_date) {
            fieldsToUpdate.push(`birth_date=$${index++}`);
            values.push(birth_date);
        }
        if (tribe) {
            fieldsToUpdate.push(`tribe=$${index++}`);
            values.push(tribe);
        }
        if (clan) {
            fieldsToUpdate.push(`clan=$${index++}`);
            values.push(clan);
        }
        if (residence) {
            fieldsToUpdate.push(`residence=$${index++}`);
            values.push(residence);
        }
        if (parish_id) {
            fieldsToUpdate.push(`parish_id=$${index++}`);
            values.push(parish_id);
        }
        if (fieldsToUpdate.length === 0) {
            res.status(400).json({ message: "No fields to update" });
            return;
        }
        values.push(id);
        // Update the user
        const updatedUser = yield db_config_1.default.query(`UPDATE users SET ${fieldsToUpdate.join(", ")} WHERE id = $${index} RETURNING *`, values);
        res.json({
            message: "User successfully updated",
            user: updatedUser[0],
        });
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
//delete user
exports.deleteUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield db_config_1.default.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        if (result.length === 0) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        res.json({ message: "User deleted" });
    }
    catch (error) {
        console.error("Error Deleting this user", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
