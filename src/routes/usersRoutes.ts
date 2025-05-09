import express from "express"
import { addUser, deleteUser, getUserById, getUserByName, getUserCount, getUsers, updateUser} from "../controllers/usersController"
import { adminClergyGuard, adminGuard,  } from "../middlewares/auth/roleMiddleWare"
import { protect } from "../middlewares/auth/protect"

//instance of router
const router = express.Router()

//

//Librarian can manage all users
//Librarians can create, update and get users
router.post("/", addUser)
router.get("/", getUsers)
router.get("/count", getUserCount)
router.get("/:id", getUserById)
router.get("/name/:name", getUserByName)
router.put("/:id",updateUser)

//Admins can manage all users
//Admins can create, update, and delete users
router.delete("/:id",protect, deleteUser)




export default router