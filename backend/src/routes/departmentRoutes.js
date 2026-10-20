
const express = require("express");
const router = express.Router();

const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deactivateDepartment
} = require("../controllers/departmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Every department route requires login
router.use(authMiddleware);

// Any authenticated user can view active departments
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);

// Only city admins can make changes
router.post(
  "/",
  roleMiddleware("city_admin"),
  createDepartment
);

router.put(
  "/:id",
  roleMiddleware("city_admin"),
  updateDepartment
);

router.patch(
  "/:id/deactivate",
  roleMiddleware("city_admin"),
  deactivateDepartment
);

module.exports = router;
