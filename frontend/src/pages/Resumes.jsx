import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useToast } from "../context/ToastContext";
import {
  FileText,
  UploadCloud,
  Trash2,
  Eye,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  FileCode,
  Download,
} from "lucide-react";

export default function Resumes() {
  const { toast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const fileInputRef = useRef(null);

  const fetchResumes = async () => {
    try {
      setError("");
      const res = await api.get("/resumes");
      if (res.data?.success) {
        setResumes(res.data.resumes || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setError("");
    setSuccess("");
    setUploading(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await api.post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setSuccess("Resume uploaded and parsed successfully!");
        toast.success("Resume uploaded and parsed successfully!");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchResumes();
      }
    } catch (err) {
      const errMsg = err.message || "Failed to upload resume.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    try {
      await api.delete(`/resumes/${id}`);
      setResumes((prev) => prev.filter((r) => r._id !== id));
      if (selectedResume?._id === id) setSelectedResume(null);
      setSuccess("Resume deleted successfully.");
      toast.success("Resume removed from account.");
    } catch (err) {
      const errMsg = err.message || "Failed to delete resume.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            <span>Resume Management</span>
          </h1>
          <p className="text-sm text-slate-400">
            Upload your PDF resume to extract skills and enable personalized AI
            interview questions.
          </p>
        </div>
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

      {/* Upload Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/40 rounded-3xl p-8 text-center transition-all group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          className="hidden"
          id="resume-upload"
        />

        <div className="space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
            {uploading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="resume-upload"
              className="text-base font-semibold text-white cursor-pointer hover:text-indigo-400 transition-colors"
            >
              {uploading ? "Extracting resume text..." : "Click to upload or drag & drop"}
            </label>
            <p className="text-xs text-slate-400">
              Only PDF format is supported (Max size: 10MB)
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all disabled:opacity-50"
          >
            Browse PDF File
          </button>
        </div>
      </div>

      {/* Resumes List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Your Uploaded Resumes</h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span>Loading resumes...</span>
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
            No resumes uploaded yet. Upload a PDF resume above to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((resume) => {
              const dateStr = new Date(resume.createdAt).toLocaleDateString(
                undefined,
                { year: "numeric", month: "short", day: "numeric" }
              );
              const previewText = resume.extractedText
                ? `${resume.extractedText.slice(0, 140)}...`
                : "Text extraction pending...";

              return (
                <div
                  key={resume._id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-[280px]">
                            {resume.fileName}
                          </h3>
                          <div className="text-[11px] text-slate-500">
                            Uploaded on {dateStr}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(resume._id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete resume"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 font-mono">
                      {previewText}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                    <button
                      onClick={() => setSelectedResume(resume)}
                      className="flex items-center space-x-1.5 text-slate-300 hover:text-white font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Text</span>
                    </button>

                    <Link
                      to={`/resume-analysis/${resume._id}`}
                      className="flex items-center space-x-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Skills Analysis</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Extracted Text Modal */}
      {selectedResume && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm truncate max-w-md">
                  Extracted Text: {selectedResume.fileName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedResume(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-text bg-slate-950/50">
              {selectedResume.extractedText || "No text could be extracted from this PDF."}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedResume(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
