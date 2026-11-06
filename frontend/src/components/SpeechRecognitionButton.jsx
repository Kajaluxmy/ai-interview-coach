import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";

export default function SpeechRecognitionButton({ onTranscript, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!supported || disabled) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Speech recognition start failed:", err);
      }
    }
  };

  if (!supported) {
    return (
      <span
        title="Speech recognition is not supported in this browser. Try Google Chrome or Edge."
        className="text-[11px] text-slate-500 flex items-center gap-1 cursor-help"
      >
        <MicOff className="w-3.5 h-3.5 text-slate-600" />
        <span>Voice input unsupported</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
        isListening
          ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30"
          : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/80"
      } disabled:opacity-50`}
      title={isListening ? "Click to stop voice dictation" : "Click to speak your answer"}
    >
      {isListening ? (
        <>
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <Mic className="w-3.5 h-3.5" />
          <span>Listening... (Click to stop)</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5 text-indigo-400" />
          <span>Speak Answer</span>
        </>
      )}
    </button>
  );
}
