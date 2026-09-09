const resumeAnalysisService = require("../services/resumeAnalysisService");

const analyzeResume = async (req, res) => {
  try {
    const analysis =
      await resumeAnalysisService.analyzeResume(
        req.user._id,
        req.params.resumeId
      );

    res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      analysis,
    });
  } catch (error) {
    let statusCode = 500;

    if (error.message === "Resume not found") {
      statusCode = 404;
    }

    if (
      error.message ===
      "Resume text has not been extracted yet"
    ) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getAnalysis = async (req, res) => {
  try {
    const analysis =
      await resumeAnalysisService.getResumeAnalysis(
        req.user._id,
        req.params.resumeId
      );

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    const statusCode =
      error.message ===
      "Resume analysis not found"
        ? 404
        : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  analyzeResume,
  getAnalysis,
};