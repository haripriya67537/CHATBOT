import os
from openai import OpenAI
from app.config import settings
from typing import List, Dict

SYSTEM_PROMPT = (
    "You are a helpful, conversational, and precise AI assistant. "
    "Keep spoken replies concise, clear, and direct. Avoid verbose formatting or special symbols."
)

# Models that are active on your Groq key
GROQ_MODELS = [
    os.getenv("MODEL_NAME", "openai/gpt-oss-120b"),
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b"
]

async def generate_response(history: List[Dict[str, str]], user_message: str, persona: str = "default") -> str:
    groq_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
    xai_key = settings.XAI_API_KEY or os.getenv("XAI_API_KEY", "")

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    # Try Groq first if available
    if groq_key and groq_key.startswith("gsk_"):
        groq_client = OpenAI(
            api_key=groq_key,
            base_url="https://api.groq.com/openai/v1"
        )
        for model in GROQ_MODELS:
            try:
                completion = groq_client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=350
                )
                content = completion.choices[0].message.content
                if content and content.strip():
                    return content.strip()
            except Exception as e:
                print(f"Error with Groq model {model}: {e}")
                continue

    # Try xAI Grok as secondary/fallback if provided
    if xai_key and xai_key.startswith("xai-"):
        try:
            xai_client = OpenAI(
                api_key=xai_key,
                base_url="https://api.x.ai/v1"
            )
            completion = xai_client.chat.completions.create(
                model=os.getenv("XAI_MODEL", "grok-2-latest"),
                messages=messages,
                temperature=0.7,
                max_tokens=350
            )
            content = completion.choices[0].message.content
            if content and content.strip():
                return content.strip()
        except Exception as e:
            print(f"Error calling xAI Grok: {e}")

    return "I am here and ready to help. What would you like to discuss?"
