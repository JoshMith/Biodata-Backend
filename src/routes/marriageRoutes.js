"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/auth/protect");
const marriageController_1 = require("../controllers/marriageController");
const roleMiddleWare_1 = require("../middlewares/auth/roleMiddleWare");
const router = express_1.default.Router();
// Marriage routes
router.post('/', protect_1.protect, roleMiddleWare_1.ownUserSuperUserEditorGuard, marriageController_1.createMarriage);
router.get('/', protect_1.protect, marriageController_1.getAllMarriages);
// router.get('/user/:user_id', protect, getUserMarriages);
router.get('/user/:user_id/full', protect_1.protect, marriageController_1.getFullMarriageByUserId);
router.get('/:id', protect_1.protect, marriageController_1.getMarriageById);
router.put('/:id', protect_1.protect, roleMiddleWare_1.ownUserSuperUserEditorGuard, marriageController_1.updateMarriage);
router.delete('/:id', protect_1.protect, roleMiddleWare_1.superUserEditorGuard, marriageController_1.deleteMarriage);
exports.default = router;
