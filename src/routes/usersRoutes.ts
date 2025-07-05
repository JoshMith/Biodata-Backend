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
import { adminEditorGuard, allViewersGuard, superuserGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

router.post("/", protect, addUser);
router.get("/", protect, allViewersGuard, getUsers);
router.get("/count", protect, allViewersGuard, getUserCount);
router.get("/name/:name", protect, allViewersGuard, getUserByName);
router.get("/:id", protect, allViewersGuard, getUserById);
router.put("/:id", protect, adminEditorGuard, updateUser);
router.delete("/:id", protect, superuserGuard, deleteUser);


export default router;
