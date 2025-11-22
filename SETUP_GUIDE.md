# Setup Guide - Next Steps 🚀

Follow these steps to get your Passive-Aggressive Alarm Clock running!

## Prerequisites

- Python 3.8+ (for Person 2 backend)
- Node.js 18+ (for Person 1 frontend and Person 4 backend)
- npm or yarn
- Git (already have this)

---

## Step 1: Set Up Person 2 Backend (AI & Voice) 🎤

### 1.1 Install Python Dependencies

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 1.2 Configure Environment Variables

```bash
# Copy template
cp env_template.txt .env

# Edit .env file with your API keys
```

**Required API Keys:**
- `ELEVENLABS_API_KEY` - Get from [ElevenLabs Dashboard](https://elevenlabs.io/)
- `ELEVENLABS_VOICE_ID` - Choose a voice ID from ElevenLabs
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

**Optional:**
- `VAPI_API_KEY` - For voice interaction (optional)
- `PERSON4_BACKEND_URL` - Defaults to `http://localhost:8787` (usually fine)

### 1.3 Test Person 2 Backend

```bash
# Start the server
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000/docs` to see the API documentation.

✅ **Checkpoint:** Person 2 backend should be running on port 8000

---

## Step 2: Set Up Person 4 Backend (Social Media) 🐦

### 2.1 Install Node.js Dependencies

```bash
cd backend-social
npm install
```

### 2.2 No Database Setup Required! 🎉

**For Hackathon Demo:**
- ✅ Zero configuration needed!
- ✅ Uses in-memory storage (data resets on restart - perfect for demos)
- ✅ No external dependencies

**Optional: Persistent Storage (Workers KV)**
If you want data to persist across restarts:

```bash
# Create Workers KV namespace (one-time)
wrangler kv:namespace create "DB_KV"

# This outputs a namespace ID. Copy it, then edit wrangler.toml:
# [vars]
# DB_KV = "your_namespace_id_here"
```

### 2.3 Configure Cloudflare Workers Secrets (Optional)

```bash
# Make sure you're in backend-social directory
cd backend-social

# Optional: Set up persistent storage (see step 2.2 above)
# Otherwise, skip this - in-memory storage works fine for demos!

# Set Twitter/X API credentials (optional - uses mock responses if not set)
wrangler secret put TWITTER_API_KEY
wrangler secret put TWITTER_API_SECRET
wrangler secret put TWITTER_ACCESS_TOKEN
wrangler secret put TWITTER_ACCESS_TOKEN_SECRET
wrangler secret put TWITTER_BEARER_TOKEN

# Set Twilio credentials (optional)
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put TWILIO_PHONE_NUMBER

# Optional: OpenRouter for fallback AI
wrangler secret put OPENROUTER_API_KEY
```

**Note:** If you don't set Twitter/Twilio secrets, the system will use mock responses (good for testing).

### 2.4 Start Person 4 Backend

```bash
# Development mode (with hot reload)
npm run dev

# Or deploy to Cloudflare Workers
npm run deploy
```

✅ **Checkpoint:** Person 4 backend should be running on port 8787 (dev mode)

---

## Step 3: Set Up Person 1 Frontend (UI) 🎨

### 3.1 Install Dependencies

```bash
cd frontend
npm install  # Already done! ✅
```

### 3.2 Configure Environment Variables

Create a `.env.local` file:

```bash
cd frontend
touch .env.local
```

Add these variables:

```bash
# Backend API URLs
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_SOCIAL_BACKEND_URL=http://localhost:8787
```

### 3.3 Start Frontend

```bash
npm run dev
```

Visit `http://localhost:3000` to see the frontend.

✅ **Checkpoint:** Frontend should be running on port 3000

---

## Step 4: Test the Complete Flow 🧪

### 4.1 Start All Services

Open **3 terminal windows**:

**Terminal 1 - Person 2 Backend:**
```bash
cd /Users/parimehla/Desktop/Hack\ Western/hackwestern
source venv/bin/activate
python main.py
```

**Terminal 2 - Person 4 Backend:**
```bash
cd /Users/parimehla/Desktop/Hack\ Western/hackwestern/backend-social
npm run dev
```

**Terminal 3 - Person 1 Frontend:**
```bash
cd /Users/parimehla/Desktop/Hack\ Western/hackwestern/frontend
npm run dev
```

### 4.2 Test the Flow

1. **Open browser:** `http://localhost:3000`
2. **Set an alarm** for 1-2 minutes in the future
3. **Wait for alarm** to trigger
4. **Verify ElevenLabs audio** plays
5. **Click SNOOZE** and enter an excuse
6. **Verify Gemini roast** displays
7. **Snooze 3+ times** to trigger social media threats
8. **Check Person 4 backend logs** to see escalations

### 4.3 Verify Integration Points

- ✅ Frontend → Person 2: Alarm trigger works
- ✅ Frontend → Person 2: Snooze with excuse works
- ✅ Frontend → Person 4: Snooze events recorded (check at 3+ snoozes)
- ✅ Person 2 → Person 4: Snooze data passed correctly
- ✅ Person 4 → Person 2: Roast intensity coordination

---

## Step 5: Get API Keys (If Not Done) 🔑

### ElevenLabs (Required)
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Go to Profile → API Keys
3. Copy your API key
4. Choose a voice ID from the Voice Library

### Google Gemini (Required)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### Supabase (Required for Person 4)
1. Create account at [Supabase](https://supabase.com/)
2. Create new project
3. Go to Settings → API
4. Copy `URL` and `anon public` key

### Twitter/X API (Optional)
1. Apply for Twitter Developer account
2. Create a new app
3. Get API keys and tokens

### Twilio (Optional)
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get Account SID and Auth Token
3. Get a phone number

---

## Troubleshooting 🔧

### Person 2 Backend Issues

**Port 8000 already in use?**
```bash
# Change PORT in .env file
PORT=8001
```

**API key errors?**
- Verify keys are correct in `.env` file
- Check that keys have quota remaining

**Audio not generating?**
```bash
# Create audio output directory
mkdir audio_output
```

### Person 4 Backend Issues

**Supabase connection errors?**
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Check that database schema was applied
- Ensure network connectivity

**Twitter API not working?**
- Verify all Twitter credentials are set
- Check API permissions
- System will use mock responses if not configured (OK for testing)

### Frontend Issues

**Can't connect to backends?**
- Verify both Person 2 and Person 4 backends are running
- Check `.env.local` has correct URLs
- Check browser console for CORS errors

**Audio not playing?**
- Verify Person 2 backend is serving audio files
- Check browser console for errors
- Try opening audio URL directly in browser

---

## Quick Start (TL;DR) ⚡

```bash
# 1. Person 2 Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp env_template.txt .env
# Edit .env with API keys
python main.py

# 2. Person 4 Backend (new terminal)
cd backend-social
npm install
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
npm run dev

# 3. Frontend (new terminal)
cd frontend
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_SOCIAL_BACKEND_URL=http://localhost:8787" >> .env.local
npm run dev

# 4. Open browser
open http://localhost:3000
```

---

## Next Steps After Setup 🎯

1. **Customize prompts** - Edit `prompts.py` to change roast messages
2. **Adjust thresholds** - Modify escalation thresholds in `backend-social/src/escalation.js`
3. **Style the frontend** - Customize colors/themes in Tailwind config
4. **Deploy to production** - Deploy Person 4 to Cloudflare Workers, Person 2 to a cloud service, Frontend to Vercel
5. **Add more features** - Voice input, calendar integration, etc.

---

## Need Help? 🤔

- Check `FLOW_VERIFICATION.md` for integration details
- Review `README.md` files in each directory
- Check API docs at `http://localhost:8000/docs`

Good luck! 🚀

