const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    relevance: {
      type: Number,
      min: 0,
      max: 10,
    },

    correctness: {
      type: Number,
      min: 0,
      max: 10,
    },

    clarity: {
      type: Number,
      min: 0,
      max: 10,
    },

    technicalDepth: {
      type: Number,
      min: 0,
      max: 10,
    },

    feedback: {
      type: String,
      trim: true,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Evaluation", evaluationSchema);