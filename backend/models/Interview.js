const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    jobRole: {
      type: String,
      required: true,
      trim: true,
    },

    interviewType: {
      type: String,
      enum: ["technical", "behavioral", "hr", "mixed"],
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },

    startedAt: Date,

    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);