import express from "express"
import { protect } from "../middlewares/auth/protect"
import {  adminGuard } from "../middlewares/auth/roleMiddleWare"
import { createEucharist, deleteEucharist, getEucharist,  getEucharistById,  getEucharistByUserId,  updateEucharist } from "../controllers/eucharistController"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect, createEucharist)
router.get("/",protect, getEucharist)
router.get("/:id",protect, getEucharistById)
router.get("/user/:userId",protect, getEucharistByUserId)
router.put("/:id",protect, updateEucharist)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", deleteEucharist)



export default router