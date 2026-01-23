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
import { superUserEditorGuard, allGuard, allViewersGuard, superuserGuard, ownUserSuperUserEditorGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

router.post("/", protect, superUserEditorGuard, addUser);
router.get("/", protect, allGuard, getUsers);
router.get("/count", protect, allGuard, getUserCount);
router.get("/name/:name", protect, allGuard, getUserByName);
router.get("/:id", protect, allGuard, getUserById);
router.put("/:id", protect, ownUserSuperUserEditorGuard, updateUser);
router.delete("/:id", protect, superuserGuard, deleteUser);


export default router;
