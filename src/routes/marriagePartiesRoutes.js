"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/auth/protect");
const marriagePartiesController_1 = require("../controllers/marriagePartiesController");
const roleMiddleWare_1 = require("../middlewares/auth/roleMiddleWare");
const router = express_1.default.Router();
// Marriage Parties routes
router.post('/', protect_1.protect, roleMiddleWare_1.ownUserSuperUserEditorGuard, marriagePartiesController_1.createMarriageParty);
router.get('/', protect_1.protect, marriagePartiesController_1.getMarriageParties);
router.get('/:id', protect_1.protect, marriagePartiesController_1.getMarriagePartyById);
router.put('/:id', protect_1.protect, roleMiddleWare_1.ownUserSuperUserEditorGuard, marriagePartiesController_1.updateMarriageParty);
router.delete('/:id', protect_1.protect, roleMiddleWare_1.superUserEditorGuard, marriagePartiesController_1.deleteMarriageParty);
exports.default = router;
