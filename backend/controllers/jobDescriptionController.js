const jobDescriptionService = require("../services/jobDescriptionService");

const createJobDescription = async (req, res) => {
  try {
    const { title, company, description, skills, requirements, experienceLevel } =
      req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const job = await jobDescriptionService.createJobDescription(
      req.user._id,
      {
        title,
        company,
        description,
        skills,
        requirements,
        experienceLevel,
      }
    );

    res.status(201).json({
      success: true,
      message: "Job description created successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getJobDescriptions = async (req, res) => {
  try {
    const jobs = await jobDescriptionService.getUserJobDescriptions(
      req.user._id
    );

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getJobDescription = async (req, res) => {
  try {
    const job = await jobDescriptionService.getJobDescriptionById(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    const statusCode =
      error.message === "Job description not found" ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const updateJobDescription = async (req, res) => {
  try {
    const job = await jobDescriptionService.updateJobDescription(
      req.user._id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Job description updated successfully",
      job,
    });
  } catch (error) {
    const statusCode =
      error.message === "Job description not found" ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteJobDescription = async (req, res) => {
  try {
    await jobDescriptionService.deleteJobDescription(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Job description deleted successfully",
    });
  } catch (error) {
    const statusCode =
      error.message === "Job description not found" ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const matchResume = async (req, res) => {
  try {
    const match = await jobDescriptionService.matchWithResume(
      req.user._id,
      req.params.id,
      req.params.resumeId
    );

    res.status(200).json({
      success: true,
      match,
    });
  } catch (error) {
    let statusCode = 500;
    if (
      error.message === "Job description not found" ||
      error.message === "Resume not found"
    ) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createJobDescription,
  getJobDescriptions,
  getJobDescription,
  updateJobDescription,
  deleteJobDescription,
  matchResume,
};
