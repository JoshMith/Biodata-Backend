import express from "express"
import { protect } from "../middlewares/auth/protect"
import { adminClergyGuard, adminGuard } from "../middlewares/auth/roleMiddleWare"
import { createConfirmation, deleteConfirmation, getConfirmation,  getConfirmationById, getConfirmationByUserId, updateConfirmation } from "../controllers/confirmController"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/", createConfirmation)
router.get("/", getConfirmation)
router.get("/:id", getConfirmationById)
router.get("/user/:userId", getConfirmationByUserId)
router.put("/:id", updateConfirmation)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", deleteConfirmation)



export default router