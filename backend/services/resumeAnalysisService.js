const Resume = require("../models/Resume");
const ResumeAnalysis = require("../models/ResumeAnalysis");

const evaluateATSCompatibility = (text, skills = []) => {
  const lower = (text || "").toLowerCase();

  // 1. Contact & Social Profiles
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text || "");
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text || "");
  const hasGithubOrLinkedin =
    lower.includes("github.com") ||
    lower.includes("linkedin.com") ||
    lower.includes("github") ||
    lower.includes("portfolio");
  let contactScore = 0;
  if (hasEmail) contactScore += 10;
  if (hasPhone) contactScore += 5;
  if (hasGithubOrLinkedin) contactScore += 5;

  // 2. Standard ATS Section Headings
  const sections = [
    {
      name: "Experience",
      present:
        lower.includes("experience") ||
        lower.includes("employment") ||
        lower.includes("work history"),
    },
    {
      name: "Education",
      present:
        lower.includes("education") ||
        lower.includes("university") ||
        lower.includes("degree") ||
        lower.includes("college"),
    },
    {
      name: "Skills",
      present:
        lower.includes("skill") ||
        lower.includes("technolog") ||
        lower.includes("competenc"),
    },
    {
      name: "Projects",
      present: lower.includes("project") || lower.includes("portfolio"),
    },
  ];
  const detectedSectionsCount = sections.filter((s) => s.present).length;
  const sectionScore = Math.min(25, detectedSectionsCount * 6.25);

  // 3. Action Verbs Check
  const actionVerbsList = [
    "built",
    "developed",
    "architected",
    "optimized",
    "engineered",
    "implemented",
    "designed",
    "deployed",
    "spearheaded",
    "collaborated",
    "led",
    "reduced",
    "increased",
    "integrated",
    "automated",
    "created",
  ];
  const foundVerbs = actionVerbsList.filter((verb) => lower.includes(verb));
  const verbsScore = Math.min(20, foundVerbs.length * 4);

  // 4. Quantifiable Impact & Metrics
  const metricMatches =
    (text &&
      text.match(
        /(\d+%\b|\$\d+|\b\d+\s?(ms|seconds|users|clients|requests|x\b|times))/gi
      )) ||
    [];
  const metricsScore = Math.min(
    15,
    metricMatches.length > 0
      ? 10 + Math.min(5, metricMatches.length)
      : /\d+/.test(text || "")
      ? 5
      : 0
  );

  // 5. Technical Keyword Variety
  const skillsScore = Math.min(20, (skills.length || 0) * 3);

  const totalAtsScore = Math.round(
    contactScore + sectionScore + verbsScore + metricsScore + skillsScore
  );
  const finalScore = Math.min(99, Math.max(35, totalAtsScore));

  let grade = "B (Good ATS Pass Rate)";
  if (finalScore >= 85) grade = "A+ (Excellent ATS Readiness)";
  else if (finalScore < 60) grade = "C (Needs Optimization)";

  const checks = [
    {
      category: "Contact & Links",
      passed: hasEmail && (hasPhone || hasGithubOrLinkedin),
      title: "Recruiter Contact Details",
      detail: hasEmail
        ? "Clear email address and candidate links detected."
        : "Missing contact email address or reach-out details.",
    },
    {
      category: "Section Structure",
      passed: detectedSectionsCount >= 3,
      title: "ATS Standard Sections",
      detail: `${detectedSectionsCount}/4 key sections identified (${
        sections
          .filter((s) => s.present)
          .map((s) => s.name)
          .join(", ") || "None"
      }).`,
    },
    {
      category: "Action Verbs",
      passed: foundVerbs.length >= 3,
      title: "Impact Action Verbs",
      detail:
        foundVerbs.length >= 3
          ? `Found ${foundVerbs.length} high-impact action verbs (${foundVerbs
              .slice(0, 4)
              .join(", ")}...).`
          : "Add strong action verbs (e.g. 'architected', 'optimized', 'deployed') to describe achievements.",
    },
    {
      category: "Measurable Impact",
      passed: metricMatches.length >= 1 || /\d+%/.test(text || ""),
      title: "Quantifiable Metrics & Scale",
      detail:
        metricMatches.length >= 1
          ? "Demonstrated measurable figures, metrics, or performance gains."
          : "Include statistics or percentages (e.g. 'improved performance by 25%') to score higher.",
    },
    {
      category: "Keyword Relevance",
      passed: (skills.length || 0) >= 4,
      title: "Developer Keyword Match",
      detail: `Detected ${skills.length} recognized technical keywords.`,
    },
  ];

  return {
    atsScore: finalScore,
    grade,
    breakdown: {
      contact: contactScore,
      sections: Math.round(sectionScore),
      actionVerbs: Math.round(verbsScore),
      metrics: Math.round(metricsScore),
      skills: Math.round(skillsScore),
    },
    foundVerbsCount: foundVerbs.length,
    metricsDetectedCount: metricMatches.length,
    checks,
  };
};

