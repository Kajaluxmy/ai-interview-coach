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

const generateQuestions = async (req, res) => {
  try {
    const { count, resumeId } = req.body;

    const questions =
      await questionService.generateQuestionsForInterview(
        req.user._id,
        req.params.interviewId,
        count,
        resumeId
      );

    res.status(201).json({
      success: true,
      message: "Questions generated successfully",
      count: questions.length,
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

const getQuestion = async (req, res) => {
  try {
    const question = await questionService.getQuestionById(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === "Question not found") statusCode = 404;
    if (error.message === "Unauthorized access") statusCode = 403;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await questionService.updateQuestion(
      req.user._id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === "Question not found") statusCode = 404;
    if (error.message === "Unauthorized access") statusCode = 403;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    await questionService.deleteQuestion(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === "Question not found") statusCode = 404;
    if (error.message === "Unauthorized access") statusCode = 403;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getHint = async (req, res) => {
  try {
    const question = await questionService.getQuestionById(
      req.user._id,
      req.params.id
    );

    const aiService = require("../services/aiService");
    const hint = await aiService.generateQuestionHint(
      question.questionText,
      question.expectedTopics
    );

    res.status(200).json({
      success: true,
      hint,
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === "Question not found") statusCode = 404;
    if (error.message === "Unauthorized access") statusCode = 403;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createQuestion,
  generateQuestions,
  getQuestions,
  getQuestion,
  getHint,
  updateQuestion,
  deleteQuestion,
};
