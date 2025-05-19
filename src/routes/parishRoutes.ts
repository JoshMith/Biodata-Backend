import express from "express"
import { protect } from "../middlewares/auth/protect"
import { createParish, deleteParish, getAllParishes, getParishById, getParishByName, getParishesByDeanery, updateParish } from "../controllers/parishController";
import { } from "../middlewares/auth/roleMiddleWare";

const router = express.Router()

router.post("/", createParish);
router.get("/", protect,  getAllParishes);
router.get("/:id", protect,  getParishById);
// router.get("/:id", getParishById);
router.get("/name/:name", protect,  getParishByName);
router.get("/deanery/:deanery", protect,  getParishesByDeanery);
router.put("/:id",protect,  updateParish);
router.delete("/:id", protect, deleteParish);


export default router