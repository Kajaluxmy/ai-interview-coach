import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import {
  Briefcase,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  FileText,
  Building,
  Target,
  ArrowRight,
} from "lucide-react";

export default function JobDescriptions() {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create Job Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Match Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [matching, setMatching] = useState(false);

  const fetchData = async () => {
    try {
      setError("");
      const [jobsRes, resumesRes] = await Promise.all([
        api.get("/job-descriptions"),
        api.get("/resumes"),
      ]);

      if (jobsRes.data?.success) setJobs(jobsRes.data.jobs || []);
      if (resumesRes.data?.success) setResumes(resumesRes.data.resumes || []);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await api.post("/job-descriptions", {
        title,
        company,
        experienceLevel,
        description,
        skills,
      });

      if (res.data?.success) {
        setSuccess("Job description created successfully!");
        setShowModal(false);
        setTitle("");
        setCompany("");
        setDescription("");
        setSkillsInput("");
        fetchData();
      }
    } catch (err) {
      setError(err.message || "Failed to create job description.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job description?"))
      return;

    try {
      await api.delete(`/job-descriptions/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
      setSuccess("Job description deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete job description.");
    }
  };

  const handleRunMatch = async () => {
    if (!selectedJob || !selectedResumeId) return;

    setMatching(true);
    setError("");
    try {
      const res = await api.post(
        `/job-descriptions/${selectedJob._id}/match/${selectedResumeId}`
      );
      if (res.data?.success) {
        setMatchResult(res.data.match);
      }
    } catch (err) {
      setError(err.message || "Failed to match resume with job description.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-400" />
            <span>Target Job Descriptions</span>
          </h1>
          <p className="text-sm text-slate-400">
            Save job postings to compare against your resume and generate tailored mock interviews.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Add Job Description</span>
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

      {/* Job Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Loading job descriptions...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">
              No job descriptions saved yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add job posts you are applying for to check skill match and tailor your practice questions.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Job Post</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      {job.company && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          <span>{job.company}</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold uppercase text-[10px] tracking-wider">
                        {job.experienceLevel}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {job.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skills.slice(0, 6).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-300 bg-slate-800/90 border border-slate-700/60"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 6 && (
                      <span className="text-[11px] text-slate-500 self-center">
                        +{job.skills.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setMatchResult(null);
                    if (resumes.length > 0) setSelectedResumeId(resumes[0]._id);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Match with Resume</span>
                </button>

                <Link
                  to={`/interviews?role=${encodeURIComponent(job.title)}&difficulty=${
                    job.experienceLevel === "entry"
                      ? "beginner"
                      : job.experienceLevel === "senior" || job.experienceLevel === "lead"
                      ? "advanced"
                      : "intermediate"
                  }`}
                  className="flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <span>Practice for Role</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                Add Job Description
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Tech Corp"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead / Principal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. React, TypeScript, Node.js, GraphQL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Full Job Description *
                </label>
                <textarea
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste the full job posting requirements and responsibilities here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save Job Description</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Match with Resume Drawer / Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">
                  Match Resume: {selectedJob.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Compare your qualifications against this job's criteria
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resumes.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  You haven't uploaded any resumes yet.
                </p>
                <Link
                  to="/resumes"
                  className="inline-block px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600"
                >
                  Go to Upload Resume
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Select Candidate Resume:
                  </label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.fileName}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleRunMatch}
                  disabled={matching || !selectedResumeId}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-teal-600 hover:bg-teal-500 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {matching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Compute Match Score</span>
                    </>
                  )}
                </button>

                {/* Match Result Display */}
                {matchResult && (
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    {/* Gauge / Score */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400">Match Readiness</div>
                        <div className="text-2xl font-black text-white">
                          {matchResult.matchPercentage}%
                        </div>
                      </div>

                      <div className="w-24 bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            matchResult.matchPercentage >= 70
                              ? "bg-teal-400"
                              : matchResult.matchPercentage >= 40
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                          style={{ width: `${matchResult.matchPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Matching Skills */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-teal-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Matching Skills ({matchResult.matchingSkills?.length || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.matchingSkills?.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    {matchResult.missingSkills?.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          <span>Missing / Desired Skills ({matchResult.missingSkills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.missingSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coach Advice */}
                    {matchResult.recommendations?.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-1">
                        <div className="text-xs font-semibold text-indigo-300">
                          Interview Coach Strategy:
                        </div>
                        <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                          {matchResult.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
