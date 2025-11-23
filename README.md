# 🌙 Rise & Roast - AI & Voice Integration Backend 🤖

This is the Python FastAPI backend service for **Rise & Roast**, a passive-aggressive alarm clock that uses AI to roast you for snoozing. The backend handles AI-powered voice interactions, excuse analysis, roast generation, and multilingual support.

## ✨ Cool Features

### 🎙️ **Advanced Voice Generation**
- **ElevenLabs Integration**: Generates snarky voice messages with escalating intensity based on snooze count
- **Multilingual Voice Support**: Supports 29+ languages for voice messages (Spanish, French, German, Italian, Portuguese, Polish, Turkish, Russian, Dutch, Czech, Arabic, Chinese, Japanese, Hungarian, Korean, and more!)
- **Dynamic Voice Personality**: Voice gets angrier as you snooze more (8/10 angry across all levels)
- **Custom Voice Settings**: Adjustable stability, style, similarity boost, and speed parameters
- **Countdown Audio**: Specialized countdown audio for crush text and Twitter threats

### 🤖 **AI-Powered Roasts**
- **Google Gemini 2.0 Flash**: Analyzes excuses and generates witty, personalized roasts
- **Multilingual Roast Generation**: Roasts are translated to your selected language
- **Sentiment Analysis**: Analyzes spoken excuses to determine legitimacy and adjust roast intensity
- **Context-Aware Responses**: Roasts get meaner based on snooze count and excuse quality
- **Smart Excuse Detection**: Identifies common excuse patterns and calls them out

### 🌍 **Internationalization**
- **Google Cloud Translation API**: Full translation support for all UI text and messages
- **Dual Language System**: Separate voice language and text language settings
- **Localized Date/Time**: Dates and times formatted according to selected language
- **16+ Supported Languages**: English, Spanish, French, German, Italian, Portuguese, Polish, Turkish, Russian, Dutch, Czech, Arabic, Chinese, Japanese, Hungarian, Korean

### 📊 **Sleep Statistics**
- **Sleep Session Tracking**: Automatically tracks sleep duration and snooze counts
- **Circular Progress Indicators**: Beautiful visual stats showing:
  - Average hours slept
  - Good sleep days (8+ hours)
  - Current streak
  - Total sessions
  - Total snoozes
  - Average snoozes per session

### 🎯 **Escalation System**
- **Progressive Threats**: Multiple snoozes trigger escalating threats (Roasts → SMS → Social Media)
- **Countdown Warnings**: 5-second countdowns before sending crush texts or posting to Twitter
- **SMS Threats via Twilio**: Sends embarrassing texts to your crush with random emojis
- **Twitter/X Integration**: Posts embarrassing wake-up stats to your Twitter account
- **Smart Thresholds**: 
  - **3 snoozes**: Text your crush with romantic message + 8 random emojis
  - **5 snoozes**: Post embarrassing tweet to Twitter/X

