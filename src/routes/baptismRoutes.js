"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/auth/protect");
const baptismController_1 = require("../controllers/baptismController");
const roleMiddleWare_1 = require("../middlewares/auth/roleMiddleWare");
//instance of router
const router = express_1.default.Router();
//Librarian Access
//Librarians can create, update, and delete books
router.post("/", protect_1.protect, roleMiddleWare_1.ownUserSuperUserEditorGuard, baptismController_1.createBaptism);
router.get("/", protect_1.protect, baptismController_1.getBaptism);
router.get("/:id", protect_1.protect, baptismController_1.getBaptismById);
router.get("/user/:userId", protect_1.protect, baptismController_1.getBaptismByUserId);
router.put("/:id", protect_1.protect, roleMiddleWare_1.ownUserSuperUserEditorGuard, baptismController_1.updateBaptism);
//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", protect_1.protect, roleMiddleWare_1.superUserEditorGuard, baptismController_1.deleteBaptism);
exports.default = router;
