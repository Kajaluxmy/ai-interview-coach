const Resume = require("../models/Resume");

const createResume = async (userId, data) => {
  const resume = await Resume.create({
    userId,
    fileName: data.fileName,
    fileUrl: data.fileUrl,
    fileType: data.fileType,
    extractedText: data.extractedText || "",
  });

  return resume;
};

const getUserResumes = async (userId) => {
  return await Resume.find({
    userId,
  }).sort({
    createdAt: -1,
  });
};

const getResumeById = async (userId, resumeId) => {
  return await Resume.findOne({
    _id: resumeId,
    userId,
  });
};

const deleteResume = async (userId, resumeId) => {
  return await Resume.findOneAndDelete({
    _id: resumeId,
    userId,
  });
};

module.exports = {
  createResume,
  getUserResumes,
  getResumeById,
  deleteResume,
};