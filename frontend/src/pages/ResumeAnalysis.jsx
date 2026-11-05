import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import {
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  PlayCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Tag,
} from "lucide-react";

export default function ResumeAnalysis() {
  const { resumeId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrRunAnalysis = async () => {
    try {
      setError("");
      setLoading(true);

      // Check if analysis already exists
      try {
        const res = await api.get(`/resume-analysis/${resumeId}`);
        if (res.data?.success && res.data?.analysis) {
          setAnalysis(res.data.analysis);
          setLoading(false);
          return;
        }
      } catch (err) {
        // If not found (404), proceed to trigger analysis
      }

      // Run new analysis
      await triggerAnalysis();
    } catch (err) {
      setError(err.message || "Failed to load resume analysis.");
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError("");
      const res = await api.post(`/resume-analysis/${resumeId}`);
      if (res.data?.success) {
        setAnalysis(res.data.analysis);
      }
    } catch (err) {
      setError(err.message || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (resumeId) {
      fetchOrRunAnalysis();
    }
  }, [resumeId]);

  if (loading || analyzing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center animate-pulse">
          <Sparkles className="w-7 h-7 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-semibold text-white">
            Analyzing your resume...
          </h3>
          <p className="text-xs text-slate-400">
            Scanning extracted text, categorizing technical skills, and evaluating strengths.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Analysis Error</h3>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/resumes"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Back to Resumes
          </Link>
          <button
            onClick={triggerAnalysis}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Resume Evaluation
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Resume Skills & Insights
          </h1>
          <p className="text-sm text-slate-400">
            Review parsed capabilities and personalized advice to target your interview prep.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerAnalysis}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-analyze</span>
          </button>

          <Link
            to={`/interviews?resumeId=${resumeId}`}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Practice with Resume</span>
          </Link>
        </div>
      </div>

      {/* Summary Card */}
      {analysis?.summary && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Resume Extract Overview</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 whitespace-pre-wrap">
            {analysis.summary}
          </p>
        </div>
      )}

      {/* Technical Skills Identified */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-teal-400" />
            <span>Detected Technical Skills</span>
          </h2>
          <span className="text-xs text-teal-400 font-semibold bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
            {analysis?.skills?.length || 0} Skills Found
          </span>
        </div>

        {analysis?.skills?.length === 0 ? (
          <p className="text-xs text-slate-400">
            No common keywords found. Make sure technical skills like JavaScript,
            React, Python, or SQL are clearly stated in your resume text.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {analysis.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 bg-slate-800/90 border border-slate-700/80 shadow-sm capitalize"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Insights Grid: Strengths, Weaknesses, Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center space-x-2 text-teal-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm text-white">Key Strengths</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {analysis?.strengths?.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60"
              >
                <span className="text-teal-400 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm text-white">Areas to Expand</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {analysis?.weaknesses?.map((item, idx) => (
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

        {/* Coach Recommendations */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Lightbulb className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm text-white">AI Recommendations</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {analysis?.recommendations?.map((item, idx) => (
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
    </div>
  );
}
