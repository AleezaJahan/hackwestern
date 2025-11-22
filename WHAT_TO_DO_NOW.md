# ✅ What to Do Now - Step by Step Guide

## Quick Answer: **YES, everything should work correctly!** 🎉

Your code is ready. You just need to:
1. Set up your API keys (`.env` file)
2. Install dependencies (if needed)
3. Start the servers

---

## 🎯 Step-by-Step Instructions

### Step 1: Create `.env` File with Your API Keys

**You need to create a `.env` file with your API keys.**

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"

# Copy the template
cp env_template.txt .env

# Edit the .env file with your API keys
# Use nano, vim, or your favorite text editor
nano .env
```

**What to add to `.env`:**

```bash
# REQUIRED - Get these from:
ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key_here
GEMINI_API_KEY=your_actual_gemini_api_key_here

# OPTIONAL - These have defaults (you can leave them):
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Rachel voice (default)
VOICE_GENTLE=21m00Tcm4TlvDq8ikWAM
VOICE_SARCASTIC=EXAVITQu4vr4xnSDxMaL
VOICE_AGGRESSIVE=pNInz6obpgDQGcFmaJgB
```

**Where to get API keys:**
- **ElevenLabs**: https://elevenlabs.io/ → Dashboard → API Keys
- **Gemini**: https://makersuite.google.com/app/apikey → Create API Key

---

### Step 2: Install Python Dependencies (if needed)

```bash
# Make sure you're in the project directory
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"

# Activate virtual environment
source venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements.txt
```

**Expected output:** Packages installing...

---

### Step 3: Test Person 2 Backend (AI & Voice)

**Open Terminal 1:**

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
source venv/bin/activate
python main.py
```

**What you should see:**
```
✓ Created directories: audio_output, temp
✓ All required API keys are set
Starting server on http://0.0.0.0:8000
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**✅ Test it:** Open `http://localhost:8000/docs` in your browser
- You should see API documentation!
- Click on `/health` endpoint → "Try it out" → "Execute"
- Should return `{"status":"ok"}`

**If you see errors about missing API keys:**
- Check that `.env` file exists and has your keys
- Make sure keys are valid (no spaces, no quotes)

---

### Step 4: Test the APIs Work

**While Person 2 backend is running, test in a new terminal:**

```bash
# Test health check
curl http://localhost:8000/health

# Test alarm trigger (generates voice)
curl -X POST http://localhost:8000/alarm/trigger \
  -H "Content-Type: application/json" \
  -d '{"snooze_count": 0, "user_id": "test123"}'
```

**Expected response:**
```json
{
  "audio_url": "/audio/alarm_0_20241121_123456.mp3",
  "message": "Good morning there. Time to wake up...",
  "snooze_count": 0,
  "level": "mild"
}
```

**✅ If this works, your ElevenLabs API is working!**

---

### Step 5: Test Gemini API (Roast Generation)

```bash
# Test excuse analysis (uses Gemini)
curl -X POST http://localhost:8000/excuse/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "excuse": "Just 5 more minutes",
    "snooze_count": 3
  }'
```

**Expected response:**
```json
{
  "analysis": {
    "excuseRating": 2,
    "isLying": true,
    "roast": "Really? Just 5 more minutes? That's the best you can do?",
    "escalationLevel": "medium"
  },
  "roast": "...",
  "audio_url": "/audio/roast_3_...",
  "snooze_count": 3,
  "level": "moderate"
}
```

**✅ If this works, your Gemini API is working!**

---

### Step 6: Start Person 4 Backend (Social Media)

**Open Terminal 2:**

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
npm install  # Only needed first time
npm run dev
```

**What you should see:**
```
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

**✅ Test it:** Open `http://localhost:8787/health` → Should show `{"status":"ok"}`

---

### Step 7: Start Frontend

**Open Terminal 3:**

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/frontend"
npm install  # Only needed first time

# Create .env.local file
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_SOCIAL_BACKEND_URL=http://localhost:8787" >> .env.local

# Start frontend
npm run dev
```

**What you should see:**
```
✓ Ready in Xs
○ Local:        http://localhost:3000
```

**✅ Test it:** Open `http://localhost:3000` → Should show alarm clock interface!

---

## 🧪 Full System Test

Once all 3 servers are running:

1. **Open** `http://localhost:3000` in your browser
2. **Click** "⚙️ Settings" button
3. **Set** an alarm for **2 minutes** in the future
4. **Wait** for alarm to trigger
5. **Click** "SNOOZE" and enter excuse: "Just 5 more minutes"
6. **Watch** the AI roast you and hear the voice! 🎤

---

## ✅ Everything is Working If:

- ✅ Person 2 backend shows: `Uvicorn running on http://0.0.0.0:8000`
- ✅ Person 4 backend shows: `Ready on http://localhost:8787`
- ✅ Frontend shows: `Local: http://localhost:3000`
- ✅ You can visit `http://localhost:8000/docs` and see API docs
- ✅ You can visit `http://localhost:3000` and see the alarm clock
- ✅ Alarm triggers → Voice plays → Roast appears → Audio plays

---

## 🐛 Common Issues & Fixes

### Issue: "ElevenLabs API key not configured"
**Fix:** Make sure `.env` file exists with `ELEVENLABS_API_KEY=your_key`

### Issue: "Gemini API key not configured"
**Fix:** Add `GEMINI_API_KEY=your_key` to `.env` file

### Issue: Port already in use
**Fix:** 
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill

# Or change PORT in .env file
```

### Issue: Python dependencies missing
**Fix:**
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: npm dependencies missing
**Fix:**
```bash
cd frontend && npm install
cd ../backend-social && npm install
```

---

## 🎯 Quick Checklist

- [ ] `.env` file created with API keys
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] Person 2 backend running (port 8000)
- [ ] Person 4 backend running (port 8787)
- [ ] Frontend running (port 3000)
- [ ] Can access `http://localhost:8000/docs`
- [ ] Can access `http://localhost:3000`
- [ ] Test alarm triggers and plays voice

---

## 🚀 You're Ready to Demo!

Once all 3 servers are running and you've tested:
- ✅ ElevenLabs generates snarky voice messages
- ✅ Gemini analyzes excuses and generates roasts
- ✅ Frontend displays everything beautifully

**Everything works correctly!** 🎉

Just make sure your API keys are valid and all servers are running.

