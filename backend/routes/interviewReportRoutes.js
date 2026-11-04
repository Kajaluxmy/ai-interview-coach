const express = require("express");

const {
  generateReport,
  getReport,
  getUserReports,
} = require("../controllers/interviewReportController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getUserReports);
router.post("/:interviewId/generate", protect, generateReport);
router.get("/:interviewId", protect, getReport);

module.exports = router;
