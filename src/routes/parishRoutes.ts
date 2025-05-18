import express from "express"
import { protect } from "../middlewares/auth/protect"
import { createParish, deleteParish, getAllParishes, getParishById, getParishByName, getParishesByDeanery, updateParish } from "../controllers/parishController";
import { adminClergyGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router()

router.post("/", createParish);
router.get("/", protect, adminClergyGuard, getAllParishes);
router.get("/:id", protect, adminClergyGuard, getParishById);
// router.get("/:id", getParishById);
router.get("/name/:name", protect, adminClergyGuard, getParishByName);
router.get("/deanery/:deanery", protect, adminClergyGuard, getParishesByDeanery);
router.put("/:id",protect, adminClergyGuard, updateParish);
router.delete("/:id", protect, adminClergyGuard, deleteParish);


export default router