"""Configuration management for the AI & Voice Integration backend."""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration."""
    
    # ElevenLabs Configuration
    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
    ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default: Rachel
    ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1"
    
    # Voice IDs - Voice Selection Strategy
    VOICE_GENTLE = os.getenv("VOICE_GENTLE", "21m00Tcm4TlvDq8ikWAM")  # Rachel - natural, expressive
    VOICE_SARCASTIC = os.getenv("VOICE_SARCASTIC", "EXAVITQu4vr4xnSDxMaL")  # Bella - friendly female
    VOICE_AGGRESSIVE = os.getenv("VOICE_AGGRESSIVE", "pNInz6obpgDQGcFmaJgB")  # Antoni - confident male
    VOICE_DRILL_SERGEANT = os.getenv("VOICE_DRILL_SERGEANT", "pNInz6obpgDQGcFmaJgB")  # For nuclear
    
    # Google Gemini Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")  # Using latest flash model
    
    # Google Cloud Translation API Configuration
    GOOGLE_TRANSLATE_API_KEY = os.getenv("GOOGLE_TRANSLATE_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")  # Can use same key
    
    # VAPI Configuration
    VAPI_API_KEY = os.getenv("VAPI_API_KEY", "")
    VAPI_API_URL = "https://api.vapi.ai"
    VAPI_ASSISTANT_ID = os.getenv("VAPI_ASSISTANT_ID", "")
    
    # Backend URLs
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
    # Support both PERSON4_BACKEND_URL (new) and PERSON3_BACKEND_URL (old) for backward compatibility
    PERSON4_BACKEND_URL = os.getenv("PERSON4_BACKEND_URL") or os.getenv("PERSON3_BACKEND_URL") or "http://localhost:8787"  # Person 4: Social Media Backend (Cloudflare Workers)
    
    # Server Configuration
    PORT = int(os.getenv("PORT", 8000))
    
    # Audio Configuration
    AUDIO_OUTPUT_DIR = "audio_output"
    TEMP_DIR = "temp"

