import express from "express"
import { protect } from "../middlewares/auth/protect"
import { createConfirmation, deleteConfirmation, getConfirmation,  getConfirmationById, getConfirmationByUserId, updateConfirmation } from "../controllers/confirmController"
import { ownUserSuperUserEditorGuard, superUserEditorGuard } from "../middlewares/auth/roleMiddleWare"
import { auditLog } from "../middlewares/auditLogger"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect, ownUserSuperUserEditorGuard, auditLog('CREATE', 'confirmation'), createConfirmation)
router.get("/",protect, getConfirmation)
router.get("/:id",protect, getConfirmationById)
router.get("/user/:userId",protect, getConfirmationByUserId)
router.put("/:id",protect, ownUserSuperUserEditorGuard, auditLog('UPDATE', 'confirmation'), updateConfirmation)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", protect, superUserEditorGuard, auditLog('DELETE', 'confirmation'), deleteConfirmation)



export default router