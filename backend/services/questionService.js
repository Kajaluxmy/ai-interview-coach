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

const getQuestionsByInterview = async (userId, interviewId) => {
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

const getQuestionById = async (userId, questionId) => {
  const question = await Question.findById(questionId).populate("interviewId");

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.interviewId.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized access");
  }

  return question;
};

const updateQuestion = async (userId, questionId, data) => {
  const question = await Question.findById(questionId).populate("interviewId");

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.interviewId.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized access");
  }

  if (data.questionText !== undefined) question.questionText = data.questionText;
  if (data.questionType !== undefined) question.questionType = data.questionType;
  if (data.difficulty !== undefined) question.difficulty = data.difficulty;
  if (data.questionNumber !== undefined) question.questionNumber = data.questionNumber;
  if (data.expectedTopics !== undefined) question.expectedTopics = data.expectedTopics;

  await question.save();
  return question;
};

const deleteQuestion = async (userId, questionId) => {
  const question = await Question.findById(questionId).populate("interviewId");

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.interviewId.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized access");
  }

  await Question.findByIdAndDelete(questionId);
  return question;
};

module.exports = {
  createQuestion,
  getQuestionsByInterview,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
