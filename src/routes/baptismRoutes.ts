import express from "express"
import { protect } from "../middlewares/auth/protect"
import {  adminGuard } from "../middlewares/auth/roleMiddleWare"
import { createBaptism, deleteBaptism, getBaptism,  getBaptismById, getBaptismByUserId, updateBaptism } from "../controllers/baptismController"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect, createBaptism)
router.get("/",protect, getBaptism)
router.get("/:id",protect, getBaptismById)
router.get("/user/:userId",protect, getBaptismByUserId)
router.put("/:id",protect, updateBaptism)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", deleteBaptism)



export default router