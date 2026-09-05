const Interview = require("../models/Interview");

const createInterview = async (userId, data) => {
  const interview = await Interview.create({
    userId,
    jobRole: data.jobRole,
    interviewType: data.interviewType,
    difficulty: data.difficulty,
    totalQuestions: data.totalQuestions,
  });

  return interview;
};

const getUserInterviews = async (userId) => {
  return await Interview.find({ userId }).sort({
    createdAt: -1,
  });
};

const getInterviewById = async (interviewId, userId) => {
  return await Interview.findOne({
    _id: interviewId,
    userId,
  });
};

const startInterview = async (interviewId, userId) => {
  const interview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
    },
    {
      status: "in_progress",
      startedAt: new Date(),
    },
    {
      new: true,
    }
  );

  return interview;
};

const deleteInterview = async (interviewId, userId) => {
  return await Interview.findOneAndDelete({
    _id: interviewId,
    userId,
  });
};

module.exports = {
  createInterview,
  getUserInterviews,
  getInterviewById,
  startInterview,
  deleteInterview,
};