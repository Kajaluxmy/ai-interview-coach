const interviewReportService = require("../services/interviewReportService");

const generateReport = async (req, res) => {
  try {
    const report = await interviewReportService.generateReport(
      req.user._id,
      req.params.interviewId
    );

    res.status(201).json({
      success: true,
      message: "Interview report generated successfully",
      report,
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === "Interview not found") statusCode = 404;
    if (error.message.includes("Cannot generate report")) statusCode = 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getReport = async (req, res) => {
  try {
    const report = await interviewReportService.getReportByInterviewId(
      req.user._id,
      req.params.interviewId
    );

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    let statusCode = 500;
    if (
      error.message === "Interview not found" ||
      error.message === "Interview report not found"
    ) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserReports = async (req, res) => {
  try {
    const reports = await interviewReportService.getUserReports(
      req.user._id
    );

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generateReport,
  getReport,
  getUserReports,
};
