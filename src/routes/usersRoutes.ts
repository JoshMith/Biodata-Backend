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
import { adminGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

router.post("/", protect, addUser);
// router.post("/", addUser);
router.get("/", protect, getUsers);
router.get("/count", protect, getUserCount);
router.get("/name/:name", protect, getUserByName);
router.get("/:id", protect, getUserById);
router.patch("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);
// router.delete("/:id",deleteUser);


export default router;
