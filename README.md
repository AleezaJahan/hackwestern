# Passive-Aggressive Alarm Clock - Backend

AI-powered alarm clock backend with VAPI and ElevenLabs integration.

## 🚀 One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AleezaJahan/hackwestern)

Click the button above to deploy instantly!

## Manual Deploy

If the button doesn't work:

1. Go to https://render.com
2. New Web Service → Connect GitHub
3. Select: `AleezaJahan/hackwestern`
4. Branch: `aleeza`
5. Build: `pip install -r requirements.txt`
6. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Deploy!

## Features

- Alarm triggering with voice generation
- Excuse analysis using Gemini AI
- ElevenLabs voice synthesis
- VAPI integration
- FastAPI backend

## Environment Variables (Optional)

Add these in Render dashboard for full features:
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`
- `GEMINI_API_KEY`
- `VAPI_API_KEY`
- `VAPI_ASSISTANT_ID`
