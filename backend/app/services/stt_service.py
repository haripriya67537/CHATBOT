import io
import speech_recognition as sr

async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.wav") -> str:
    audio_io = io.BytesIO(audio_bytes)
    recognizer = sr.Recognizer()
    recognizer.energy_threshold = 300
    recognizer.dynamic_energy_threshold = True

    try:
        with sr.AudioFile(audio_io) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.2)
            audio_data = recognizer.record(source)
            return recognizer.recognize_google(audio_data)
    except sr.UnknownValueError:
        return ""
    except Exception as e:
        print(f"STT Error: {e}")
        return ""