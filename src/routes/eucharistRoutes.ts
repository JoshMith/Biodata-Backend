import express from "express"
import { protect } from "../middlewares/auth/protect"
import { createEucharist, deleteEucharist, getEucharist,  getEucharistById,  getEucharistByUserId,  updateEucharist } from "../controllers/eucharistController"
import { superUserEditorGuard } from "../middlewares/auth/roleMiddleWare"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect, superUserEditorGuard, createEucharist)
router.get("/",protect, getEucharist)
router.get("/:id",protect, getEucharistById)
router.get("/user/:userId",protect, getEucharistByUserId)
router.put("/:id",protect, superUserEditorGuard, updateEucharist)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", protect, superUserEditorGuard, deleteEucharist)



export default router