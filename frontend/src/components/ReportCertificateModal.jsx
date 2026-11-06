import { X, Award, CheckCircle2, Printer, Sparkles } from "lucide-react";

export default function ReportCertificateModal({ report, candidateName, onClose }) {
  if (!report) return null;

  const role = report.interviewId?.jobRole || "Software Engineering Role";
  const dateStr = new Date(report.createdAt || Date.now()).toLocaleDateString(
    undefined,
    { year: "numeric", month: "long", day: "numeric" }
  );

  const overall = report.overallScore || 0;
  const readiness =
    overall >= 80
      ? "Demonstrated Strong Competency - Interview Ready"
      : overall >= 60
      ? "Demonstrated Solid Technical Competency"
      : "Foundational Knowledge - Practice Ongoing";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative space-y-6 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm">
              Official Performance Certificate
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="border-4 border-double border-indigo-500/30 p-8 rounded-3xl bg-gradient-to-b from-slate-950/70 to-slate-900/90 text-center space-y-6 print:bg-white print:border-slate-400 print:text-black">
          <div className="space-y-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/20">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase print:text-black pt-2">
              Certificate of Mock Interview Readiness
            </h2>
            <p className="text-xs text-indigo-300 font-semibold uppercase tracking-widest print:text-indigo-800">
              AI Interview Coach Assessment
            </p>
          </div>

          <p className="text-xs text-slate-400 print:text-slate-600">
            This certificate acknowledges that
          </p>

          <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-white to-indigo-300 border-b border-indigo-500/20 pb-2 max-w-sm mx-auto print:text-black print:border-black">
            {candidateName || "Candidate"}
          </div>

          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed print:text-slate-800">
            has successfully completed a comprehensive technical interview simulation for the target role of{" "}
            <strong className="text-white print:text-black">{role}</strong> with an overall performance score of:
          </p>

          {/* Score Badge */}
          <div className="inline-block px-6 py-2 rounded-2xl bg-slate-950 border border-indigo-500/30 print:border-slate-400">
            <span className="text-4xl font-black text-white print:text-black">
              {overall}
            </span>
            <span className="text-lg text-slate-400 font-bold print:text-slate-600">
              /100
            </span>
            <div className="text-[11px] font-semibold text-teal-400 print:text-teal-800">
              {readiness}
            </div>
          </div>

          {/* Breakdown Mini Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-500 uppercase block">
                Technical
              </span>
              <span className="font-extrabold text-white text-base print:text-black">
                {report.technicalScore || 0}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-500 uppercase block">
                Communication
              </span>
              <span className="font-extrabold text-white text-base print:text-black">
                {report.communicationScore || 0}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-500 uppercase block">
                Problem Solving
              </span>
              <span className="font-extrabold text-white text-base print:text-black">
                {report.problemSolvingScore || 0}%
              </span>
            </div>
          </div>

          {/* Date & Signature */}
          <div className="flex items-center justify-between pt-6 border-t border-indigo-500/20 text-left text-xs text-slate-400 print:text-slate-600">
            <div>
              <span className="block text-[10px] uppercase text-slate-500">
                Evaluation Date
              </span>
              <span className="font-semibold text-slate-200 print:text-black">
                {dateStr}
              </span>
            </div>

            <div className="text-right">
              <span className="block text-[10px] uppercase text-slate-500">
                Verified By
              </span>
              <span className="font-semibold text-teal-400 flex items-center gap-1 print:text-teal-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> AI Coach Verification
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
