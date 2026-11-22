import React from "react";
import { Mic, Square, Loader2 } from "lucide-react";

export function AudioRecorder({ isRecording, isLoading, onStart, onStop }) {
  return (
    <div className="recorder-container">
      {isLoading ? (
        <button className="record-btn loading" disabled>
          <Loader2 className="animate-spin" size={28} />
          <span>Thinking...</span>
        </button>
      ) : isRecording ? (
        <button className="record-btn stop" onClick={onStop}>
          <Square size={28} />
          <span>Stop & Send</span>
        </button>
      ) : (
        <button className="record-btn start" onClick={onStart}>
          <Mic size={28} />
          <span>Tap to Speak</span>
        </button>
      )}
    </div>
  );
}