import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  Bookmark,
  Volume2,
  VolumeX,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Filter,
} from "lucide-react";

const DRILL_QUESTIONS = [
  {
    id: 1,
    category: "Frontend & React",
    difficulty: "Intermediate",
    question:
      "Explain how React's Virtual DOM works and what triggers a re-render. How does React 18/19 optimize this with Concurrent Mode?",
    keywords: ["Virtual DOM", "Diffing Algorithm", "Reconciliation", "Fiber Tree", "Transitions"],
    modelAnswer:
      "React maintains an in-memory lightweight representation of the real DOM called the Virtual DOM. When state or props change, React constructs a new Virtual DOM tree and diffs it against the previous one using its reconciliation algorithm (Fiber). It computes the minimal set of batch mutations and commits them to the browser DOM. In React 18/19, Concurrent Mode breaks rendering into interruptible units of work via startTransition and useDeferredValue, keeping the main thread responsive during expensive renders.",
    pitfalls:
      "Avoid saying the Virtual DOM is always faster than direct DOM manipulation; its true strength is declarative UI programming and automated batching.",
  },
  {
    id: 2,
    category: "Frontend & React",
    difficulty: "Advanced",
    question:
      "What causes unnecessary re-renders in React and how do you effectively profile and eliminate them?",
    keywords: ["useMemo", "useCallback", "React.memo", "React DevTools Profiler", "Context Splitting"],
    modelAnswer:
      "Unnecessary re-renders occur when parent components re-render and pass newly allocated object or function references to memoized children, or when wide Context providers update frequently. To diagnose: use React DevTools Profiler with 'Record why each component rendered'. Fixes include: extracting independent state into local subtrees, splitting context into separate State and Dispatch contexts, and memoizing stable callbacks and expensive computations with useCallback and useMemo.",
    pitfalls:
      "Over-using useMemo/useCallback on trivial primitives adds memory overhead without performance gains.",
  },
  {
    id: 3,
    category: "Backend & Node.js",
    difficulty: "Intermediate",
    question:
      "Describe the Node.js Event Loop phases and explain how asynchronous I/O is handled without blocking.",
    keywords: ["libuv", "Microtask Queue", "Timers", "Poll Phase", "process.nextTick", "Thread Pool"],
    modelAnswer:
      "Node.js runs single-threaded JavaScript using an event loop backed by libuv. The loop passes through distinct phases: Timers (setTimeout/setInterval), Pending Callbacks, Idle/Prepare, Poll (incoming I/O events and connection read/writes), Check (setImmediate), and Close callbacks. Between every phase, microtasks (process.nextTick and resolved Promises) drain completely. Heavy non-network I/O (like file system and crypto) delegates to libuv's 4-thread thread pool, preventing CPU blocking of the main event loop.",
    pitfalls:
      "Confusing process.nextTick with setImmediate: nextTick runs immediately after current tick, before any I/O or timers.",
  },
  {
    id: 4,
    category: "Backend & Node.js",
    difficulty: "Advanced",
    question:
      "How do you design a robust database indexing strategy for MongoDB in a high-throughput application?",
    keywords: ["B-Tree Indexes", "Compound Index", "ESR Rule", "explain('executionStats')", "Write Amplification"],
    modelAnswer:
      "Indexes in MongoDB use B-Trees. To optimize compound indexes, strictly follow the ESR Rule: Equality fields first, Sort fields second, and Range query fields last. Always run explain('executionStats') to verify IXSCAN instead of COLLSCAN and ensure totalDocsExamined matches nReturned. Beware write amplification: every index slows down writes, so avoid indexing low-cardinality boolean fields alone.",
    pitfalls:
      "Placing range fields before equality fields breaks compound index utilization for subsequent keys.",
  },
  {
    id: 5,
    category: "System Design & Scalability",
    difficulty: "Advanced",
    question:
      "Design a real-time collaborative document editing service (like Google Docs). How do you resolve concurrent edits?",
    keywords: ["Operational Transformation (OT)", "CRDTs", "WebSockets", "Event Sourcing", "Redis Pub/Sub"],
    modelAnswer:
      "The system uses full-duplex WebSockets managed by an API Gateway. State synchronization relies on either Operational Transformation (OT - central server transforms character offsets) or Conflict-free Replicated Data Types (CRDTs - decentralized immutable unique character IDs like Yjs/Automerge). Server clusters use Redis Pub/Sub for cross-node document room broadcasting, and periodic snapshots are committed to persistent storage while changelog events stream to an append-only log.",
    pitfalls:
      "Don't propose simple database row locking for real-time keystroke synchronization; it creates massive latency bottlenecks.",
  },
  {
    id: 6,
    category: "System Design & Scalability",
    difficulty: "Intermediate",
    question:
      "What are the differences between horizontal scaling and vertical scaling, and how does database sharding work?",
    keywords: ["Scale-out vs Scale-up", "Shard Key", "Consistent Hashing", "Cross-shard Joins", "Read Replicas"],
    modelAnswer:
      "Vertical scaling (scale-up) increases CPU/RAM of a single machine, hitting hardware and cost limits with single points of failure. Horizontal scaling (scale-out) adds commodity nodes behind load balancers. Database sharding partitions data horizontally across independent servers by a Shard Key. Choosing a shard key with high cardinality and even distribution prevents 'hot spot' nodes. A routing service directs queries to the appropriate shard, avoiding expensive cross-shard scatter-gather queries.",
    pitfalls:
      "Selecting timestamp or low-cardinality status as a shard key routes all traffic to the newest server, defeating sharding.",
  },
  {
    id: 7,
    category: "Behavioral & STAR",
    difficulty: "Intermediate",
    question:
      "Tell me about a time you faced a critical production incident or outage. How did you diagnose, mitigate, and prevent recurrence?",
    keywords: ["STAR Method", "Incident Response", "Rollback", "Post-mortem / RCA", "Monitoring & Alerts"],
    modelAnswer:
      "Structure using STAR: Situation: Following a release, payment gateway API errors spiked by 40% affecting active checkouts. Task: As lead engineer on-call, my goal was to restore customer checkout flow within a 15-minute SLA. Action: Triaged APM error logs (Datadog/Sentry), identified a database connection pool exhaustion bug from an unindexed join, immediately triggered a canary rollback, and scaled temporary pool size. Result: Service recovered in 8 minutes with zero data loss. Post-incident, I added circuit breakers, database query timeouts, and lead a blameless post-mortem.",
    pitfalls:
      "Focusing on placing blame or getting lost in deep technical jargon rather than clearly demonstrating calm leadership and systematic prevention.",
  },
  {
    id: 8,
    category: "Behavioral & STAR",
    difficulty: "Intermediate",
    question:
      "Describe a situation where you had a strong disagreement with a technical lead or product manager. How did you resolve it?",
    keywords: ["STAR Method", "Data-Driven Consensus", "Empathy", "Trade-off Matrix", "Disagree and Commit"],
    modelAnswer:
      "Situation: The product manager wanted to ship a feature in 2 days by skipping database migrations and saving unstructured JSON. Task: Balance the aggressive go-to-market deadline without incurring disastrous technical debt. Action: I listened to the core business urgency (an investor demo), scheduled a 30-min alignment session, and proposed a middle ground: use a feature flag with a lightweight schema compromise that shipped in 3 days with automated rollback safety. Result: We hit the investor deadline, and refactored the clean migration the following sprint smoothly.",
    pitfalls:
      "Framing the disagreement as 'I was right, they were wrong'. Top interviewers look for mutual respect, business pragmatism, and constructive negotiation.",
  },
  {
    id: 9,
    category: "Core CS & Algorithms",
    difficulty: "Intermediate",
    question:
      "Explain how an LRU (Least Recently Used) Cache is implemented in O(1) time complexity for both get and put operations.",
    keywords: ["HashMap", "Doubly Linked List", "O(1) Access", "O(1) Eviction", "Node Pointers"],
    modelAnswer:
      "An LRU Cache combines a Hash Map and a Doubly Linked List. The Hash Map stores keys mapped directly to Linked List Nodes for O(1) lookups. The Doubly Linked List keeps nodes ordered by recency (Head = Most Recently Used, Tail = Least Recently Used). When 'get(key)' is called, the node is detached and moved to the Head. When 'put(key, val)' exceeds capacity, the Tail node is evicted from both the list and the hash map in O(1) pointer updates.",
    pitfalls:
      "Suggesting an array or singly-linked list: finding or removing an arbitrary element in an array/singly-linked list is O(N).",
  },
  {
    id: 10,
    category: "Core CS & Algorithms",
    difficulty: "Advanced",
    question:
      "What is the difference between TCP and UDP, and when would you choose WebSockets vs WebRTC for client-server communication?",
    keywords: ["3-way Handshake", "Flow Control", "Packet Loss", "P2P DataChannels", "Latency vs Reliability"],
    modelAnswer:
      "TCP is connection-oriented, guarantees ordered delivery, re-transmits dropped packets, and applies congestion/flow control with a 3-way handshake. UDP is connectionless and best-effort with no retransmissions, yielding minimal latency. WebSockets run on top of TCP, ideal for reliable bidirectional messaging (chat, notifications, stock updates). WebRTC uses UDP under the hood (SRTP/SCTP) with P2P direct channels, making it the industry standard for sub-second real-time audio/video streaming and live gaming.",
    pitfalls:
      "Assuming WebSockets is P2P; WebSockets always routes through a central server.",
  },
];

