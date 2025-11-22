"""Simple script to run the server with proper setup."""
import os
import uvicorn
from config import Config

def create_directories():
    """Create necessary directories if they don't exist."""
    os.makedirs(Config.AUDIO_OUTPUT_DIR, exist_ok=True)
    os.makedirs(Config.TEMP_DIR, exist_ok=True)
    print(f"✓ Created directories: {Config.AUDIO_OUTPUT_DIR}, {Config.TEMP_DIR}")

def check_environment():
    """Check if required environment variables are set."""
    warnings = []
    
    if not Config.ELEVENLABS_API_KEY:
        warnings.append("⚠ ELEVENLABS_API_KEY not set")
    if not Config.GEMINI_API_KEY:
        warnings.append("⚠ GEMINI_API_KEY not set")
    if not Config.VAPI_API_KEY:
        warnings.append("⚠ VAPI_API_KEY not set (optional)")
    
    if warnings:
        print("\n".join(warnings))
        print("\nSome API keys are missing. Check your .env file.")
    else:
        print("✓ All required API keys are set")

if __name__ == "__main__":
    print("Starting Passive-Aggressive Alarm Clock - AI & Voice Integration Backend...")
    print("-" * 70)
    
    create_directories()
    check_environment()
    
    print("-" * 70)
    print(f"Starting server on http://0.0.0.0:{Config.PORT}")
    print(f"API Documentation: http://localhost:{Config.PORT}/docs")
    print("-" * 70)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=Config.PORT,
        reload=True,
        log_level="info"
    )

