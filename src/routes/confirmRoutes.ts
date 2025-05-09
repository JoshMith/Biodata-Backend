import express from "express"
import { protect } from "../middlewares/auth/protect"
import { adminClergyGuard, adminGuard } from "../middlewares/auth/roleMiddleWare"
import { createConfirmation, deleteConfirmation, getConfirmation,  getConfirmationById, getConfirmationByUserId, updateConfirmation } from "../controllers/confirmController"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/",protect,adminClergyGuard, createConfirmation)
router.get("/",protect,adminClergyGuard, getConfirmation)
router.get("/:id",protect,adminClergyGuard, getConfirmationById)
router.get("/user/:userId",protect,adminClergyGuard, getConfirmationByUserId)
router.put("/:id",protect,adminClergyGuard, updateConfirmation)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id",adminClergyGuard, deleteConfirmation)



export default router