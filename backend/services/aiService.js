/**
 * AI Service for AI Interview Coach
 * Connects to Google Gemini API when GEMINI_API_KEY is configured in .env,
 * and includes an intelligent fallback generator so the system works out-of-the-box.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const roleQuestionsBank = {
  default: [
    {
      questionText: "Tell me about yourself and your background in software development.",
      questionType: "behavioral",
      expectedTopics: ["background", "projects", "passion", "education"],
    },
    {
      questionText: "Describe a challenging bug or technical problem you solved recently.",
      questionType: "technical",
      expectedTopics: ["problem identification", "debugging tools", "root cause", "solution", "outcome"],
    },
    {
      questionText: "How do you handle disagreements with teammates regarding technical decisions?",
      questionType: "behavioral",
      expectedTopics: ["communication", "active listening", "compromise", "data-driven decisions"],
    },
    {
      questionText: "Explain the difference between synchronous and asynchronous execution.",
      questionType: "technical",
      expectedTopics: ["event loop", "non-blocking I/O", "promises", "async/await", "threads"],
    },
    {
      questionText: "Where do you see yourself professionally in the next 2 to 3 years?",
      questionType: "hr",
      expectedTopics: ["growth", "learning goals", "mentorship", "career path"],
    },
  ],
  frontend: [
    {
      questionText: "Explain the virtual DOM in React and how reconciliation works.",
      questionType: "technical",
      expectedTopics: ["virtual DOM", "diffing algorithm", "reconciliation", "render performance", "keys"],
    },
    {
      questionText: "How do you optimize the performance of a modern web application?",
      questionType: "technical",
      expectedTopics: ["code splitting", "lazy loading", "caching", "asset compression", "bundle size"],
    },
    {
      questionText: "What is the difference between state management using React Context vs Redux?",
      questionType: "technical",
      expectedTopics: ["context API", "re-renders", "redux toolkit", "boilerplate", "middleware"],
    },
    {
      questionText: "Describe a project where you built responsive and accessible UI components.",
      questionType: "behavioral",
      expectedTopics: ["accessibility", "ARIA", "responsive design", "mobile-first", "testing"],
    },
    {
      questionText: "How do you ensure cross-browser compatibility and test your frontend code?",
      questionType: "technical",
      expectedTopics: ["browsers", "autoprefixer", "unit testing", "cypress/playwright", "polyfills"],
    },
  ],
  backend: [
    {
      questionText: "How would you design a scalable RESTful API with authentication and rate limiting?",
      questionType: "technical",
      expectedTopics: ["JWT/OAuth", "rate limiting", "middleware", "status codes", "versioning"],
    },
    {
      questionText: "Explain database indexing and when an index might degrade performance.",
      questionType: "technical",
      expectedTopics: ["B-tree", "lookup speed", "write overhead", "compound index", "query planning"],
    },
    {
      questionText: "How do you handle transactions and data consistency across multiple database operations?",
      questionType: "technical",
      expectedTopics: ["ACID", "transactions", "session", "rollback", "idempotency"],
    },
    {
      questionText: "Describe how you monitor and debug production API bottlenecks or high latency.",
      questionType: "behavioral",
      expectedTopics: ["logging", "APM", "profiling", "database slow queries", "caching"],
    },
    {
      questionText: "What is the difference between SQL and NoSQL databases, and how do you choose between them?",
      questionType: "technical",
      expectedTopics: ["schema", "scalability", "ACID vs BASE", "relations", "use cases"],
    },
  ],
};

const getRoleCategory = (role = "") => {
  const r = role.toLowerCase();
  if (r.includes("front") || r.includes("react") || r.includes("ui") || r.includes("vue")) {
    return "frontend";
  }
  if (r.includes("back") || r.includes("node") || r.includes("api") || r.includes("server") || r.includes("database")) {
    return "backend";
  }
  return "default";
};

/**
 * Generate questions via Gemini API
 */
const generateQuestionsWithGemini = async (interview, count, resumeText = "") => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are an expert technical interviewer and interview coach.
Generate ${count} tailored interview questions for:
- Job Role: ${interview.jobRole}
- Interview Type: ${interview.interviewType} (e.g. technical, behavioral, hr, mixed)
- Difficulty Level: ${interview.difficulty}
${resumeText ? `- Candidate Resume Summary: ${resumeText.substring(0, 1000)}` : ""}

Return ONLY a valid JSON array of objects with no markdown formatting or markdown code blocks:
[
  {
    "questionText": "string",
    "questionType": "technical | behavioral | hr | mixed",
    "difficulty": "${interview.difficulty}",
    "expectedTopics": ["topic1", "topic2", "topic3"]
  }
]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    console.warn("Gemini API question generation returned status:", response.status);
    return null;
  }

  const data = await response.json();
  const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) return null;

  const questions = JSON.parse(textResponse);
  return Array.isArray(questions) ? questions : null;
};

/**
 * Main Question Generation entry point
 */
const generateQuestions = async (interview, requestedCount = 5, resumeText = "") => {
  const totalCount = Math.min(Math.max(requestedCount || interview.totalQuestions || 5, 1), 10);

  // Attempt Gemini API if key is present
  try {
    const aiQuestions = await generateQuestionsWithGemini(interview, totalCount, resumeText);
    if (aiQuestions && aiQuestions.length > 0) {
      return aiQuestions.slice(0, totalCount).map((q, idx) => ({
        questionText: q.questionText,
        questionType: q.questionType || interview.interviewType,
        difficulty: interview.difficulty,
        questionNumber: idx + 1,
        expectedTopics: q.expectedTopics || [],
      }));
    }
  } catch (err) {
    console.warn("Gemini API call failed, falling back to built-in generator:", err.message);
  }

  // Built-in intelligent generator
  const category = getRoleCategory(interview.jobRole);
  const bank = roleQuestionsBank[category] || roleQuestionsBank.default;
  const generalBank = roleQuestionsBank.default;

  const combinedBank = [...bank, ...generalBank];
  const uniqueQuestions = [];
  const seenTexts = new Set();

  for (const q of combinedBank) {
    if (!seenTexts.has(q.questionText)) {
      seenTexts.add(q.questionText);
      uniqueQuestions.push(q);
    }
  }

  return uniqueQuestions.slice(0, totalCount).map((q, index) => ({
    questionText: q.questionText,
    questionType: q.questionType || interview.interviewType,
    difficulty: interview.difficulty,
    questionNumber: index + 1,
    expectedTopics: q.expectedTopics,
  }));
};

/**
 * Evaluate Answer with Gemini API
 */
const evaluateAnswerWithGemini = async (questionText, answerText, expectedTopics = []) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are an expert interview coach and hiring manager.
Evaluate this candidate's interview answer:
- Question: "${questionText}"
- Expected Topics: ${JSON.stringify(expectedTopics)}
- Candidate Answer: "${answerText}"

Provide realistic, constructive scoring and actionable feedback.
Return ONLY a valid JSON object matching this schema:
{
  "score": number between 0 and 10,
  "relevance": number between 0 and 10,
  "correctness": number between 0 and 10,
  "clarity": number between 0 and 10,
  "technicalDepth": number between 0 and 10,
  "feedback": "constructive 2-3 sentence overview feedback",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1"],
  "improvements": ["actionable improvement 1", "actionable improvement 2"]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) return null;

  return JSON.parse(textResponse);
};

module.exports = {
  generateQuestions,
  evaluateAnswerWithGemini,
};
