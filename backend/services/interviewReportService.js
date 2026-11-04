const InterviewReport = require("../models/InterviewReport");
const Interview = require("../models/Interview");
const Answer = require("../models/Answer");
const Evaluation = require("../models/Evaluation");

const generateReport = async (userId, interviewId) => {
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
  });

  if (evaluations.length === 0) {
    throw new Error(
      "Cannot generate report: No evaluations found for this interview. Please evaluate answers first."
    );
  }

  // Calculate scores (normalized to 0 - 100)
  const count = evaluations.length;

  const avgOverall =
    evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / count;
  const avgTech =
    evaluations.reduce((sum, e) => sum + (e.technicalDepth || e.score || 0), 0) / count;
  const avgClarity =
    evaluations.reduce((sum, e) => sum + (e.clarity || e.score || 0), 0) / count;
  const avgRelevance =
    evaluations.reduce((sum, e) => sum + (e.relevance || e.score || 0), 0) / count;
  const avgCorrectness =
    evaluations.reduce((sum, e) => sum + (e.correctness || e.score || 0), 0) / count;

  const overallScore = Math.min(100, Math.round(avgOverall * 10));
  const technicalScore = Math.min(
    100,
    Math.round(((avgTech + avgCorrectness) / 2) * 10)
  );
  const communicationScore = Math.min(
    100,
    Math.round(((avgClarity + avgRelevance) / 2) * 10)
  );
  const problemSolvingScore = Math.min(
    100,
    Math.round(((avgCorrectness + avgRelevance) / 2) * 10)
  );

  // Aggregate distinct strengths, weaknesses, and recommendations
  const strengthsSet = new Set();
  const weaknessesSet = new Set();
  const recommendationsSet = new Set();

  evaluations.forEach((evaluation) => {
    (evaluation.strengths || []).forEach((s) => strengthsSet.add(s));
    (evaluation.weaknesses || []).forEach((w) => weaknessesSet.add(w));
    (evaluation.improvements || []).forEach((r) => recommendationsSet.add(r));
  });

  if (overallScore >= 80) {
    recommendationsSet.add("Ready for live interviews in this role.");
  } else if (overallScore >= 60) {
    recommendationsSet.add(
      "Focus on deepening answers with concrete project examples and technical metrics."
    );
  } else {
    recommendationsSet.add(
      "Review fundamentals for this role and practice articulating concise structured answers."
    );
  }

  const report = await InterviewReport.findOneAndUpdate(
    { interviewId },
    {
      interviewId,
      overallScore,
      technicalScore,
      communicationScore,
      problemSolvingScore,
      strengths: Array.from(strengthsSet),
      weaknesses: Array.from(weaknessesSet),
      recommendations: Array.from(recommendationsSet),
    },
    { new: true, upsert: true }
  );

  // Mark interview as completed
  if (interview.status !== "completed") {
    interview.status = "completed";
    interview.completedAt = new Date();
    await interview.save();
  }

  return report;
};

const getReportByInterviewId = async (userId, interviewId) => {
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  const report = await InterviewReport.findOne({ interviewId }).populate(
    "interviewId",
    "jobRole interviewType difficulty totalQuestions status startedAt completedAt"
  );

  if (!report) {
    throw new Error("Interview report not found");
  }

  return report;
};

const getUserReports = async (userId) => {
  const interviews = await Interview.find({ userId }).select("_id");
  const interviewIds = interviews.map((i) => i._id);

  return await InterviewReport.find({
    interviewId: { $in: interviewIds },
  })
    .populate("interviewId", "jobRole interviewType difficulty status completedAt")
    .sort({ createdAt: -1 });
};

module.exports = {
  generateReport,
  getReportByInterviewId,
  getUserReports,
};
