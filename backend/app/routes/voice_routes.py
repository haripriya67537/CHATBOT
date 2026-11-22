import json
import traceback
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.stt_service import transcribe_audio
from app.services.llm_service import generate_response
from app.services.tts_service import synthesize_speech

router = APIRouter(prefix="/api/voice", tags=["Voice"])

@router.post("/chat")
async def voice_chat(
    file: UploadFile = File(None),
    text_query: str = Form(None),
    conversation_history: str = Form("[]"),
    persona: str = Form("default")
):
    try:
        history = json.loads(conversation_history)

        # 1. Capture Voice or Text Input
        if file is not None:
            audio_data = await file.read()
            user_text = await transcribe_audio(audio_data, file.filename or "input.wav")
        elif text_query and text_query.strip():
            user_text = text_query.strip()
        else:
            raise HTTPException(status_code=400, detail="No audio file or text input provided.")

        if not user_text:
            raise HTTPException(status_code=400, detail="Could not capture speech. Please try again.")

        # 2. Get AI Response
        ai_reply = await generate_response(history, user_text, persona=persona)

        # 3. Generate Audio
        audio_base64 = await synthesize_speech(ai_reply)

        return {
            "user_transcript": user_text,
            "assistant_reply": ai_reply,
            "audio_base64": f"data:audio/mp3;base64,{audio_base64}"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))