import express from "express"
import { protect } from "../middlewares/auth/protect"
import { createBaptism, deleteBaptism, getBaptism,  getBaptismById, getBaptismByUserId, updateBaptism } from "../controllers/baptismController"
import { ownUserSuperUserEditorGuard, superUserEditorGuard } from "../middlewares/auth/roleMiddleWare"
import { auditLog } from "../middlewares/auditLogger"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect, ownUserSuperUserEditorGuard, auditLog('CREATE', 'baptism'), createBaptism)
router.get("/",protect, getBaptism)
router.get("/:id",protect, getBaptismById)
router.get("/user/:userId",protect, getBaptismByUserId)
router.put("/:id",protect, ownUserSuperUserEditorGuard, auditLog('UPDATE', 'baptism'), updateBaptism)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", protect, superUserEditorGuard, auditLog('DELETE', 'baptism'), deleteBaptism)



export default router