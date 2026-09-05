const Question = require("../models/Question");
const Interview = require("../models/Interview");

const createQuestion = async (userId, interviewId, data) => {
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  const question = await Question.create({
    interviewId,
    questionText: data.questionText,
    questionType: data.questionType,
    difficulty: data.difficulty,
    questionNumber: data.questionNumber,
    expectedTopics: data.expectedTopics || [],
  });

  return question;
};

const getQuestionsByInterview = async (
  userId,
  interviewId
) => {
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  return await Question.find({ interviewId }).sort({
    questionNumber: 1,
  });
};

module.exports = {
  createQuestion,
  getQuestionsByInterview,
};