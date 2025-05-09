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
import { adminClergyGuard, adminGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

router.post("/", protect,adminClergyGuard, addUser);
router.get("/", protect,adminClergyGuard, getUsers);
router.get("/count", protect,adminClergyGuard, getUserCount);
router.get("/name/:name", protect,adminClergyGuard, getUserByName);
router.get("/:id", protect,adminClergyGuard, getUserById);
router.put("/:id", protect,adminClergyGuard, updateUser);
router.delete("/:id", protect,adminClergyGuard, deleteUser);

export default router;
