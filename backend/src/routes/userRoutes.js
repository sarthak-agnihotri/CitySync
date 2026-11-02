const express = require("express");
const router = express.Router();

const {
  assignDepartment,
  getUsers,
  createOfficer,
  createDepartmentHead
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Every user route requires login
router.use(authMiddleware);

// Only City Admin can view all users
router.get("/", roleMiddleware("city_admin"), getUsers);

// Only City Admin can create officer accounts
router.post(
  "/officers",
  roleMiddleware("city_admin"),
  createOfficer
);

// Only City Admin can create the central department head
router.post(
  "/department-head",
  roleMiddleware("city_admin"),
  createDepartmentHead
);

// Only City Admin can assign departments
router.patch(
  "/:userId/department",
  roleMiddleware("city_admin"),
  assignDepartment
);

module.exports = router;