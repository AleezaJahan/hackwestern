# 🔑 Fix: Add Your API Keys

Your `.env` file is created, but you need to add your **actual API keys**.

## ⚠️ Current Error:
```
"Error analyzing excuse: Gemini API key not configured"
```

This means your `.env` file has placeholder values, not real API keys.

---

## ✅ Quick Fix (3 Steps)

### Step 1: Edit the `.env` File

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
nano .env
```

**OR** open it in any text editor (VS Code, TextEdit, etc.)

### Step 2: Replace the Placeholders

Find these lines and replace with your **actual API keys**:

```bash
# Change this:
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# To this (your actual key):
ELEVENLABS_API_KEY=sk_abc123xyz...your_actual_key_here

# Change this:
GEMINI_API_KEY=your_gemini_api_key_here

# To this (your actual key):
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

**Important:** 
- Remove quotes around the keys
- No spaces before or after the `=`
- Keep the keys on one line

### Step 3: Save and Restart Server

**After saving `.env` file:**

1. **Stop your current server** (if running)
   - Press `Ctrl+C` in the terminal where `python main.py` is running

2. **Restart the server:**
   ```bash
   cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
   source venv/bin/activate
   python main.py
   ```

3. **Test again:**
   ```bash
   curl -X POST http://localhost:8000/excuse/analyze \
     -H "Content-Type: application/json" \
     -d '{"excuse": "Just 5 more minutes", "snooze_count": 3}'
   ```

---

## 🔑 Where to Get API Keys

### ElevenLabs API Key:
1. Go to: https://elevenlabs.io/
2. Sign up / Log in
3. Go to Dashboard → Profile → API Keys
4. Copy your API key (starts with `sk_...`)

### Gemini API Key:
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key" or use existing
4. Copy your API key (starts with `AIzaSy...`)

---

## ✅ Example `.env` File

After adding your keys, it should look like this:

```bash
# ElevenLabs API Configuration
ELEVENLABS_API_KEY=sk_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Google Gemini API Configuration
GEMINI_API_KEY=AIzaSyAbC123DeF456GhI789JkL012MnO345PqR678StU901VwX234Yz

# Voice IDs (already set - you don't need to change these)
VOICE_GENTLE=21m00Tcm4TlvDq8ikWAM
VOICE_SARCASTIC=EXAVITQu4vr4xnSDxMaL
VOICE_AGGRESSIVE=pNInz6obpgDQGcFmaJgB

# Server Configuration
PORT=8000
PERSON4_BACKEND_URL=http://localhost:8787
```

---

## 🧪 Verify It Works

After restarting the server:

```bash
# Test health (should work without keys)
curl http://localhost:8000/health

# Test excuse analysis (should work WITH keys)
curl -X POST http://localhost:8000/excuse/analyze \
  -H "Content-Type: application/json" \
  -d '{"excuse": "Just 5 more minutes", "snooze_count": 3}'
```

**Expected response** (if keys are correct):
```json
{
  "analysis": {
    "excuseRating": 2,
    "isLying": true,
    "roast": "...",
    "escalationLevel": "medium"
  },
  "roast": "...",
  "audio_url": "/audio/roast_3_...",
  "snooze_count": 3,
  "level": "moderate"
}
```

---

## ⚠️ Common Mistakes

1. **Forgot to restart server** → Keys won't be loaded
2. **Added quotes around keys** → `ELEVENLABS_API_KEY="sk_..."` ❌
3. **Has spaces** → `ELEVENLABS_API_KEY = sk_...` ❌
4. **Wrong key format** → Make sure keys are complete

---

## ✅ Checklist

- [ ] `.env` file created (✅ Done!)
- [ ] Added `ELEVENLABS_API_KEY` with actual key
- [ ] Added `GEMINI_API_KEY` with actual key
- [ ] Saved `.env` file
- [ ] Restarted server (`python main.py`)
- [ ] Tested endpoint - works!

---

## 🚀 After Adding Keys

Once you add your keys and restart:
1. ✅ Gemini will analyze excuses
2. ✅ Gemini will generate roasts
3. ✅ ElevenLabs will generate voice
4. ✅ Everything works together!

Good luck! 🎉

