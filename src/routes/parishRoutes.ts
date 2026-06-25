import express from "express"
import { protect } from "../middlewares/auth/protect"
import { createParish, deleteParish, getAllParishes, getParishByDeanery, getParishById, getParishByName, updateParish } from "../controllers/parishController";
import { superAdminGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router()

router.post("/", superAdminGuard, createParish);
router.get("/", getAllParishes);
router.get("/:id", protect,  getParishById);
router.get("/deanery/:deanery",getParishByDeanery)
// router.get("/:id", getParishById);
router.get("/name/:name", protect,  getParishByName);
router.put("/:id",protect, superAdminGuard, updateParish);
router.delete("/:id", protect, superAdminGuard, deleteParish);


export default router