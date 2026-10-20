const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getConflicts,
  getConflictById,
  checkDraft,
  resolveConflict
} = require("../controllers/conflictController");

// All conflict routes require authentication
router.use(authMiddleware);

// Check / simulation endpoint (registered before /:id)
router.post("/check", checkDraft);

// Conflict endpoints
router.get("/", getConflicts);
router.get("/:id", getConflictById);
router.put(
  "/:id/resolve",
  roleMiddleware("city_admin", "department_head"),
  resolveConflict
);

module.exports = router;
