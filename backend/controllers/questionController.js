const questionService = require("../services/questionService");

const createQuestion = async (req, res) => {
  try {
    const {
      questionText,
      questionType,
      difficulty,
      questionNumber,
      expectedTopics,
    } = req.body;

    if (
      !questionText ||
      !questionType ||
      !difficulty ||
      !questionNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "Required question fields are missing",
      });
    }

    const question =
      await questionService.createQuestion(
        req.user._id,
        req.params.interviewId,
        {
          questionText,
          questionType,
          difficulty,
          questionNumber,
          expectedTopics,
        }
      );

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      question,
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

const getQuestions = async (req, res) => {
  try {
    const questions =
      await questionService.getQuestionsByInterview(
        req.user._id,
        req.params.interviewId
      );

    res.status(200).json({
      success: true,
      questions,
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

module.exports = {
  createQuestion,
  getQuestions,
};