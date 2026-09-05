const express = require("express");

const {
  createQuestion,
  getQuestions,
} = require("../controllers/questionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/:interviewId",
  protect,
  createQuestion
);

router.get(
  "/:interviewId",
  protect,
  getQuestions
);

module.exports = router;