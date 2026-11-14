
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createMilestone,
  getProjectMilestones,
  updateMilestone,
  deleteMilestone
} = require("../controllers/milestoneController");

// All milestone routes require login
router.use(authMiddleware);

// View project milestones
// All authenticated roles can view
router.get("/project/:projectId", getProjectMilestones);

// Only City Admin and Department Heads can create
router.post(
  "/project/:projectId",
  roleMiddleware("city_admin", "department_head"),
  createMilestone
);

// Only City Admin and Department Heads can update
router.put(
  "/:id",
  roleMiddleware("city_admin", "department_head"),
  updateMilestone
);

// Only City Admin and Department Heads can delete
router.delete(
  "/:id",
  roleMiddleware("city_admin", "department_head"),
  deleteMilestone
);

module.exports = router;
