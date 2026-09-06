const answerService = require("../services/answerService");

const createAnswer = async (req, res) => {
  try {
    const { answerText, duration } = req.body;

    if (!answerText || !answerText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Answer text is required",
      });
    }

    const answer = await answerService.createAnswer(
      req.user._id,
      req.params.interviewId,
      req.body.questionId,
      {
        answerText,
        duration,
      }
    );

    res.status(201).json({
      success: true,
      message: "Answer submitted successfully",
      answer,
    });
  } catch (error) {
    let statusCode = 500;

    if (
      error.message === "Interview not found" ||
      error.message === "Question not found" ||
      error.message === "Answer already submitted for this question"
    ) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getInterviewAnswers = async (req, res) => {
  try {
    const answers =
      await answerService.getInterviewAnswers(
        req.user._id,
        req.params.interviewId
      );

    res.status(200).json({
      success: true,
      answers,
    });
  } catch (error) {
    const statusCode =
      error.message === "Interview not found"
        ? 404
        : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getAnswer = async (req, res) => {
  try {
    const answer = await answerService.getAnswerById(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    let statusCode = 500;

    if (error.message === "Answer not found") {
      statusCode = 404;
    }

    if (error.message === "Unauthorized access") {
      statusCode = 403;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAnswer,
  getInterviewAnswers,
  getAnswer,
};