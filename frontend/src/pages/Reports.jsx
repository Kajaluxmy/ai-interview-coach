import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import {
  BarChart3,
  Award,
  PlayCircle,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setError("");
        const res = await api.get("/reports");
        if (res.data?.success) {
          setReports(res.data.reports || []);
        }
      } catch (err) {
        setError(err.message || "Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-400" />
          <span>Interview Performance History</span>
        </h1>
        <p className="text-sm text-slate-400">
          Track progress across all your completed technical and behavioral interview sessions.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start space-x-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
          <span>Loading historical reports...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">
              No performance reports generated yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Complete a mock interview session to automatically generate your detailed skill report and scoring.
            </p>
          </div>
          <Link
            to="/interviews"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Go to Mock Interviews</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const overall = report.overallScore || 0;
            const role = report.interviewId?.jobRole || "Mock Interview";
            const diff = report.interviewId?.difficulty || "intermediate";
            const dateStr = new Date(report.createdAt).toLocaleDateString();

            return (
              <div
                key={report._id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {dateStr}
                    </span>
                    <span className="text-xs font-black text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-lg border border-teal-500/20">
                      {overall} / 100
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                      {role}
                    </h3>
                    <div className="text-xs text-slate-400 capitalize mt-0.5">
                      {diff} Level
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800/60">
                    <div className="p-2 rounded-xl bg-slate-950/40">
                      <div className="text-[10px] text-slate-500 uppercase">
                        Tech
                      </div>
                      <div className="font-bold text-slate-200">
                        {report.technicalScore || 0}%
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/40">
                      <div className="text-[10px] text-slate-500 uppercase">
                        Comm
                      </div>
                      <div className="font-bold text-slate-200">
                        {report.communicationScore || 0}%
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/40">
                      <div className="text-[10px] text-slate-500 uppercase">
                        Solve
                      </div>
                      <div className="font-bold text-slate-200">
                        {report.problemSolvingScore || 0}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/reports/${
                      typeof report.interviewId === "object"
                        ? report.interviewId._id
                        : report.interviewId
                    }`}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>Inspect Full Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
