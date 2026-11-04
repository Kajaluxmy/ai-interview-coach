const express = require("express");

const {
  createInterview,
  getInterviews,
  getInterview,
  startInterview,
  completeInterview,
  deleteInterview,
} = require("../controllers/interviewController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createInterview);

router.get("/", protect, getInterviews);

router.get("/:id", protect, getInterview);

router.patch("/:id/start", protect, startInterview);

router.patch("/:id/complete", protect, completeInterview);

router.delete("/:id", protect, deleteInterview);

module.exports = router;
