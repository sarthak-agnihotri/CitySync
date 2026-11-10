const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/citizenAuthController");
const { citizenAuthMiddleware } = require("../middleware/citizenAuthMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", citizenAuthMiddleware, getMe);

module.exports = router;

