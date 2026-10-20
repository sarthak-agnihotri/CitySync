const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getTimelineSchedule,
  getCalendarSchedule
} = require("../controllers/projectController");

// All project routes require authentication
router.use(authMiddleware);

// Scheduling / Timeline routes (registered before /:id)
router.get("/schedule/timeline", getTimelineSchedule);
router.get("/schedule/calendar", getCalendarSchedule);

// Project CRUD
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", roleMiddleware("city_admin", "department_head", "officer"), createProject);
router.put("/:id", roleMiddleware("city_admin", "department_head"), updateProject);
router.delete("/:id", roleMiddleware("city_admin", "department_head"), deleteProject);

module.exports = router;
