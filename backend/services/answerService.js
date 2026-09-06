const Answer = require("../models/Answer");
const Interview = require("../models/Interview");
const Question = require("../models/Question");

const createAnswer = async (
  userId,
  interviewId,
  questionId,
  data
) => {
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  const question = await Question.findOne({
    _id: questionId,
    interviewId,
  });

  if (!question) {
    throw new Error("Question not found");
  }

  const existingAnswer = await Answer.findOne({
    interviewId,
    questionId,
  });

  if (existingAnswer) {
    throw new Error("Answer already submitted for this question");
  }

  const answer = await Answer.create({
    interviewId,
    questionId,
    answerText: data.answerText,
    duration: data.duration || 0,
  });

  return answer;
};

const getInterviewAnswers = async (
  userId,
  interviewId
) => {
  // Verify interview ownership
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  return await Answer.find({ interviewId })
    .populate("questionId", "questionText questionNumber")
    .sort({ createdAt: 1 });
};

const getAnswerById = async (
  userId,
  answerId
) => {
  const answer = await Answer.findById(answerId)
    .populate("interviewId")
    .populate("questionId");

  if (!answer) {
    throw new Error("Answer not found");
  }

  if (
    answer.interviewId.userId.toString() !==
    userId.toString()
  ) {
    throw new Error("Unauthorized access");
  }

  return answer;
};

module.exports = {
  createAnswer,
  getInterviewAnswers,
  getAnswerById,
};