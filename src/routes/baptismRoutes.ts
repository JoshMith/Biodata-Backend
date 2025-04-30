import express from "express"
import { protect } from "../middlewares/auth/protect"
import { adminClergyGuard, adminGuard } from "../middlewares/auth/roleMiddleWare"
import { createBaptism, deleteBaptism, getBaptism, getBaptismById, updateBaptism } from "../controllers/baptismController"

//instance of router
const router = express.Router()

//Librarian Access
//Librarians can create, update, and delete books
router.post("/", createBaptism)
router.get("/", getBaptism)
router.get("/:id", getBaptismById)
router.put("/:id", updateBaptism)



//Admins can manage all books
//Admins can create, update, and delete books
router.delete("/:id", deleteBaptism)



export default router