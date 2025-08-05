import express from "express"
import { protect } from "../middlewares/auth/protect"
import { createEucharist, deleteEucharist, getEucharist,  getEucharistById,  getEucharistByUserId,  updateEucharist } from "../controllers/eucharistController"
import { ownUserSuperUserEditorGuard, superUserEditorGuard } from "../middlewares/auth/roleMiddleWare"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect, ownUserSuperUserEditorGuard, createEucharist)
router.get("/",protect, getEucharist)
router.get("/:id",protect, getEucharistById)
router.get("/user/:userId",protect, getEucharistByUserId)
router.put("/:id",protect, ownUserSuperUserEditorGuard, updateEucharist)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", protect, superUserEditorGuard, deleteEucharist)



export default router