const express = require("express");

const {
  analyzeResume,
  getAnalysis,
} = require("../controllers/resumeAnalysisController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/:resumeId/analyze",
  protect,
  analyzeResume
);

router.get(
  "/:resumeId",
  protect,
  getAnalysis
);

module.exports = router;