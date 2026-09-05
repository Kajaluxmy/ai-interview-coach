const interviewService = require("../services/interviewService");

const createInterview = async (req, res) => {
  try {
    const {
      jobRole,
      interviewType,
      difficulty,
      totalQuestions,
    } = req.body;

    if (
      !jobRole ||
      !interviewType ||
      !difficulty ||
      !totalQuestions
    ) {
      return res.status(400).json({
        success: false,
        message: "All interview fields are required",
      });
    }

    const interview =
      await interviewService.createInterview(
        req.user._id,
        {
          jobRole,
          interviewType,
          difficulty,
          totalQuestions,
        }
      );

    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getInterviews = async (req, res) => {
  try {
    const interviews =
      await interviewService.getUserInterviews(
        req.user._id
      );

    res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getInterview = async (req, res) => {
  try {
    const interview =
      await interviewService.getInterviewById(
        req.params.id,
        req.user._id
      );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const startInterview = async (req, res) => {
  try {
    const interview =
      await interviewService.startInterview(
        req.params.id,
        req.user._id
      );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview started",
      interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteInterview = async (req, res) => {
  try {
    const interview =
      await interviewService.deleteInterview(
        req.params.id,
        req.user._id
      );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getInterview,
  startInterview,
  deleteInterview,
};