const Evaluation = require("../models/Evaluation");
const Answer = require("../models/Answer");
const Interview = require("../models/Interview");
const Question = require("../models/Question");

// Intelligent rule-based evaluator that scores answers and provides structured feedback
const generateEvaluationData = (answerText, question) => {
  const text = (answerText || "").trim();
  const lowerText = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const expectedTopics = question?.expectedTopics || [];
  const matchedTopics = expectedTopics.filter((topic) =>
    lowerText.includes(topic.toLowerCase().trim())
  );

  // Relevance score (0-10) based on expected topics and length
  let relevance = 6;
  if (expectedTopics.length > 0) {
    const ratio = matchedTopics.length / expectedTopics.length;
    relevance = Math.min(10, Math.round(4 + ratio * 6));
  } else if (wordCount >= 30) {
    relevance = 8;
  }

  // Clarity score (0-10)
  let clarity = 5;
  if (wordCount >= 50) clarity = 8;
  else if (wordCount >= 25) clarity = 7;
  else if (wordCount >= 10) clarity = 6;

  // Technical depth score (0-10)
  let technicalDepth = 5;
  if (matchedTopics.length >= 2 || wordCount >= 70) technicalDepth = 8;
  else if (matchedTopics.length === 1 || wordCount >= 35) technicalDepth = 7;

  // Correctness score (0-10)
  const correctness = Math.min(
    10,
    Math.round((relevance * 0.5 + technicalDepth * 0.5))
  );

  // Overall score out of 10
  const score = Math.round(
    relevance * 0.3 + correctness * 0.3 + clarity * 0.2 + technicalDepth * 0.2
  );

  const strengths = [];
  const weaknesses = [];
  const improvements = [];

  if (wordCount >= 40) {
    strengths.push("Provided a detailed response with good explanation.");
  }
  if (matchedTopics.length > 0) {
    strengths.push(
      `Addressed key relevant concepts: ${matchedTopics.join(", ")}.`
    );
  } else if (wordCount >= 20) {
    strengths.push("Direct and easy to follow structure.");
  }

  if (wordCount < 30) {
    weaknesses.push("Response is relatively brief; could benefit from more elaboration.");
    improvements.push("Elaborate further by using real-world examples or the STAR method.");
  }

  if (expectedTopics.length > 0 && matchedTopics.length < expectedTopics.length) {
    const missed = expectedTopics.filter(
      (t) => !matchedTopics.includes(t)
    );
    if (missed.length > 0) {
      weaknesses.push(`Did not touch on expected concepts: ${missed.slice(0, 3).join(", ")}.`);
      improvements.push(`Include references to ${missed.slice(0, 2).join(" and ")}.`);
    }
  }

  if (strengths.length === 0) {
    strengths.push("Attempted the question with clear intent.");
  }
  if (improvements.length === 0) {
    improvements.push("Keep practicing articulating technical decisions clearly.");
  }

  const feedback =
    score >= 8
      ? "Strong and comprehensive response demonstrating solid understanding."
      : score >= 6
      ? "Good answer covering the main points, but can be improved with greater depth and specific examples."
      : "Basic answer. Review the core concepts and practice structuring your thoughts more thoroughly.";

  return {
    score,
    relevance,
    correctness,
    clarity,
    technicalDepth,
    feedback,
    strengths,
    weaknesses,
    improvements,
  };
};

const createOrUpdateEvaluation = async (userId, answerId, data) => {
  const answer = await Answer.findById(answerId).populate("interviewId");

  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.interviewId.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized access");
  }

  const evaluation = await Evaluation.findOneAndUpdate(
    { answerId },
    {
      answerId,
      score: data.score,
      relevance: data.relevance,
      correctness: data.correctness,
      clarity: data.clarity,
      technicalDepth: data.technicalDepth,
      feedback: data.feedback,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      improvements: data.improvements || [],
    },
    { new: true, upsert: true }
  );

  return evaluation;
};

const autoEvaluateAnswer = async (userId, answerId) => {
  const answer = await Answer.findById(answerId)
    .populate("interviewId")
    .populate("questionId");

  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.interviewId.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized access");
  }

  const generated = generateEvaluationData(
    answer.answerText,
    answer.questionId
  );

  const evaluation = await Evaluation.findOneAndUpdate(
    { answerId },
    {
      answerId,
      ...generated,
    },
    { new: true, upsert: true }
  );

  return evaluation;
};

const getEvaluationByAnswerId = async (userId, answerId) => {
  const answer = await Answer.findById(answerId).populate("interviewId");

  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.interviewId.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized access");
  }

  const evaluation = await Evaluation.findOne({ answerId }).populate({
    path: "answerId",
    populate: { path: "questionId", select: "questionText questionNumber expectedTopics" },
  });

  if (!evaluation) {
    throw new Error("Evaluation not found");
  }

  return evaluation;
};

const getEvaluationsByInterviewId = async (userId, interviewId) => {
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  const answers = await Answer.find({ interviewId });
  const answerIds = answers.map((a) => a._id);

  const evaluations = await Evaluation.find({
    answerId: { $in: answerIds },
  }).populate({
    path: "answerId",
    populate: { path: "questionId", select: "questionText questionNumber" },
  });

  return evaluations;
};

module.exports = {
  generateEvaluationData,
  createOrUpdateEvaluation,
  autoEvaluateAnswer,
  getEvaluationByAnswerId,
  getEvaluationsByInterviewId,
};