const analyzeResume = async (userId, resumeId) => {
  const resume = await Resume.findOne({
    _id: resumeId,
    userId,
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  if (!resume.extractedText) {
    throw new Error(
      "Resume text has not been extracted yet"
    );
  }

  const text = resume.extractedText;

  const lowerText = text.toLowerCase();

  const technologies = [
    "javascript",
    "typescript",
    "react",
    "react.js",
    "node.js",
    "node",
    "express",
    "mongodb",
    "mysql",
    "postgresql",
    "java",
    "spring boot",
    "python",
    "c",
    "c++",
    "php",
    "html",
    "css",
    "tailwind css",
    "git",
    "github",
    "docker",
    "aws",
  ];

  const skills = technologies.filter((technology) =>
    lowerText.includes(technology.toLowerCase())
  );

  const summary =
    text.substring(0, 500).trim();

  const strengths = [];

  if (skills.length >= 5) {
    strengths.push(
      "Good range of technical skills"
    );
  }

  if (
    lowerText.includes("project") ||
    lowerText.includes("projects")
  ) {
    strengths.push(
      "Has project experience"
    );
  }

  if (
    lowerText.includes("github") ||
    lowerText.includes("git")
  ) {
    strengths.push(
      "Uses version control"
    );
  }

  const weaknesses = [];

  if (skills.length < 3) {
    weaknesses.push(
      "Technical skills section could be expanded"
    );
  }

  if (
    !lowerText.includes("experience")
  ) {
    weaknesses.push(
      "Limited or missing professional experience"
    );
  }

  if (
    !lowerText.includes("project")
  ) {
    weaknesses.push(
      "Project experience is not clearly mentioned"
    );
  }

  const recommendations = [];

  if (skills.length < 5) {
    recommendations.push(
      "Consider adding more relevant technical skills"
    );
  }

  if (!lowerText.includes("github")) {
    recommendations.push(
      "Consider including your GitHub profile"
    );
  }

  recommendations.push(
    "Tailor the resume to the target job role"
  );

  const atsCompatibility = evaluateATSCompatibility(text, skills);

  const analysisData = {
    resumeId: resume._id,
    userId,
    summary,
    skills,
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    strengths,
    weaknesses,
    recommendations,
    atsScore: atsCompatibility.atsScore,
    atsCompatibility,
  };

  const analysis =
    await ResumeAnalysis.findOneAndUpdate(
      {
        resumeId: resume._id,
        userId,
      },
      analysisData,
      {
        new: true,
        upsert: true,
      }
    );

  return analysis;
};

const getResumeAnalysis = async (
  userId,
  resumeId
) => {
  const analysis =
    await ResumeAnalysis.findOne({
      resumeId,
      userId,
    });

  if (!analysis) {
    throw new Error(
      "Resume analysis not found"
    );
  }

  // Backwards compatibility: calculate ATS if not already cached
  if (!analysis.atsCompatibility) {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    const text = resume ? resume.extractedText : analysis.summary;
    const compat = evaluateATSCompatibility(text, analysis.skills || []);
    analysis.atsScore = compat.atsScore;
    analysis.atsCompatibility = compat;
    await analysis.save();
  }

  return analysis;
};

module.exports = {
  analyzeResume,
  getResumeAnalysis,
};