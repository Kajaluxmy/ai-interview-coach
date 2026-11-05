import { Link } from "react-router-dom";
import {
  BrainCircuit,
  Sparkles,
  Target,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function Home({ user }) {
  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Technical Interview Coach
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Master Your Next Tech Interview with{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-teal-300 to-indigo-300">
            Real AI Coaching
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Practice role-specific mock interviews tailored to your resume, get
          instant AI feedback on your answers, match job descriptions, and track
          your progress to interview with confidence.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <span>{user ? "Go to Dashboard" : "Start Practicing Free"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={user ? "/interviews" : "/login"}
            className="px-6 py-3.5 rounded-xl font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800/80 hover:text-white transition-all"
          >
            {user ? "View Mock Interviews" : "Sign In"}
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">
            AI-Generated Mock Sessions
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Generate customized questions across Frontend, Backend, Full Stack,
            and Behavioral tracks based on difficulty and job requirements.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/40 transition-colors space-y-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">
            Instant In-Depth Evaluation
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Receive automated scoring on correctness, technical depth, clarity,
            and relevance with actionable coaching tips for every answer.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 transition-colors space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">
            Resume & Job Matcher
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Upload your PDF resume to extract skills, analyze gaps, and compare
            your qualifications directly against target job descriptions.
          </p>
        </div>
      </section>

      {/* Trust & Stats Banner */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-xl font-bold text-white">
            Ready to ace your upcoming interviews?
          </h4>
          <p className="text-sm text-slate-400">
            Join candidates preparing for top tech roles with AI-driven mock
            interviews.
          </p>
        </div>
        <Link
          to={user ? "/dashboard" : "/register"}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all text-sm shrink-0"
        >
          Get Started Now
        </Link>
      </section>
    </div>
  );
}
