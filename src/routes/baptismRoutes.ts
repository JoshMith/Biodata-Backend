import express from "express"
import { protect } from "../middlewares/auth/protect"
import { adminClergyGuard, adminGuard } from "../middlewares/auth/roleMiddleWare"
import { createBaptism, deleteBaptism, getBaptism,  getBaptismById, getBaptismByUserId, updateBaptism } from "../controllers/baptismController"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect,adminClergyGuard, createBaptism)
router.get("/",protect,adminClergyGuard, getBaptism)
router.get("/:id",protect,adminClergyGuard, getBaptismById)
router.get("/user/:userId",protect,adminClergyGuard, getBaptismByUserId)
router.put("/:id",protect,adminClergyGuard, updateBaptism)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id",adminClergyGuard, deleteBaptism)



export default router