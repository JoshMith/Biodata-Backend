import express from 'express'
import { 
  loginUser, 
  logoutUser, 
  registerUser, 
  verifyEmail,
  requestPasswordReset,
  verifyResetToken,
  resetPassword
} from '../controllers/authController'
import { auditLog } from '../middlewares/auditLogger'

const router = express.Router()

// Public routes 
router.post("/register", auditLog('CREATE', 'users'), registerUser)
router.post("/login", loginUser)
router.post("/logout", logoutUser)
router.get("/verifyEmail", verifyEmail)

// Password reset routes
router.post("/request-password-reset", requestPasswordReset)
router.get("/verify-reset-token", verifyResetToken)
router.post("/reset-password", resetPassword)

export default router