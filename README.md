# Passive-Aggressive Alarm Clock - AI & Voice Integration Backend 🤖

This is Person 2/3's backend service for the Passive-Aggressive Alarm Clock project, handling AI-powered voice interactions, excuse analysis, and roast generation.

## Features

- 🎙️ **ElevenLabs Voice Generation**: Generates snarky voice messages with escalating intensity based on snooze count
- 🤖 **Gemini API Integration**: Analyzes excuses and generates witty roasts
- 🎯 **VAPI Integration**: Voice interaction flows for natural conversation
- 💬 **Voice Sentiment Analysis**: Analyzes spoken excuses to determine legitimacy
- 📈 **Snooze Level System**: Prompt engineering for different snooze levels (mild → nuclear)
- 🔗 **API Integration**: Endpoints for frontend and Person 3's backend

## Tech Stack

- **Python 3.9+**
- **FastAPI** - Modern, fast web framework for building APIs
- **ElevenLabs SDK** - Voice generation with snarky personality
- **Google Gemini API** - Excuse analysis and roast generation
- **VAPI** - Voice interaction flows
- **Uvicorn** - ASGI server

## Setup Instructions

### 1. Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- API keys for:
  - ElevenLabs
  - Google Gemini
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

# VAPI Configuration (optional)
VAPI_API_KEY=your_vapi_api_key_here
VAPI_ASSISTANT_ID=your_vapi_assistant_id_here

# Backend API Configuration
BACKEND_URL=http://localhost:8000
PERSON3_BACKEND_URL=http://localhost:8001

# Server Configuration
PORT=8000
```

### 4. Getting API Keys

#### ElevenLabs
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Get your API key from the dashboard
3. Choose or create a voice ID for the snarky personality

#### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

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
- `GET /health` - Service health check

### Alarm & Voice
- `POST /alarm/trigger` - Generate snarky voice message when alarm triggers
  ```json
  {
    "snooze_count": 0,
    "user_id": "optional_user_id"
  }
  ```

- `GET /audio/{filename}` - Serve generated audio files

### Excuse Analysis
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

### Snooze Handling
- `POST /snooze` - Handle snooze event (combines analysis and alarm generation)
  ```json
  {
    "excuse": "Just one more minute",
    "snooze_count": 5,
    "user_id": "optional_user_id",
    "transcribed_audio": "optional_transcription"
  }
  ```

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

## Snooze Levels

The system uses different levels based on snooze count:

- **Mild** (1-2 snoozes): Playful and supportive messages
- **Moderate** (3-4 snoozes): More pointed and sarcastic
- **Aggressive** (5-6 snoozes): Harsh and direct calls to action
- **Nuclear** (7+ snoozes): Brutal roasts with social media threats

## Integration Points

### Frontend (Person 1)
Call these endpoints to:
- Trigger alarms: `POST /alarm/trigger`
- Handle snooze events: `POST /snooze`
- Get audio files: `GET /audio/{filename}`

### Person 3's Backend (Social Media)
Automatically notifies Person 3's backend when snooze count >= 5:
- Endpoint: `POST {PERSON3_BACKEND_URL}/snooze/count`
- Payload includes: `snooze_count`, `user_id`, `wake_up_time`

## Workflow

```
Alarm triggers → ElevenLabs generates snarky voice message
       ↓
User hits snooze → Gemini API analyzes excuse + generates roast
       ↓
Multiple snoozes → Cloudflare Worker triggers social media threat
       ↓
Final snooze → Actually posts embarrassing wake-up stats
```

## File Structure

```
hackwestern/
├── main.py                 # FastAPI application and endpoints
├── config.py               # Configuration management
├── prompts.py              # Prompt engineering for snooze levels
├── elevenlabs_service.py   # ElevenLabs voice generation
├── gemini_service.py       # Gemini API integration
├── sentiment_analysis.py   # Voice sentiment analysis
├── vapi_service.py         # VAPI/Genesys integration
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

## Troubleshooting

### Common Issues

1. **API Key Errors**: Make sure all API keys are set in `.env` file
2. **Port Already in Use**: Change `PORT` in `.env` or kill the process using port 8000
3. **Audio Files Not Saving**: Check that `audio_output/` directory has write permissions
4. **Gemini API Errors**: Ensure your API key is valid and has quota remaining

## Contributing

This is a hackathon project. For questions or issues, contact:
- **Person 2/3**: paridhi and glo (AI & Voice Integration)

## License

MIT License - Hackathon Project

