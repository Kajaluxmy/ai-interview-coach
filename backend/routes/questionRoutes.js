const express = require("express");

const {
  createQuestion,
  generateQuestions,
  getQuestions,
  getQuestion,
  getHint,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:interviewId/generate", protect, generateQuestions);
router.post("/:interviewId", protect, createQuestion);
router.get("/:interviewId", protect, getQuestions);
router.get("/single/:id", protect, getQuestion);
router.get("/hint/:id", protect, getHint);
router.put("/:id", protect, updateQuestion);
router.delete("/:id", protect, deleteQuestion);

module.exports = router;
