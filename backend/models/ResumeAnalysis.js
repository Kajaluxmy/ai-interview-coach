const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    summary: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    education: {
      type: [
        {
          degree: {
            type: String,
            default: "",
          },
          institution: {
            type: String,
            default: "",
          },
          fieldOfStudy: {
            type: String,
            default: "",
          },
          startDate: {
            type: String,
            default: "",
          },
          endDate: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    experience: {
      type: [
        {
          jobTitle: {
            type: String,
            default: "",
          },
          company: {
            type: String,
            default: "",
          },
          description: {
            type: String,
            default: "",
          },
          startDate: {
            type: String,
            default: "",
          },
          endDate: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    projects: {
      type: [
        {
          name: {
            type: String,
            default: "",
          },
          description: {
            type: String,
            default: "",
          },
          technologies: {
            type: [String],
            default: [],
          },
        },
      ],
      default: [],
    },

    certifications: {
      type: [String],
      default: [],
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
  "ResumeAnalysis",
  resumeAnalysisSchema
);