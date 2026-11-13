
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createTask,
  getMilestoneTasks,
  getMyTasks,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

// All task routes require authentication
router.use(authMiddleware);

// Get current user's assigned tasks
router.get("/my", getMyTasks);

// Get tasks belonging to a milestone
router.get(
  "/milestone/:milestoneId",
  getMilestoneTasks
);

// Only City Admin and Department Heads can assign tasks
router.post(
  "/milestone/:milestoneId",
  roleMiddleware("city_admin", "department_head"),
  createTask
);

// Managers and assigned officers can update tasks
router.put("/:id", updateTask);

// Only City Admin and Department Heads can delete tasks
router.delete(
  "/:id",
  roleMiddleware("city_admin", "department_head"),
  deleteTask
);

module.exports = router;
