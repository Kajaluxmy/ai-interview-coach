const mongoose = require("mongoose");

const interviewReportSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true,
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    problemSolvingScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "InterviewReport",
  interviewReportSchema
);