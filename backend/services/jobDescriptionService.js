const JobDescription = require("../models/JobDescription");
const Resume = require("../models/Resume");

const commonTechnologies = [
  "javascript", "typescript", "react", "vue", "angular", "node.js", "node",
  "express", "mongodb", "postgresql", "mysql", "redis", "docker", "kubernetes",
  "aws", "azure", "gcp", "python", "django", "fastapi", "java", "spring boot",
  "c#", ".net", "go", "rust", "graphql", "rest api", "ci/cd", "git", "github",
  "tailwind css", "html", "css", "next.js", "redux", "microservices"
];

const extractSkillsFromText = (text) => {
  const lower = (text || "").toLowerCase();
  return commonTechnologies.filter((tech) => lower.includes(tech.toLowerCase()));
};

const createJobDescription = async (userId, data) => {
  const skills =
    data.skills && data.skills.length > 0
      ? data.skills
      : extractSkillsFromText(data.description);

  const jobDescription = await JobDescription.create({
    userId,
    title: data.title,
    company: data.company || "",
    description: data.description,
    skills,
    requirements: data.requirements || [],
    experienceLevel: data.experienceLevel || "mid",
  });

  return jobDescription;
};

const getUserJobDescriptions = async (userId) => {
  return await JobDescription.find({ userId }).sort({ createdAt: -1 });
};

const getJobDescriptionById = async (userId, id) => {
  const job = await JobDescription.findOne({ _id: id, userId });
  if (!job) {
    throw new Error("Job description not found");
  }
  return job;
};

const updateJobDescription = async (userId, id, data) => {
  const job = await JobDescription.findOne({ _id: id, userId });
  if (!job) {
    throw new Error("Job description not found");
  }

  if (data.title !== undefined) job.title = data.title;
  if (data.company !== undefined) job.company = data.company;
  if (data.description !== undefined) {
    job.description = data.description;
    if (!data.skills) {
      job.skills = extractSkillsFromText(data.description);
    }
  }
  if (data.skills !== undefined) job.skills = data.skills;
  if (data.requirements !== undefined) job.requirements = data.requirements;
  if (data.experienceLevel !== undefined) job.experienceLevel = data.experienceLevel;

  await job.save();
  return job;
};

const deleteJobDescription = async (userId, id) => {
  const job = await JobDescription.findOneAndDelete({ _id: id, userId });
  if (!job) {
    throw new Error("Job description not found");
  }
  return job;
};

const matchWithResume = async (userId, jobDescriptionId, resumeId) => {
  const job = await JobDescription.findOne({ _id: jobDescriptionId, userId });
  if (!job) {
    throw new Error("Job description not found");
  }

  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    throw new Error("Resume not found");
  }

  const resumeText = (resume.extractedText || "").toLowerCase();

  const requiredSkills = job.skills || [];
  const matchingSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((skill) => {
    if (resumeText.includes(skill.toLowerCase())) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const matchPercentage =
    requiredSkills.length > 0
      ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
      : 70;

  const recommendations = [];
  if (missingSkills.length > 0) {
    recommendations.push(
      `Consider gaining or highlighting experience with: ${missingSkills.slice(0, 4).join(", ")}.`
    );
  }
  if (matchPercentage >= 75) {
    recommendations.push("Strong match for this position. Tailor interview answers around matching skills.");
  } else {
    recommendations.push("Review key missing requirements and address them in projects or certifications.");
  }

  return {
    jobTitle: job.title,
    company: job.company,
    resumeName: resume.fileName,
    matchPercentage,
    matchingSkills,
    missingSkills,
    recommendations,
  };
};

module.exports = {
  createJobDescription,
  getUserJobDescriptions,
  getJobDescriptionById,
  updateJobDescription,
  deleteJobDescription,
  matchWithResume,
};
