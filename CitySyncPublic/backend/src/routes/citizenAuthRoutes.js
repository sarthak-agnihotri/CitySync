const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require("../controllers/citizenAuthController");
const { citizenAuthMiddleware } = require("../middleware/citizenAuthMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", citizenAuthMiddleware, getMe);
router.put("/profile", citizenAuthMiddleware, updateProfile);
router.post("/change-password", citizenAuthMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
