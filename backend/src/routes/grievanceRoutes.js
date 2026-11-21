const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getGrievances,
  assignGrievance,
  updateGrievance
} = require("../controllers/grievanceController");

router.use(authMiddleware);

// City Admin, Department Head and Officer can view permitted grievances.
router.get("/", getGrievances);

// Only City Admin and Department Heads can assign officers.
router.post(
  "/:id/assign",
  roleMiddleware("city_admin", "department_head"),
  assignGrievance
);

// Controller verifies that the user is the assigned Officer or City Admin.
router.patch("/:id", updateGrievance);

module.exports = router;
