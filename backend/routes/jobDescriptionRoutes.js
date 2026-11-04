const express = require("express");

const {
  createJobDescription,
  getJobDescriptions,
  getJobDescription,
  updateJobDescription,
  deleteJobDescription,
  matchResume,
} = require("../controllers/jobDescriptionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createJobDescription);
router.get("/", protect, getJobDescriptions);
router.get("/:id", protect, getJobDescription);
router.put("/:id", protect, updateJobDescription);
router.delete("/:id", protect, deleteJobDescription);
router.post("/:id/match/:resumeId", protect, matchResume);

module.exports = router;
