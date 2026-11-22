import React, { useState } from "react";
import { useVoiceAssistant } from "./hooks/useVoiceAssistant";
import { ChatHistory } from "./components/ChatHistory";
import {
  Menu,
  Plus,
  MessageSquare,
  Trash2,
  Volume2,
  VolumeX,
  Mic,
  Square,
  ArrowUp,
  Loader2,
  Sparkles
} from "lucide-react";
import "./App.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputText, setInputText] = useState("");

  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    isRecording,
    isLoading,
    error,
    isVoiceEnabled,
    toggleVoice,
    createNewChat,
    deleteChat,
    startRecording,
    stopRecording,
    sendTextMessage,
  } = useVoiceAssistant();

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || isRecording) return;
    sendTextMessage(inputText);
    setInputText("");
  };

  return (
    <div className="gemini-layout">
      {/* Sidebar */}
      <aside className={`gemini-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-top">
          <button
            className="icon-btn-ghost"
            onClick={() => setSidebarOpen((prev) => !prev)}
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
          {sidebarOpen && (
            <button className="new-chat-btn" onClick={createNewChat}>
              <Plus size={18} />
              <span>New chat</span>
            </button>
          )}
        </div>

        {sidebarOpen && (
          <div className="sidebar-content">
            <div className="recent-label">Recent Chats</div>
            <div className="sessions-list">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`session-item ${s.id === activeSessionId ? "active" : ""}`}
                  onClick={() => setActiveSessionId(s.id)}
                >
                  <MessageSquare size={16} className="session-icon" />
                  <span className="session-title">{s.title || "New conversation"}</span>
                  <button
                    className="delete-session-btn"
                    onClick={(e) => deleteChat(s.id, e)}
                    title="Delete Chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main App Area */}
      <main className="gemini-main">
        {/* Top Header */}
        <header className="gemini-header">
          <div className="header-left">
            {!sidebarOpen && (
              <button
                className="icon-btn-ghost"
                onClick={() => setSidebarOpen(true)}
                title="Open Sidebar"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="brand-group">
              <span className="brand-text">Chatbot</span>
              <span className="model-pill">Llama 3.3 Fast</span>
            </div>
          </div>

          {/* Voice Response ON / OFF Toggle */}
          <button
            className={`voice-toggle-btn ${isVoiceEnabled ? "on" : "off"}`}
            onClick={toggleVoice}
            title={isVoiceEnabled ? "Voice Output is ON (Click to Mute)" : "Voice Output is MUTED (Click to Turn On)"}
          >
            {isVoiceEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            <span>{isVoiceEnabled ? "Voice: ON" : "Voice: OFF"}</span>
          </button>
        </header>

        {/* Error Banner */}
        {error && <div className="gemini-error">{error}</div>}

        {/* Chat Feed */}
        <ChatHistory
          messages={messages}
          onSelectPrompt={(prompt) => sendTextMessage(prompt)}
        />

        {/* Bottom Input Area */}
        <footer className="gemini-input-wrapper">
          <form className="gemini-input-pill" onSubmit={handleSend}>
            <input
              type="text"
              placeholder={
                isRecording
                  ? "Listening to your voice..."
                  : isLoading
                  ? "Thinking..."
                  : "Ask Chatbot or tap mic to speak..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading || isRecording}
            />

            <div className="pill-actions">
              {/* Mic Action */}
              {isRecording ? (
                <button
                  type="button"
                  className="action-circle-btn mic-active"
                  onClick={stopRecording}
                  title="Stop Recording"
                >
                  <Square size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  className="action-circle-btn"
                  onClick={startRecording}
                  disabled={isLoading}
                  title="Speak"
                >
                  <Mic size={20} />
                </button>
              )}

              {/* Text Send Button */}
              {isLoading ? (
                <div className="action-circle-btn">
                  <Loader2 className="animate-spin" size={20} color="#8e918f" />
                </div>
              ) : (
                inputText.trim() && (
                  <button
                    type="submit"
                    className="action-circle-btn send-ready"
                    title="Send message"
                  >
                    <ArrowUp size={20} />
                  </button>
                )
              )}
            </div>
          </form>
          <div className="gemini-footer-note">
            Chatbot can make mistakes. Verify important info.
          </div>
        </footer>
      </main>
    </div>
  );
}