import express from "express"
import { protect } from "../middlewares/auth/protect"
import { createConfirmation, deleteConfirmation, getConfirmation,  getConfirmationById, getConfirmationByUserId, updateConfirmation } from "../controllers/confirmController"
import { superUserEditorGuard } from "../middlewares/auth/roleMiddleWare"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect, superUserEditorGuard, createConfirmation)
router.get("/",protect, getConfirmation)
router.get("/:id",protect, getConfirmationById)
router.get("/user/:userId",protect, getConfirmationByUserId)
router.put("/:id",protect, superUserEditorGuard, updateConfirmation)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", protect, superUserEditorGuard, deleteConfirmation)



export default router