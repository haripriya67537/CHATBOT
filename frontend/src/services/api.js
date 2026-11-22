const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/voice";

export async function sendQuery({ audioBlob, textQuery, history, persona, accent }) {
  const formData = new FormData();
  if (audioBlob) formData.append("file", audioBlob, "recording.wav");
  if (textQuery) formData.append("text_query", textQuery);
  formData.append("conversation_history", JSON.stringify(history));
  formData.append("persona", persona || "default");
  formData.append("accent", accent || "india");

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Server communication error.");
  }

  return await response.json();
}