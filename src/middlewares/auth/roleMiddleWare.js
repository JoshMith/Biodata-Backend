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
exports.allGuard = exports.ownUserSuperUserEditorGuard = exports.superUserEditorGuard = exports.allViewersGuard = exports.memberGuard = exports.editorGuard = exports.viewerGuard = exports.superuserGuard = exports.roleGuard = void 0;
const asyncHandler_1 = __importDefault(require("../asyncHandler"));
//ensure user has required roles
const roleGuard = (allowedRoles, ...args) => (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        res.status(403).json({ message: "Access denied: Insufficient permissions" });
        return;
    }
    next();
}));
exports.roleGuard = roleGuard;
// // Specific guards
exports.superuserGuard = (0, exports.roleGuard)(["superuser"]);
exports.viewerGuard = (0, exports.roleGuard)(["viewer"]);
exports.editorGuard = (0, exports.roleGuard)(["editor"]);
exports.memberGuard = (0, exports.roleGuard)(["member"]);
exports.allViewersGuard = (0, exports.roleGuard)(["superuser", "viewer", "editor"]);
exports.superUserEditorGuard = (0, exports.roleGuard)(["superuser", "editor"]);
exports.ownUserSuperUserEditorGuard = (0, exports.roleGuard)(["superuser", "editor", "member"]);
exports.allGuard = (0, exports.roleGuard)(["superuser", "viewer", "editor", "member"]);
