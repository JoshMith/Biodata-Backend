import express from "express"
import { protect } from "../middlewares/auth/protect"
import { adminGuard } from "../middlewares/auth/roleMiddleWare"
import { createMarriage, deleteMarriage, getMarriage, getMarriageById, getMarriageByUserId, updateMarriage } from "../controllers/marriageController"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect, createMarriage)
router.get("/",protect, getMarriage)
router.get("/:id",protect, getMarriageById)
router.get("/user/:userId",protect, getMarriageByUserId)
router.put("/:id",protect, updateMarriage)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", deleteMarriage)



export default router