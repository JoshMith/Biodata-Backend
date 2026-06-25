import express from "express"
import { protect } from "../middlewares/auth/protect"
import { createBaptism, deleteBaptism, getBaptism,  getBaptismById, getBaptismByUserId, updateBaptism } from "../controllers/baptismController"
import { adminsPlusOwnersGuard, allAdminsGuard } from "../middlewares/auth/roleMiddleWare"
import { auditLog } from "../middlewares/auditLogger"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect, adminsPlusOwnersGuard, auditLog('CREATE', 'baptism'), createBaptism)
router.get("/",protect, getBaptism)
router.get("/:id",protect, getBaptismById)
router.get("/user/:userId",protect, getBaptismByUserId)
router.put("/:id",protect, adminsPlusOwnersGuard, auditLog('UPDATE', 'baptism'), updateBaptism)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", protect, allAdminsGuard, auditLog('DELETE', 'baptism'), deleteBaptism)



export default router