export default function QuestionDrill() {
  const [selectedCategory, setSelectedCategory] = useState("All Topics");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Mastered questions persisted in localStorage
  const [masteredIds, setMasteredIds] = useState(() => {
    try {
      const saved = localStorage.getItem("ai_coach_mastered_drills");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const categories = [
    "All Topics",
    "Frontend & React",
    "Backend & Node.js",
    "System Design & Scalability",
    "Behavioral & STAR",
    "Core CS & Algorithms",
  ];

  const filteredQuestions = DRILL_QUESTIONS.filter(
    (q) => selectedCategory === "All Topics" || q.category === selectedCategory
  );

  const currentQuestion = filteredQuestions[currentIndex] || filteredQuestions[0];
  const isMastered = masteredIds.includes(currentQuestion?.id);

  // Save mastered IDs to storage
  useEffect(() => {
    try {
      localStorage.setItem("ai_coach_mastered_drills", JSON.stringify(masteredIds));
    } catch (e) {
      console.warn("Storage error:", e);
    }
  }, [masteredIds]);

  // Reset card state on question change
  useEffect(() => {
    setIsFlipped(false);
    setCandidateNotes("");
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentIndex, selectedCategory]);

  const toggleMastered = (id) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredQuestions.length - 1);
    }
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    setCurrentIndex(randomIndex);
  };

  const handleSpeakQuestion = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const masteryPercentage = Math.round(
    (masteredIds.length / DRILL_QUESTIONS.length) * 100
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20 mb-2">
            <Zap className="w-3.5 h-3.5" /> Rapid-Fire Interview Flashcards
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Technical & Behavioral Question Drill
          </h1>
          <p className="text-sm text-slate-400">
            Rapidly test your verbal recall, model answers, and STAR structures before live interviews.
          </p>
        </div>

        {/* Global Drill Mastery Stats */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-white">
              {masteredIds.length} / {DRILL_QUESTIONS.length} Mastered
            </div>
            <div className="text-[10px] text-slate-400">
              {masteryPercentage}% Readiness
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400 bg-emerald-500/10">
            {masteryPercentage}%
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Flashcard Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Card Top Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {currentQuestion?.category}
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                currentQuestion?.difficulty === "Advanced"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : currentQuestion?.difficulty === "Intermediate"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {currentQuestion?.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio pronunciation */}
            <button
              onClick={handleSpeakQuestion}
              title={isSpeaking ? "Stop speaking" : "Speak question out loud"}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isSpeaking
                  ? "bg-indigo-600 text-white border-indigo-500 animate-pulse"
                  : "bg-slate-800 text-slate-400 hover:text-white border-slate-700"
              }`}
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Mastered toggle */}
            <button
              onClick={() => toggleMastered(currentQuestion.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isMastered
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isMastered ? "Mastered" : "Mark Mastered"}</span>
            </button>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-3 min-h-[110px] flex flex-col justify-center">
          <div className="text-xs uppercase font-mono tracking-widest text-slate-500">
            Question #{currentIndex + 1} of {filteredQuestions.length}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            {currentQuestion?.question}
          </h2>
        </div>

        {/* Key Concepts Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500 mr-1 font-mono uppercase">
            Expected Concepts:
          </span>
          {currentQuestion?.keywords.map((kw, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60"
            >
              {kw}
            </span>
          ))}
        </div>

        {/* Optional Self-Practice Outline Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Candidate Quick Notes & Verbal Outline (Practice Area):</span>
          </label>
          <textarea
            value={candidateNotes}
            onChange={(e) => setCandidateNotes(e.target.value)}
            rows={2}
            placeholder="Type your outline bullet points or key points before flipping to review the model answer..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
          />
        </div>

        {/* Reveal / Flip Button */}
        <div className="pt-2">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>
              {isFlipped
                ? "Hide Model Answer & Rubric"
                : "Reveal Ideal Answer Structure & Rubric"}
            </span>
          </button>
        </div>

        {/* Model Answer Drawer */}
        {isFlipped && (
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Model Answer Framework</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {currentQuestion?.modelAnswer}
            </p>

            {currentQuestion?.pitfalls && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start space-x-2.5 text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold">Interview Pitfall to Avoid: </span>
                  <span>{currentQuestion.pitfalls}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Card Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handlePrev}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShuffle}
              title="Shuffle question"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shuffle</span>
            </button>
            <span className="text-xs text-slate-500 font-mono">
              {currentIndex + 1} / {filteredQuestions.length}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
          >
            <span>Next Card</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
