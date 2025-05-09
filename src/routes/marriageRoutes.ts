import express from "express"
import { protect } from "../middlewares/auth/protect"
import { adminClergyGuard, adminGuard } from "../middlewares/auth/roleMiddleWare"
import { createMarriage, deleteMarriage, getMarriage, getMarriageById, getMarriageByUserId, updateMarriage } from "../controllers/marriageController"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect,adminClergyGuard, createMarriage)
router.get("/",protect,adminClergyGuard, getMarriage)
router.get("/:id",protect,adminClergyGuard, getMarriageById)
router.get("/user/:userId",protect,adminClergyGuard, getMarriageByUserId)
router.put("/:id",protect,adminClergyGuard, updateMarriage)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id",adminClergyGuard, deleteMarriage)



export default router