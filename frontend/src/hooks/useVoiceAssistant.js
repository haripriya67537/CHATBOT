import { useState, useEffect, useRef } from "react";
import { sendQuery } from "../services/api";

const SESSIONS_STORAGE_KEY = "voicegpt_sessions_v1";
const ACTIVE_SESSION_KEY = "voicegpt_active_session_id";
const VOICE_TOGGLE_KEY = "voicegpt_voice_enabled";

export function useVoiceAssistant() {
  // Load Voice Output Mute/Unmute state
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    const saved = localStorage.getItem(VOICE_TOGGLE_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Load All Sessions
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const initialId = Date.now().toString();
    return [{ id: initialId, title: "New conversation", messages: [] }];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem(ACTIVE_SESSION_KEY) || sessions[0]?.id || Date.now().toString();
  });

  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioInputRef = useRef(null);
  const recorderNodeRef = useRef(null);
  const leftChannelRef = useRef([]);

  // Persist sessions and active session
  useEffect(() => {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem(VOICE_TOGGLE_KEY, JSON.stringify(isVoiceEnabled));
  }, [isVoiceEnabled]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newSession = { id: newId, title: "New conversation", messages: [] };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setError(null);
  };

  const deleteChat = (sessionId, e) => {
    e?.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const freshId = Date.now().toString();
        const fresh = [{ id: freshId, title: "New conversation", messages: [] }];
        setActiveSessionId(freshId);
        return fresh;
      }
      if (sessionId === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const toggleVoice = () => {
    setIsVoiceEnabled((prev) => !prev);
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      audioInputRef.current = source;

      const recorder = audioCtx.createScriptProcessor(4096, 1, 1);
      recorderNodeRef.current = recorder;
      leftChannelRef.current = [];

      recorder.onaudioprocess = (e) => {
        const left = e.inputBuffer.getChannelData(0);
        leftChannelRef.current.push(new Float32Array(left));
      };

      source.connect(recorder);
      recorder.connect(audioCtx.destination);
      setIsRecording(true);
    } catch {
      setError("Microphone permission denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);

    if (recorderNodeRef.current && audioInputRef.current) {
      audioInputRef.current.disconnect();
      recorderNodeRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    const audioCtx = audioContextRef.current;
    if (audioCtx) {
      const merged = flattenBuffer(leftChannelRef.current);
      const wavBlob = encodeWAV(merged, audioCtx.sampleRate);
      audioCtx.close();
      handleQuery({ audioBlob: wavBlob });
    }
  };

  const sendTextMessage = (text) => {
    if (!text || !text.trim()) return;
    handleQuery({ textQuery: text.trim() });
  };

  const handleQuery = async ({ audioBlob, textQuery }) => {
    setIsLoading(true);
    setError(null);
    try {
      const historyContext = messages.map((m) => ({ role: m.role, content: m.text }));
      const data = await sendQuery({
        audioBlob,
        textQuery,
        history: historyContext,
      });

      const userText = data.user_transcript;
      const aiReply = data.assistant_reply;
      const audioData = data.audio_base64;

      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === activeSessionId) {
            const updatedTitle =
              session.messages.length === 0
                ? userText.slice(0, 28) + (userText.length > 28 ? "..." : "")
                : session.title;

            return {
              ...session,
              title: updatedTitle,
              messages: [
                ...session.messages,
                { role: "user", text: userText },
                { role: "assistant", text: aiReply, audio: audioData },
              ],
            };
          }
          return session;
        })
      );

      // Play audio only if voice output is turned ON
      if (isVoiceEnabled && audioData) {
        const audio = new Audio(audioData);
        audio.play().catch((e) => console.log("Audio play error:", e));
      }
    } catch (err) {
      setError(err.message || "Failed to process request.");
    } finally {
      setIsLoading(false);
    }
  };

  const flattenBuffer = (buffers) => {
    let len = buffers.reduce((acc, b) => acc + b.length, 0);
    let res = new Float32Array(len);
    let offset = 0;
    for (let b of buffers) {
      res.set(b, offset);
      offset += b.length;
    }
    return res;
  };

  const encodeWAV = (samples, sampleRate) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Blob([view], { type: "audio/wav" });
  };

  return {
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
  };
}