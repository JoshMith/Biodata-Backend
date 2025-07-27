import express from "express"
import { protect } from "../middlewares/auth/protect"
import { createBaptism, deleteBaptism, getBaptism,  getBaptismById, getBaptismByUserId, updateBaptism } from "../controllers/baptismController"
import { superUserEditorGuard } from "../middlewares/auth/roleMiddleWare"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect, superUserEditorGuard, createBaptism)
router.get("/",protect, getBaptism)
router.get("/:id",protect, getBaptismById)
router.get("/user/:userId",protect, getBaptismByUserId)
router.put("/:id",protect, superUserEditorGuard, updateBaptism)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", protect, superUserEditorGuard, deleteBaptism)



export default router