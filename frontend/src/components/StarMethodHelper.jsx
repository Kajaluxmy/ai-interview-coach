import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Copy, Check, ArrowRight } from "lucide-react";

export default function StarMethodHelper({ onApplyStructure }) {
  const [isOpen, setIsOpen] = useState(false);
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleApply = () => {
    const parts = [];
    if (situation.trim()) parts.push(`Situation: ${situation.trim()}`);
    if (task.trim()) parts.push(`Task: ${task.trim()}`);
    if (action.trim()) parts.push(`Action: ${action.trim()}`);
    if (result.trim()) parts.push(`Result: ${result.trim()}`);

    const structuredText = parts.join("\n\n");
    if (structuredText) {
      onApplyStructure(structuredText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-indigo-500/10 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            STAR Method Answer Builder
          </span>
          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
            (Situation • Task • Action • Result)
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 pt-1 space-y-3 border-t border-indigo-500/10 text-xs">
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Fill in the 4 pillars below to craft a high-scoring, structured response:
          </p>

          <div className="space-y-2">
            <div>
              <span className="font-semibold text-teal-300 block mb-1">
                S - Situation
              </span>
              <input
                type="text"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="What was the background, problem, or project context?"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <span className="font-semibold text-indigo-300 block mb-1">
                T - Task
              </span>
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="What was your specific responsibility or role?"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <span className="font-semibold text-purple-300 block mb-1">
                A - Action
              </span>
              <input
                type="text"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="What exact steps, technologies, or decisions did you take?"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <span className="font-semibold text-amber-300 block mb-1">
                R - Result
              </span>
              <input
                type="text"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="What was the measurable outcome, metric, or impact?"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleApply}
              disabled={!situation && !task && !action && !result}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 transition-colors shadow"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-300" />
                  <span>Applied to Answer!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Insert into Answer Box</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
