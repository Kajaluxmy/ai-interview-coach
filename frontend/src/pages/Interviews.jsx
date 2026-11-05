import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import {
  PlayCircle,
  Plus,
  Trash2,
  Sparkles,
  Clock,
  Award,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Sliders,
  ArrowRight,
} from "lucide-react";

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create Interview Modal State
  const [showModal, setShowModal] = useState(false);
  const [jobRole, setJobRole] = useState("Full Stack Developer");
  const [interviewType, setInterviewType] = useState("technical");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [generating, setGenerating] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fetchInterviewsAndResumes = async () => {
    try {
      setError("");
      const [interviewsRes, resumesRes] = await Promise.all([
        api.get("/interviews"),
        api.get("/resumes"),
      ]);

      if (interviewsRes.data?.success) {
        setInterviews(interviewsRes.data.interviews || []);
      }
      if (resumesRes.data?.success) {
        setResumes(resumesRes.data.resumes || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load interviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviewsAndResumes();

    // Check query params to prefill creation modal
    const roleParam = searchParams.get("role");
    const diffParam = searchParams.get("difficulty");
    const resumeParam = searchParams.get("resumeId");

    if (roleParam || resumeParam) {
      if (roleParam) setJobRole(roleParam);
      if (diffParam) setDifficulty(diffParam);
      if (resumeParam) setSelectedResumeId(resumeParam);
      setShowModal(true);
    }
  }, [searchParams]);

  const handleCreateAndGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setGenerating(true);

    try {
      // 1. Create interview session
      const createRes = await api.post("/interviews", {
        jobRole,
        interviewType,
        difficulty,
        totalQuestions: Number(totalQuestions),
      });

      if (!createRes.data?.success || !createRes.data?.interview) {
        throw new Error("Failed to initialize interview.");
      }

      const newInterview = createRes.data.interview;

      // 2. Generate questions via AI
      await api.post(`/questions/${newInterview._id}/generate`, {
        count: Number(totalQuestions),
        resumeId: selectedResumeId || null,
      });

      setShowModal(false);
      navigate(`/interview/${newInterview._id}`);
    } catch (err) {
      setError(err.message || "Failed to create and generate questions.");
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interview session?"))
      return;

    try {
      await api.delete(`/interviews/${id}`);
      setInterviews((prev) => prev.filter((i) => i._id !== id));
      setSuccess("Interview session deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete interview.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-indigo-400" />
            <span>Mock Interview Sessions</span>
          </h1>
          <p className="text-sm text-slate-400">
            Practice AI-generated technical, behavioral, or mixed questions with real-time feedback.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>New Mock Interview</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start space-x-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm flex items-start space-x-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Interviews Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Loading interview sessions...</span>
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">
              No mock interviews yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Configure your role, difficulty, and questions count to start practicing right away.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Start Practice Session</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview) => {
            const isCompleted = interview.status === "completed";
            const inProgress = interview.status === "in_progress";
            const dateStr = new Date(interview.createdAt).toLocaleDateString(
              undefined,
              { year: "numeric", month: "short", day: "numeric" }
            );

            return (
              <div
                key={interview._id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isCompleted
                          ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                          : inProgress
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {interview.status.replace("_", " ")}
                    </span>

                    <button
                      onClick={() => handleDelete(interview._id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                      {interview.jobRole}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Created on {dateStr}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-center">
                    <div className="p-2 rounded-xl bg-slate-950/40">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        Type
                      </div>
                      <div className="text-xs font-semibold text-slate-200 capitalize">
                        {interview.interviewType}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/40">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        Level
                      </div>
                      <div className="text-xs font-semibold text-slate-200 capitalize">
                        {interview.difficulty}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/40">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        Questions
                      </div>
                      <div className="text-xs font-semibold text-slate-200">
                        {interview.totalQuestions}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {isCompleted ? (
                    <Link
                      to={`/reports/${interview._id}`}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>View Performance Report</span>
                    </Link>
                  ) : (
                    <Link
                      to={`/interview/${interview._id}`}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all flex items-center justify-center space-x-1.5"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>{inProgress ? "Resume Session" : "Start Interview"}</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create & Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">
                  Configure AI Mock Interview
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAndGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Target Job Role *
                </label>
                <input
                  type="text"
                  required
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer, Full Stack, DevOps"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Interview Type
                  </label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral (STAR)</option>
                    <option value="hr">HR & Culture Fit</option>
                    <option value="mixed">Mixed (Tech + HR)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced (Staff/Lead)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300">
                    Number of Questions
                  </label>
                  <span className="text-indigo-400 font-bold">
                    {totalQuestions} Questions
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(e.target.value)}
                  className="w-full accent-indigo-500"
                />
              </div>

              {resumes.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Personalize with Uploaded Resume (Optional)</span>
                    <span className="text-[10px] text-teal-400">Tailored AI Context</span>
                  </label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None (Standard Role Practice)</option>
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.fileName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center space-x-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate & Begin Interview</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
