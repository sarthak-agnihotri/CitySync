
const express = require("express");
const router = express.Router();

const {assignDepartment,getUsers} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Every user route requires login
router.use(authMiddleware);
// Only City Admin can view all users
router.get("/", roleMiddleware("city_admin"), getUsers);
// Only City Admin can assign departments
router.patch(
  "/:userId/department",
  roleMiddleware("city_admin"),
  assignDepartment
);

module.exports = router;
