import express from "express";
import {
    addUser,
    deleteUser,
    getUserById,
    getUserByName,
    getUserCount,
    getUsers,
    updateUser,
} from "../controllers/usersController";
import { protect } from "../middlewares/auth/protect";
import { allGuard, adminsPlusOwnersGuard, superAdminGuard } from "../middlewares/auth/roleMiddleWare";
import { auditLog } from "../middlewares/auditLogger";

const router = express.Router();

router.post("/", protect, adminsPlusOwnersGuard, auditLog('CREATE', 'users'), addUser);
router.get("/", protect, allGuard, getUsers);
router.get("/count", protect, allGuard, getUserCount);
router.get("/name/:name", protect, allGuard, getUserByName);
router.get("/:id", protect, allGuard, getUserById);
router.put("/:id", protect, adminsPlusOwnersGuard, auditLog('UPDATE', 'users'), updateUser);
router.delete("/:id", protect, superAdminGuard, auditLog('DELETE', 'users'), deleteUser);


export default router;
