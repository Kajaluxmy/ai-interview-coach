import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import {
  PlayCircle,
  Clock,
  Send,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
  Loader2,
  AlertCircle,
  HelpCircle,
  Check,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import SpeechRecognitionButton from "../components/SpeechRecognitionButton";
import StarMethodHelper from "../components/StarMethodHelper";

export default function InterviewRoom() {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answersMap, setAnswersMap] = useState({});
  const [evaluationsMap, setEvaluationsMap] = useState({});

  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finishing, setFinishing] = useState(false);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem
      .toString()
      .padStart(2, "0")}`;
  };

  const loadSessionData = async () => {
    try {
      setError("");
      setLoading(true);

      const [interviewRes, questionsRes, answersRes, evalsRes] =
        await Promise.all([
          api.get(`/interviews/${interviewId}`),
          api.get(`/questions/${interviewId}`),
          api.get(`/answers/interview/${interviewId}`),
          api.get(`/evaluations/interview/${interviewId}`).catch(() => ({
            data: { evaluations: [] },
          })),
        ]);

      if (interviewRes.data?.success) {
        const interviewData = interviewRes.data.interview;
        setInterview(interviewData);

        if (interviewData.status === "not_started") {
          await api.patch(`/interviews/${interviewId}/start`);
        }
      }

      const qList = questionsRes.data?.questions || [];
      setQuestions(qList);

      const aMap = {};
      (answersRes.data?.answers || []).forEach((ans) => {
        const qId =
          typeof ans.questionId === "object"
            ? ans.questionId._id
            : ans.questionId;
        aMap[qId] = ans;
      });
      setAnswersMap(aMap);

      const eMap = {};
      (evalsRes.data?.evaluations || []).forEach((ev) => {
        const ansId =
          typeof ev.answerId === "object" ? ev.answerId._id : ev.answerId;
        eMap[ansId] = ev;
      });
      setEvaluationsMap(eMap);

      // Find first unanswered question
      const firstUnanswered = qList.findIndex((q) => !aMap[q._id]);
      if (firstUnanswered !== -1) {
        setCurrentIndex(firstUnanswered);
      }
    } catch (err) {
      setError(err.message || "Failed to load interview session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (interviewId) {
      loadSessionData();
    }
  }, [interviewId]);

  const currentQuestion = questions[currentIndex];
  const existingAnswer = currentQuestion ? answersMap[currentQuestion._id] : null;
  const existingEvaluation = existingAnswer
    ? evaluationsMap[existingAnswer._id]
    : null;

  useEffect(() => {
    if (existingAnswer) {
      setAnswerText(existingAnswer.answerText || "");
    } else {
      setAnswerText("");
    }
  }, [currentIndex, existingAnswer]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || submitting || existingAnswer) return;

    setSubmitting(true);
    setError("");

    try {
      // 1. Submit answer
      const ansRes = await api.post(`/answers/interview/${interviewId}`, {
        questionId: currentQuestion._id,
        answerText,
        duration: elapsedSeconds,
      });

      if (!ansRes.data?.success || !ansRes.data?.answer) {
        throw new Error("Failed to save answer.");
      }

      const savedAnswer = ansRes.data.answer;
      setAnswersMap((prev) => ({
        ...prev,
        [currentQuestion._id]: savedAnswer,
      }));

      // 2. Trigger auto evaluation with AI
      try {
        const evalRes = await api.post(`/evaluations/${savedAnswer._id}/auto`);
        if (evalRes.data?.success && evalRes.data?.evaluation) {
          setEvaluationsMap((prev) => ({
            ...prev,
            [savedAnswer._id]: evalRes.data.evaluation,
          }));
        }
      } catch (evalErr) {
        console.warn("Auto evaluation warning:", evalErr.message);
      }
    } catch (err) {
      setError(err.message || "Failed to submit answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    setFinishing(true);
    setError("");

    try {
      // 1. Mark completed
      await api.patch(`/interviews/${interviewId}/complete`);

      // 2. Generate comprehensive report
      await api.post(`/reports/${interviewId}/generate`);

      // 3. Navigate to report page
      navigate(`/reports/${interviewId}`);
    } catch (err) {
      setError(
        err.message ||
          "Could not generate report. Please ensure at least one question is answered and evaluated."
      );
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading interview room...</p>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="font-bold text-white text-base">Error Loading Session</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <Link
          to="/interviews"
          className="inline-block px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600"
        >
          Back to Interviews
        </Link>
      </div>
    );
  }

  const answeredCount = Object.keys(answersMap).length;
  const isLastQuestion = currentIndex === questions.length - 1;
  const wordCount = answerText.trim()
    ? answerText.trim().split(/\s+/).length
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Top Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/interviews"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{interview?.jobRole}</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {interview?.difficulty}
              </span>
            </h2>
            <div className="text-[11px] text-slate-400">
              Answered {answeredCount} of {questions.length} questions
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {answeredCount > 0 && (
            <button
              onClick={handleFinishInterview}
              disabled={finishing}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 shadow transition-all disabled:opacity-50"
            >
              {finishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BarChart3 className="w-3.5 h-3.5" />
              )}
              <span>Finish & View Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 py-1">
        {questions.map((q, idx) => {
          const isAnswered = !!answersMap[q._id];
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={q._id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                isCurrent
                  ? "w-8 bg-indigo-500"
                  : isAnswered
                  ? "w-4 bg-teal-400"
                  : "w-2 bg-slate-700 hover:bg-slate-600"
              }`}
              title={`Question ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start space-x-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Question Card */}
      {currentQuestion && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-indigo-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                {currentQuestion.questionType}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQuestion.questionText}
            </h3>

            {currentQuestion.expectedTopics?.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Key Topics:
                </span>
                {currentQuestion.expectedTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Response Box / Answer Area */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                {existingAnswer ? "Your Submitted Answer" : "Type Your Response"}
              </span>
              <div className="flex items-center space-x-3">
                {!existingAnswer && (
                  <SpeechRecognitionButton
                    onTranscript={(spokenText) =>
                      setAnswerText((prev) =>
                        prev ? `${prev.trim()} ${spokenText.trim()}` : spokenText.trim()
                      )
                    }
                    disabled={submitting}
                  />
                )}
                <span>{wordCount} words</span>
              </div>
            </div>

            {!existingAnswer && (
              <StarMethodHelper
                onApplyStructure={(structuredText) =>
                  setAnswerText((prev) =>
                    prev ? `${prev.trim()}\n\n${structuredText}` : structuredText
                  )
                }
              />
            )}

            <textarea
              rows={7}
              disabled={!!existingAnswer || submitting}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Structure your thoughts clearly. Explain your thought process, technical trade-offs, and concrete examples..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed disabled:opacity-80"
            />

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500">
                {!existingAnswer && "Tip: Aim for at least 30-50 words for thorough AI scoring."}
              </div>

              {!existingAnswer ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answerText.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Answer</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center space-x-1.5 text-xs text-teal-400 font-semibold bg-teal-500/10 px-3 py-1.5 rounded-xl border border-teal-500/20">
                  <Check className="w-4 h-4" />
                  <span>Answer Submitted</span>
                </div>
              )}
            </div>
          </div>

          {/* Instant AI Evaluation Card */}
          {existingEvaluation && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                  <h4 className="font-bold text-white text-sm">
                    AI Answer Critique & Score
                  </h4>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Score:</span>
                  <span
                    className={`text-base font-black px-2.5 py-0.5 rounded-xl ${
                      existingEvaluation.score >= 8
                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                        : existingEvaluation.score >= 5
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {existingEvaluation.score} / 10
                  </span>
                </div>
              </div>

              {/* Sub-scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Relevance
                  </span>
                  <span className="font-bold text-white">
                    {existingEvaluation.relevance || existingEvaluation.score}/10
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Correctness
                  </span>
                  <span className="font-bold text-white">
                    {existingEvaluation.correctness || existingEvaluation.score}/10
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Clarity
                  </span>
                  <span className="font-bold text-white">
                    {existingEvaluation.clarity || existingEvaluation.score}/10
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Technical Depth
                  </span>
                  <span className="font-bold text-white">
                    {existingEvaluation.technicalDepth || existingEvaluation.score}/10
                  </span>
                </div>
              </div>

              {/* Feedback text */}
              {existingEvaluation.feedback && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                  {existingEvaluation.feedback}
                </p>
              )}

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {existingEvaluation.strengths?.length > 0 && (
                  <div className="space-y-1 text-teal-300">
                    <span className="font-bold text-slate-200">What went well:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {existingEvaluation.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {existingEvaluation.improvements?.length > 0 && (
                  <div className="space-y-1 text-amber-300">
                    <span className="font-bold text-slate-200">Ways to improve:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {existingEvaluation.improvements.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleFinishInterview}
                disabled={finishing}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 shadow-lg shadow-teal-500/20 transition-all hover:scale-102"
              >
                {finishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Award className="w-4 h-4" />
                )}
                <span>Complete & View Report</span>
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(questions.length - 1, prev + 1)
                  )
                }
                className="flex items-center space-x-1 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
