"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/auth/protect");
const parishController_1 = require("../controllers/parishController");
const roleMiddleWare_1 = require("../middlewares/auth/roleMiddleWare");
const router = express_1.default.Router();
router.post("/", roleMiddleWare_1.superuserGuard, parishController_1.createParish);
router.get("/", parishController_1.getAllParishes);
router.get("/:id", protect_1.protect, parishController_1.getParishById);
router.get("/deanery/:deanery", parishController_1.getParishByDeanery);
// router.get("/:id", getParishById);
router.get("/name/:name", protect_1.protect, parishController_1.getParishByName);
router.put("/:id", protect_1.protect, roleMiddleWare_1.superuserGuard, parishController_1.updateParish);
router.delete("/:id", protect_1.protect, roleMiddleWare_1.superuserGuard, parishController_1.deleteParish);
exports.default = router;
