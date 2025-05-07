import express from "express"
import { protect } from "../middlewares/auth/protect"
import { adminClergyGuard, adminGuard } from "../middlewares/auth/roleMiddleWare"
import { createEucharist, deleteEucharist, getEucharist,  getEucharistById,  getEucharistByUserId,  updateEucharist } from "../controllers/eucharistController"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/", createEucharist)
router.get("/", getEucharist)
router.get("/:id", getEucharistById)
router.get("/user/:userId", getEucharistByUserId)
router.put("/:id", updateEucharist)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", deleteEucharist)



export default router