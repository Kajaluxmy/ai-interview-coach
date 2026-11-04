const evaluationService = require("../services/evaluationService");

const createEvaluation = async (req, res) => {
  try {
    const {
      score,
      relevance,
      correctness,
      clarity,
      technicalDepth,
      feedback,
      strengths,
      weaknesses,
      improvements,
    } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        message: "Score is required",
      });
    }

    const evaluation = await evaluationService.createOrUpdateEvaluation(
      req.user._id,
      req.params.answerId,
      {
        score,
        relevance,
        correctness,
        clarity,
        technicalDepth,
        feedback,
        strengths,
        weaknesses,
        improvements,
      }
    );

    res.status(201).json({
      success: true,
      message: "Evaluation saved successfully",
      evaluation,
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === "Answer not found") statusCode = 404;
    if (error.message === "Unauthorized access") statusCode = 403;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const autoEvaluate = async (req, res) => {
  try {
    const evaluation = await evaluationService.autoEvaluateAnswer(
      req.user._id,
      req.params.answerId
    );

    res.status(200).json({
      success: true,
      message: "Answer evaluated successfully",
      evaluation,
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === "Answer not found") statusCode = 404;
    if (error.message === "Unauthorized access") statusCode = 403;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getEvaluation = async (req, res) => {
  try {
    const evaluation = await evaluationService.getEvaluationByAnswerId(
      req.user._id,
      req.params.answerId
    );

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === "Answer not found" || error.message === "Evaluation not found") {
      statusCode = 404;
    }
    if (error.message === "Unauthorized access") statusCode = 403;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getInterviewEvaluations = async (req, res) => {
  try {
    const evaluations =
      await evaluationService.getEvaluationsByInterviewId(
        req.user._id,
        req.params.interviewId
      );

    res.status(200).json({
      success: true,
      evaluations,
    });
  } catch (error) {
    const statusCode =
      error.message === "Interview not found" ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createEvaluation,
  autoEvaluate,
  getEvaluation,
  getInterviewEvaluations,
};
