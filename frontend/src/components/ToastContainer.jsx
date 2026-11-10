import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  const getToastConfig = (type) => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle2,
          iconClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          borderClass: "border-emerald-500/30",
          title: "Success",
        };
      case "error":
        return {
          icon: AlertCircle,
          iconClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
          borderClass: "border-rose-500/30",
          title: "Error",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          borderClass: "border-amber-500/30",
          title: "Attention",
        };
      case "info":
      default:
        return {
          icon: Info,
          iconClass: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
          borderClass: "border-indigo-500/30",
          title: "Notification",
        };
    }
  };

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const config = getToastConfig(toast.type);
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border ${config.borderClass} shadow-2xl shadow-black/50 transition-all transform animate-in slide-in-from-bottom-5 duration-200`}
            role="status"
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${config.iconClass}`}
            >
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {config.title}
              </div>
              <div className="text-xs font-medium text-slate-200 leading-snug break-words mt-0.5">
                {toast.message}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

