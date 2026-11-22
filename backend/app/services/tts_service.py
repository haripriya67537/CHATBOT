import io
import base64
from gtts import gTTS

async def synthesize_speech(text: str) -> str:
    clean_text = text.replace("*", "").replace("#", "").strip()
    if not clean_text:
        clean_text = "I am listening."

    tts = gTTS(text=clean_text, lang="en", slow=False)
    audio_buffer = io.BytesIO()
    tts.write_to_fp(audio_buffer)
    audio_buffer.seek(0)
    
    return base64.b64encode(audio_buffer.read()).decode("utf-8")