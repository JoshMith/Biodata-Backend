"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/auth/protect");
const confirmController_1 = require("../controllers/confirmController");
const roleMiddleWare_1 = require("../middlewares/auth/roleMiddleWare");
//instance of router
const router = express_1.default.Router();
//Librarian Access
//Librarians can create, update, and delete books
router.post("/", protect_1.protect, roleMiddleWare_1.ownUserSuperUserEditorGuard, confirmController_1.createConfirmation);
router.get("/", protect_1.protect, confirmController_1.getConfirmation);
router.get("/:id", protect_1.protect, confirmController_1.getConfirmationById);
router.get("/user/:userId", protect_1.protect, confirmController_1.getConfirmationByUserId);
router.put("/:id", protect_1.protect, roleMiddleWare_1.ownUserSuperUserEditorGuard, confirmController_1.updateConfirmation);
//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", protect_1.protect, roleMiddleWare_1.superUserEditorGuard, confirmController_1.deleteConfirmation);
exports.default = router;
