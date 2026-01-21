"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersController_1 = require("../controllers/usersController");
const protect_1 = require("../middlewares/auth/protect");
const roleMiddleWare_1 = require("../middlewares/auth/roleMiddleWare");
const router = express_1.default.Router();
router.post("/", protect_1.protect, roleMiddleWare_1.superUserEditorGuard, usersController_1.addUser);
router.get("/", protect_1.protect, roleMiddleWare_1.allGuard, usersController_1.getUsers);
router.get("/count", protect_1.protect, roleMiddleWare_1.allGuard, usersController_1.getUserCount);
router.get("/name/:name", protect_1.protect, roleMiddleWare_1.allGuard, usersController_1.getUserByName);
router.get("/:id", protect_1.protect, roleMiddleWare_1.allGuard, usersController_1.getUserById);
router.put("/:id", protect_1.protect, roleMiddleWare_1.ownUserSuperUserEditorGuard, usersController_1.updateUser);
router.delete("/:id", protect_1.protect, roleMiddleWare_1.superuserGuard, usersController_1.deleteUser);
exports.default = router;
