import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import {
  Award,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  PlayCircle,
  Loader2,
  AlertCircle,
  Printer,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

export default function InterviewReport() {
  const { interviewId } = useParams();
  const [report, setReport] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const fetchReportAndDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const [reportRes, questionsRes, answersRes, evalsRes] =
        await Promise.allSettled([
          api.get(`/reports/${interviewId}`),
          api.get(`/questions/${interviewId}`),
          api.get(`/answers/interview/${interviewId}`),
          api.get(`/evaluations/interview/${interviewId}`),
        ]);

      if (reportRes.status === "fulfilled" && reportRes.value.data?.report) {
        setReport(reportRes.value.data.report);
      } else {
        // Try generating if not found
        await handleGenerate();
      }

      if (questionsRes.status === "fulfilled") {
        setQuestions(questionsRes.value.data?.questions || []);
      }
      if (answersRes.status === "fulfilled") {
        setAnswers(answersRes.value.data?.answers || []);
      }
      if (evalsRes.status === "fulfilled") {
        setEvaluations(evalsRes.value.data?.evaluations || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await api.post(`/reports/${interviewId}/generate`);
      if (res.data?.success && res.data?.report) {
        setReport(res.data.report);
      }
    } catch (err) {
      setError(err.message || "Could not generate report.");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (interviewId) {
      fetchReportAndDetails();
    }
  }, [interviewId]);

  if (loading || generating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400">
          Generating comprehensive interview report...
        </p>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="font-bold text-white text-base">Report Unavailable</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/interviews"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800"
          >
            Back to Interviews
          </Link>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600"
          >
            Try Generating Again
          </button>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Technical", score: report?.technicalScore || 0, color: "#6366f1" },
    {
      name: "Communication",
      score: report?.communicationScore || 0,
      color: "#14b8a6",
    },
    {
      name: "Problem Solving",
      score: report?.problemSolvingScore || 0,
      color: "#f59e0b",
    },
    { name: "Overall", score: report?.overallScore || 0, color: "#a855f7" },
  ];

  const overall = report?.overallScore || 0;
  const readiness =
    overall >= 80
      ? { label: "Interview Ready", color: "text-teal-400 bg-teal-500/10 border-teal-500/30" }
      : overall >= 60
      ? { label: "Solid Foundation", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" }
      : { label: "Needs Practice", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };

  return (
    <div className="space-y-8 max-w-5xl mx-auto print:p-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-2">
            <Award className="w-3.5 h-3.5" /> Interview Performance Summary
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Performance Report: {report?.interviewId?.jobRole || "Mock Interview"}
          </h1>
          <p className="text-xs text-slate-400">
            Completed on {new Date(report?.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <Link
            to="/interviews"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Practice Another</span>
          </Link>
        </div>
      </div>

      {/* Main Score & Chart Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Badge */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Composite Score
          </span>
          <div className="text-6xl font-black text-white tracking-tight">
            {overall}
            <span className="text-2xl text-slate-500 font-medium">/100</span>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${readiness.color}`}
          >
            {readiness.label}
          </span>
        </div>

        {/* Recharts Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider">
              Dimension Breakdown
            </h3>
            <span className="text-slate-400">Target Benchmark: 80+</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value} / 100`, "Score"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights: Strengths, Areas for Improvement, Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-teal-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm text-white">Demonstrated Strengths</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(report?.strengths?.length ? report.strengths : ["Clear articulation of concepts."]).map(
              (item, idx) => (
                <li
                  key={idx}
                  className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60"
                >
                  <span className="text-teal-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              )
            )}
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm text-white">Areas to Sharpen</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(report?.weaknesses?.length
              ? report.weaknesses
              : ["Add deeper technical trade-off details."]
            ).map((item, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60"
              >
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Lightbulb className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm text-white">Coach Strategy</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(report?.recommendations?.length
              ? report.recommendations
              : ["Practice with more complex architectural scenarios."]
            ).map((item, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60"
              >
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question by Question Review Accordion */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <span>Question-by-Question Detailed Review</span>
        </h2>

        <div className="space-y-3">
          {questions.map((q, idx) => {
            const answer = answers.find(
              (a) =>
                (typeof a.questionId === "object"
                  ? a.questionId._id
                  : a.questionId) === q._id
            );
            const evaluation = answer
              ? evaluations.find(
                  (e) =>
                    (typeof e.answerId === "object"
                      ? e.answerId._id
                      : e.answerId) === answer._id
                )
              : null;

            const isExpanded = expandedQuestion === q._id;

            return (
              <div
                key={q._id}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() =>
                    setExpandedQuestion(isExpanded ? null : q._id)
                  }
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-white line-clamp-1">
                      {q.questionText}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    {evaluation && (
                      <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-lg border border-teal-500/20">
                        {evaluation.score} / 10
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-800/60 space-y-4 text-xs">
                    <div className="space-y-1.5 pt-3">
                      <span className="font-semibold text-slate-400 uppercase text-[10px]">
                        Your Answer:
                      </span>
                      <p className="text-slate-200 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono whitespace-pre-wrap">
                        {answer?.answerText || "No answer recorded."}
                      </p>
                    </div>

                    {evaluation && (
                      <div className="space-y-2 bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-500/20">
                        <span className="font-semibold text-indigo-300">
                          Critique & Feedback:
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {evaluation.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
