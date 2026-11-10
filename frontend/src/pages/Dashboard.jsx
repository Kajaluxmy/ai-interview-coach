import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import {
  PlayCircle,
  FileText,
  Briefcase,
  BarChart3,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  Zap,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [interviewsRes, reportsRes, resumesRes, jobsRes] =
          await Promise.allSettled([
            api.get("/interviews"),
            api.get("/reports"),
            api.get("/resumes"),
            api.get("/job-descriptions"),
          ]);

        if (interviewsRes.status === "fulfilled") {
          setInterviews(interviewsRes.value.data?.interviews || []);
        }
        if (reportsRes.status === "fulfilled") {
          setReports(reportsRes.value.data?.reports || []);
        }
        if (resumesRes.status === "fulfilled") {
          setResumes(resumesRes.value.data?.resumes || []);
        }
        if (jobsRes.status === "fulfilled") {
          setJobs(jobsRes.value.data?.jobs || []);
        }
      } catch (err) {
        console.warn("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const completedInterviews = interviews.filter(
    (i) => i.status === "completed"
  ).length;

  const averageScore =
    reports.length > 0
      ? Math.round(
          reports.reduce((acc, r) => acc + (r.overallScore || 0), 0) /
            reports.length
        )
      : null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your coach dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Ready for your next session
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || "Candidate"}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Sharpen your responses, review AI critique, and benchmark your
              skills against real technical roles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/interviews"
              className="flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 text-sm"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start New Interview</span>
            </Link>
            <Link
              to="/resumes"
              className="flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/60 transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Upload Resume</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Sessions
            </span>
            <PlayCircle className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {interviews.length}
          </div>
          <div className="text-xs text-slate-500">
            {completedInterviews} completed
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Average Score
            </span>
            <Award className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {averageScore !== null ? `${averageScore}%` : "—"}
          </div>
          <div className="text-xs text-teal-400">
            {reports.length > 0 ? `Across ${reports.length} report(s)` : "Complete a session to score"}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Uploaded Resumes
            </span>
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {resumes.length}
          </div>
          <div className="text-xs text-slate-500">
            Used for personalized questions
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Target Jobs
            </span>
            <Briefcase className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {jobs.length}
          </div>
          <div className="text-xs text-slate-500">
            Job descriptions saved
          </div>
        </div>
      </div>

      {/* Main Content: Recent Interviews & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Interviews (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Recent Mock Interviews</span>
            </h2>
            <Link
              to="/interviews"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">
                  No interview sessions yet
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Create your first role-tailored mock interview to practice
                  answering AI questions.
                </p>
              </div>
              <Link
                to="/interviews"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Mock Interview</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.slice(0, 5).map((interview) => {
                const isCompleted = interview.status === "completed";
                const inProgress = interview.status === "in_progress";

                return (
                  <div
                    key={interview._id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {interview.jobRole}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isCompleted
                              ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                              : inProgress
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {interview.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="capitalize">{interview.interviewType}</span>
                        <span>•</span>
                        <span className="capitalize">{interview.difficulty}</span>
                        <span>•</span>
                        <span>{interview.totalQuestions} Questions</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <Link
                          to={`/reports/${interview._id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-colors flex items-center gap-1"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>Report</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/interview/${interview._id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all flex items-center gap-1"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>{inProgress ? "Continue" : "Start"}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Tools & Performance Spotlight (1 Col) */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Coach Quick Actions</span>
            </h3>

            <div className="space-y-2">
              <Link
                to="/drill"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-amber-500/30 transition-colors text-xs text-slate-200 group"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-white">Rapid Question Drills</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
              </Link>

              <Link
                to="/resumes"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800 transition-colors text-xs text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Resume Text Analysis</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                to="/jobs"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800 transition-colors text-xs text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Match Job Description</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                to="/reports"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800 transition-colors text-xs text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-teal-400" />
                  <span>Performance History</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>
          </div>

          {/* Coach Tip Card */}
          <div className="bg-gradient-to-br from-indigo-950/30 to-slate-900/60 border border-indigo-500/20 rounded-2xl p-5 space-y-2">
            <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Interview Pro Tip
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When answering behavioral questions, apply the <strong>STAR</strong> method:
              Situation, Task, Action, and Result. Include quantifiable metrics
              whenever possible!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
