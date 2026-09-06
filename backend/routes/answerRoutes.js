const express = require("express");

const {
  createAnswer,
  getInterviewAnswers,
  getAnswer,
} = require("../controllers/answerController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/:interviewId",
  protect,
  createAnswer
);

router.get(
  "/interview/:interviewId",
  protect,
  getInterviewAnswers
);

router.get(
  "/:id",
  protect,
  getAnswer
);

module.exports = router;