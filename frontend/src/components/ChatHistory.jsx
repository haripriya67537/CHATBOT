import React, { useEffect, useRef } from "react";
import { Sparkles, User, Volume2 } from "lucide-react";

export function ChatHistory({ messages, onSelectPrompt }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const replayAudio = (audioBase64) => {
    if (audioBase64) {
      const audio = new Audio(audioBase64);
      audio.play();
    }
  };

  if (messages.length === 0) {
    return (
      <div className="gemini-feed">
        <div className="gemini-hero">
          <h1 className="hero-greet">Hello there</h1>
          <h2 className="hero-sub">How can I help you today?</h2>

          <div className="suggestion-chips">
            <div
              className="suggestion-card"
              onClick={() => onSelectPrompt("Explain Quantum Computing in simple terms")}
            >
              ⚛️ Explain Quantum Computing in simple terms
            </div>
            <div
              className="suggestion-card"
              onClick={() => onSelectPrompt("What are the key concepts of Machine Learning?")}
            >
              🧠 Machine Learning Core Concepts
            </div>
            <div
              className="suggestion-card"
              onClick={() => onSelectPrompt("Give me 3 productivity tips for developers")}
            >
              ⚡ 3 Productivity tips for developers
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gemini-feed">
      {messages.map((msg, index) => (
        <div key={index} className={`chat-row ${msg.role}`}>
          <div className={`avatar-icon ${msg.role === "user" ? "user" : "gemini"}`}>
            {msg.role === "user" ? <User size={18} /> : <Sparkles size={18} />}
          </div>
          <div>
            <div className="chat-bubble">{msg.text}</div>
            {msg.role === "assistant" && msg.audio && (
              <button
                className="replay-audio-btn"
                onClick={() => replayAudio(msg.audio)}
              >
                <Volume2 size={15} /> Listen again
              </button>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}