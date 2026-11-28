import os
from openai import OpenAI
from app.config import settings
from typing import List, Dict

def get_client():
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
    if not api_key:
        api_key = "dummy_key_missing_env"
    return OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1"
    )

client = get_client()

SYSTEM_PROMPT = (
    "You are a helpful, conversational, and precise AI assistant. "
    "Keep spoken replies concise, clear, and direct. Avoid verbose formatting or special symbols."
)

MODEL_CANDIDATES = [
    os.getenv("MODEL_NAME", "llama-3.3-70b-versatile"),
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768"
]

async def generate_response(history: List[Dict[str, str]], user_message: str, persona: str = "default") -> str:
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
    if not api_key or api_key == "dummy_key_missing_env":
        return "Backend is running, but GROQ_API_KEY is not configured in the environment variables."

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    groq_client = OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1"
    )

    for model in MODEL_CANDIDATES:
        try:
            completion = groq_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=300
            )
            content = completion.choices[0].message.content
            if content and content.strip():
                return content.strip()
        except Exception as e:
            print(f"Error with model {model}: {e}")
            continue

    return "I am here and ready to help. What would you like to discuss?"
