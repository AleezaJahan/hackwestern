# Quick Start Guide 🚀

Get your AI & Voice Integration backend running in 5 minutes!

## Step 1: Install Dependencies

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory (copy from `env_template.txt`):

```bash
cp env_template.txt .env
```

Edit `.env` and add your API keys:
- **ELEVENLABS_API_KEY**: Get from [ElevenLabs Dashboard](https://elevenlabs.io/)
- **ELEVENLABS_VOICE_ID**: Choose a voice ID from ElevenLabs
- **GEMINI_API_KEY**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 3: Run the Server

```bash
python run.py
```

Or directly:
```bash
python main.py
```

## Step 4: Test the API

Open your browser and visit:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

Or run the example script:
```bash
python example_usage.py
```

## Key Endpoints for Frontend Integration

1. **Trigger Alarm**: `POST /alarm/trigger`
   ```json
   {
     "snooze_count": 0,
     "user_id": "user123"
   }
   ```

2. **Handle Snooze**: `POST /snooze`
   ```json
   {
     "excuse": "Just 5 more minutes",
     "snooze_count": 3,
     "user_id": "user123"
   }
   ```

3. **Get Audio**: `GET /audio/{filename}`

## Integration with Person 3's Backend

When `snooze_count >= 5`, the backend automatically notifies Person 3's backend at:
```
POST {PERSON3_BACKEND_URL}/snooze/count
```

## Common Issues

**Port already in use?**
- Change `PORT=8000` in `.env` to a different port

**API Key errors?**
- Make sure all keys are in `.env` file (not `.env.example`)
- Check that keys are valid and have quota

**Audio files not generating?**
- Check that `audio_output/` directory exists and is writable
- Verify ElevenLabs API key is correct

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out `example_usage.py` for API examples
- Visit `/docs` endpoint for interactive API documentation

