const express = require("express");

const {
  createEvaluation,
  autoEvaluate,
  getEvaluation,
  getInterviewEvaluations,
} = require("../controllers/evaluationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:answerId", protect, createEvaluation);
router.post("/:answerId/auto", protect, autoEvaluate);
router.get("/:answerId", protect, getEvaluation);
router.get("/interview/:interviewId", protect, getInterviewEvaluations);

module.exports = router;
