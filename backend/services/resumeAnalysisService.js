const Resume = require("../models/Resume");
const ResumeAnalysis = require("../models/ResumeAnalysis");

const analyzeResume = async (userId, resumeId) => {
  const resume = await Resume.findOne({
    _id: resumeId,
    userId,
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  if (!resume.extractedText) {
    throw new Error(
      "Resume text has not been extracted yet"
    );
  }

  const text = resume.extractedText;

  const lowerText = text.toLowerCase();

  const technologies = [
    "javascript",
    "typescript",
    "react",
    "react.js",
    "node.js",
    "node",
    "express",
    "mongodb",
    "mysql",
    "postgresql",
    "java",
    "spring boot",
    "python",
    "c",
    "c++",
    "php",
    "html",
    "css",
    "tailwind css",
    "git",
    "github",
    "docker",
    "aws",
  ];

  const skills = technologies.filter((technology) =>
    lowerText.includes(technology.toLowerCase())
  );

  const summary =
    text.substring(0, 500).trim();

  const strengths = [];

  if (skills.length >= 5) {
    strengths.push(
      "Good range of technical skills"
    );
  }

  if (
    lowerText.includes("project") ||
    lowerText.includes("projects")
  ) {
    strengths.push(
      "Has project experience"
    );
  }

  if (
    lowerText.includes("github") ||
    lowerText.includes("git")
  ) {
    strengths.push(
      "Uses version control"
    );
  }

  const weaknesses = [];

  if (skills.length < 3) {
    weaknesses.push(
      "Technical skills section could be expanded"
    );
  }

  if (
    !lowerText.includes("experience")
  ) {
    weaknesses.push(
      "Limited or missing professional experience"
    );
  }

  if (
    !lowerText.includes("project")
  ) {
    weaknesses.push(
      "Project experience is not clearly mentioned"
    );
  }

  const recommendations = [];

  if (skills.length < 5) {
    recommendations.push(
      "Consider adding more relevant technical skills"
    );
  }

  if (!lowerText.includes("github")) {
    recommendations.push(
      "Consider including your GitHub profile"
    );
  }

  recommendations.push(
    "Tailor the resume to the target job role"
  );

  const analysisData = {
    resumeId: resume._id,
    userId,
    summary,
    skills,
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    strengths,
    weaknesses,
    recommendations,
  };

  const analysis =
    await ResumeAnalysis.findOneAndUpdate(
      {
        resumeId: resume._id,
        userId,
      },
      analysisData,
      {
        new: true,
        upsert: true,
      }
    );

  return analysis;
};

const getResumeAnalysis = async (
  userId,
  resumeId
) => {
  const analysis =
    await ResumeAnalysis.findOne({
      resumeId,
      userId,
    });

  if (!analysis) {
    throw new Error(
      "Resume analysis not found"
    );
  }

  return analysis;
};

module.exports = {
  analyzeResume,
  getResumeAnalysis,
};