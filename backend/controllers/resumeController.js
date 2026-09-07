const fs = require("fs");
const path = require("path");
const {
  extractTextFromPDF,
} = require("../utils/resumeParser");

const resumeService = require("../services/resumeService");


const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume",
      });
    }

    const extractedText =
      await extractTextFromPDF(req.file.path);

    const resume =
      await resumeService.createResume(
        req.user._id,
        {
          fileName: req.file.originalname,
          fileUrl: `/uploads/resumes/${req.file.filename}`,
          fileType: req.file.mimetype,
          extractedText,
        }
      );

    res.status(201).json({
      success: true,
      message: "Resume uploaded and processed successfully",
      resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getResumes = async (req, res) => {
  try {
    const resumes =
      await resumeService.getUserResumes(
        req.user._id
      );

    res.status(200).json({
      success: true,
      resumes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getResume = async (req, res) => {
  try {
    const resume =
      await resumeService.getResumeById(
        req.user._id,
        req.params.id
      );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteResume = async (req, res) => {
  try {
    const resume =
      await resumeService.getResumeById(
        req.user._id,
        req.params.id
      );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const fileName = path.basename(resume.fileUrl);

    const filePath = path.join(
      __dirname,
      "../uploads/resumes",
      fileName
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await resumeService.deleteResume(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
};