### 🎨 **Additional Features**
- **Alarm History**: Save and reuse previous alarms (like Apple's alarm app)
- **Onboarding Flow**: Multi-step setup popup for first-time users
- **Image Generation Service**: Placeholder service for future image features
- **VAPI Integration**: Voice interaction flows for natural conversation (optional)

## Tech Stack

- **Python 3.9+**
- **FastAPI** - Modern, fast web framework for building APIs
- **ElevenLabs API** - Voice generation with multilingual support and custom voice parameters
- **Google Gemini 2.0 Flash** - Excuse analysis and roast generation
- **Google Cloud Translation API** - Text translation for UI and messages
- **VAPI** - Voice interaction flows (optional)
- **Uvicorn** - ASGI server
- **Twilio** - SMS/MMS integration (via social backend)

## Setup Instructions

### 1. Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- API keys for:
  - ElevenLabs
  - Google Gemini
  - Google Cloud Translation API
  - VAPI (optional)

### 2. Installation

```bash
# Clone the repository (or navigate to this directory)
cd hackwestern

# Create a virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example (if it exists) or create manually
cp .env.example .env
```

Add your API keys to the `.env` file:

```env
# ElevenLabs API Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# Google Cloud Translation API Configuration
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here

# VAPI Configuration (optional)
VAPI_API_KEY=your_vapi_api_key_here
VAPI_ASSISTANT_ID=your_vapi_assistant_id_here

# Backend API Configuration
BACKEND_URL=http://localhost:8000
PERSON3_BACKEND_URL=http://localhost:8787

# Server Configuration
PORT=8000
```

### 4. Getting API Keys

#### ElevenLabs
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Get your API key from the dashboard
3. Choose or create a voice ID for the snarky personality
4. Supports multilingual models (`eleven_multilingual_v2`) for non-English languages

#### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file
4. Uses `gemini-2.0-flash-exp` model for fast, accurate roasts

#### Google Cloud Translation API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Cloud Translation API
3. Create an API key
4. Add it to your `.env` file

#### VAPI (Optional)
1. Sign up at [VAPI](https://vapi.ai/)
2. Get your API key and assistant ID from the dashboard

### 5. Run the Server

```bash
# Make sure you're in the virtual environment
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### 6. API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /health` - Service health check (returns status of all services)

### Alarm & Voice
- `POST /alarm/trigger` - Generate snarky voice message when alarm triggers
  ```json
  {
    "snooze_count": 0,
    "user_id": "optional_user_id",
    "user_name": "optional_name",
    "language": "en"
  }
  ```
  Returns: Base64-encoded audio data

- `GET /audio/{filename}` - Serve generated audio files

### Excuse Analysis & Roasts
- `POST /snooze` - Handle snooze event (combines analysis and alarm generation)
  ```json
  {
    "excuse": "Just one more minute",
    "snooze_count": 5,
    "user_id": "optional_user_id",
    "transcribed_audio": "optional_transcription",
    "language": "en"
  }
  ```
  Returns: Roast text and audio data

- `POST /excuse/analyze` - Analyze excuse and generate roast
  ```json
  {
    "excuse": "I need 5 more minutes",
    "snooze_count": 3,
    "transcribed_audio": "optional_transcription"
  }
  ```

- `POST /excuse/sentiment` - Analyze sentiment from spoken excuse
  ```json
  {
    "excuse": "I'm too tired",
    "snooze_count": 2,
    "transcribed_audio": "optional_transcription"
  }
  ```

### Countdown Audio
- `POST /countdown/audio` - Generate countdown audio for threats
  ```json
  {
    "text": "5" or "I'm going to text your crush in 5 seconds",
    "language": "en"
  }
  ```
  Returns: Base64-encoded audio for countdown sequences

### Image Generation
- `GET /image/farm-animal` - Get farm animal image URL (placeholder service)
  Returns: Image URL for use in SMS/MMS messages

### Social Media
- `POST /social-media/threat` - Generate social media threat message
  ```json
  {
    "snooze_count": 7,
    "user_id": "optional_user_id"
  }
  ```

### VAPI Integration
- `POST /vapi/call` - Create a VAPI phone call
- `GET /vapi/call/{call_id}` - Get VAPI call status

## Snooze Levels & Voice Settings

The system uses different levels based on snooze count, all with **8/10 angry** voice settings:

- **Mild** (1-2 snoozes): Playful but firm messages
  - Stability: 0.2, Style: 0.9, Similarity Boost: 0.9
- **Moderate** (3-4 snoozes): More pointed and sarcastic
  - Stability: 0.2, Style: 0.9, Similarity Boost: 0.9
- **Aggressive** (5-6 snoozes): Harsh and direct calls to action
  - Stability: 0.2, Style: 0.9, Similarity Boost: 0.9
- **Nuclear** (7+ snoozes): Brutal roasts with social media threats
  - Stability: 0.2, Style: 0.9, Similarity Boost: 0.9

**First Alarm Message**: Slower speed (0.85) for better clarity and understanding.

## Multilingual Support

### Voice Languages
The backend supports 29+ languages for voice generation:
- English, Spanish, French, German, Italian, Portuguese
- Polish, Turkish, Russian, Dutch, Czech
- Arabic, Chinese, Japanese, Hungarian, Korean
- And more via ElevenLabs multilingual model

### Text Languages
UI text and messages can be translated to:
- English, Spanish, French, German, Italian, Portuguese

### How It Works
1. User selects voice language in settings
2. Alarm messages and roasts are translated using Google Cloud Translation API
3. ElevenLabs generates voice in the selected language using multilingual model
4. Countdown messages are also translated and spoken in the selected language

## Integration Points

### Frontend
Call these endpoints to:
- Trigger alarms: `POST /alarm/trigger` (with language parameter)
- Handle snooze events: `POST /snooze` (with language parameter)
- Generate countdown audio: `POST /countdown/audio`
- Get audio files: `GET /audio/{filename}`

### Social Media Backend (Cloudflare Worker)
Automatically notifies the social backend when thresholds are reached:
- Snooze 3: Triggers crush text countdown
- Snooze 5: Triggers Twitter post countdown
- Endpoint: `POST {SOCIAL_BACKEND_URL}/snooze/event`
- Payload includes: `snooze_count`, `user_id`, `wake_up_time`, `language`

## Workflow

```
Alarm triggers → ElevenLabs generates snarky voice message (in selected language)
       ↓
User hits snooze → Gemini API analyzes excuse + generates roast (translated)
       ↓
Multiple snoozes → Countdown warnings appear (with translated audio)
       ↓
3 snoozes → Text crush with romantic message + 8 random emojis
       ↓
5 snoozes → Post embarrassing tweet to Twitter/X
       ↓
Sleep session ends → Stats saved for sleep tracking
```

## File Structure

```
hackwestern/
├── main.py                 # FastAPI application and endpoints
├── config.py               # Configuration management
├── prompts.py              # Prompt engineering for snooze levels
├── elevenlabs_service.py   # ElevenLabs voice generation (multilingual)
├── gemini_service.py       # Gemini API integration (roast generation)
├── translation_service.py  # Google Cloud Translation API integration
├── sentiment_analysis.py   # Voice sentiment analysis
├── vapi_service.py         # VAPI/Genesys integration
├── image_generation_service.py # Image URL generation service
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (create this)
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── audio_output/          # Generated audio files (created at runtime)
└── temp/                  # Temporary files (created at runtime)
```

## Development

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Debugging

Enable debug mode:
```bash
uvicorn main:app --reload --log-level debug
```

Check logs for translation and language debugging:
- `[DEBUG Translation]` - Translation service logs
- `[DEBUG ElevenLabs]` - Voice generation logs
- `[DEBUG Countdown]` - Countdown audio logs

## Troubleshooting

### Common Issues

1. **API Key Errors**: Make sure all API keys are set in `.env` file
   - ElevenLabs API key
   - Gemini API key
   - Google Translate API key

2. **Port Already in Use**: Change `PORT` in `.env` or kill the process using port 8000

3. **Audio Files Not Saving**: Check that `audio_output/` directory has write permissions

4. **Gemini API Errors**: Ensure your API key is valid and has quota remaining
   - Model: `gemini-2.0-flash-exp`

5. **Translation Not Working**: 
   - Verify Google Cloud Translation API is enabled
   - Check that `GOOGLE_TRANSLATE_API_KEY` is set correctly
   - Fallback to Gemini key if Translation API key not available

6. **Language Not Changing**:
   - Check that language parameter is being passed from frontend
   - Verify ElevenLabs multilingual model is being used for non-English
   - Check backend logs for translation debug messages

7. **Voice Not Angry Enough**:
   - Voice settings are set to 8/10 angry (stability: 0.2, style: 0.9)
   - All snooze levels use the same angry settings for consistency

## Contributing

This is a hackathon project. For questions or issues, contact:
- **Backend Team**: paridhi and glo (AI & Voice Integration)

## License

MIT License - Hackathon Project
