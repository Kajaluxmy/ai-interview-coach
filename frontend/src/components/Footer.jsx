import { BrainCircuit, Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
            <BrainCircuit className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200">AI Interview Coach</span>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Powered by Gemini
          </span>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1">
          Built for software engineers to ace their interviews.
        </p>
      </div>
    </footer>
  );
}
