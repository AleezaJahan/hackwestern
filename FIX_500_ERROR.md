# 🔧 Fix: 500 Error - "Failed to trigger alarm"

## ❌ Current Error:
```
401 Client Error: Unauthorized for url: https://api.elevenlabs.io/v1/text-to-speech/...
```

This means your **ElevenLabs API key is invalid or not configured correctly**.

---

## ✅ Quick Fix (3 Steps)

### Step 1: Check Your `.env` File

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
cat .env | grep ELEVENLABS_API_KEY
```

**What you should see:**
```bash
ELEVENLABS_API_KEY=sk_abc123xyz...your_actual_key
```

**If you see:**
```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```
→ **This is the problem!** You need to replace it with your actual key.

---

### Step 2: Get Your ElevenLabs API Key

1. **Go to:** https://elevenlabs.io/
2. **Sign in** (or create account)
3. **Go to:** Profile → API Keys (or Dashboard → API Keys)
4. **Copy your API key** (starts with `sk_...`)

**Important:** Make sure you have:
- ✅ Active subscription (free tier works!)
- ✅ API key is not expired
- ✅ You copied the entire key (no spaces)

---

### Step 3: Update `.env` and Restart Server

**Edit `.env` file:**
```bash
nano .env
# OR open in any text editor
```

**Replace this line:**
```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**With your actual key:**
```bash
ELEVENLABS_API_KEY=sk_abc123def456ghi789...your_actual_key_here
```

**Save the file, then RESTART your server:**

1. **Stop the server** (press `Ctrl+C` in terminal where `python main.py` is running)

2. **Restart:**
   ```bash
   cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
   source venv/bin/activate
   python main.py
   ```

3. **Test again:**
   ```bash
   curl -X POST http://localhost:8000/alarm/trigger \
     -H "Content-Type: application/json" \
     -d '{"snooze_count": 0, "user_id": "test"}'
   ```

---

## 🧪 Verify It Works

**After updating the key and restarting:**

```bash
# Test health (should work)
curl http://localhost:8000/health

# Test alarm trigger (should work with valid key)
curl -X POST http://localhost:8000/alarm/trigger \
  -H "Content-Type: application/json" \
  -d '{"snooze_count": 0, "user_id": "test"}'
```

**Expected response** (if key is valid):
```json
{
  "audio_url": "/audio/alarm_0_20241121_123456.mp3",
  "message": "Good morning there. Time to wake up...",
  "snooze_count": 0,
  "level": "mild"
}
```

---

## ⚠️ Common Issues

### Issue 1: API Key Still Placeholder
**Symptom:** `.env` file has `your_elevenlabs_api_key_here`
**Fix:** Replace with actual key from ElevenLabs dashboard

### Issue 2: Invalid API Key
**Symptom:** Key looks correct but still getting 401
**Fix:** 
- Check key is complete (no truncation)
- Verify key is active in ElevenLabs dashboard
- Make sure you have API credits/quota

### Issue 3: Server Not Restarted
**Symptom:** Updated `.env` but still getting error
**Fix:** **MUST restart server** after changing `.env` file

### Issue 4: Wrong Key Format
**Symptom:** Key doesn't start with `sk_`
**Fix:** Make sure you copied the API key, not the voice ID or other value

---

## 🔍 Debug Steps

**1. Check if key is loaded:**
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
source venv/bin/activate
python3 -c "from config import Config; print('Key exists:', bool(Config.ELEVENLABS_API_KEY)); print('Key length:', len(Config.ELEVENLABS_API_KEY) if Config.ELEVENLABS_API_KEY else 0)"
```

**2. Test key directly:**
```bash
# Get your key from .env
export ELEVENLABS_API_KEY=$(grep ELEVENLABS_API_KEY .env | cut -d'=' -f2)

# Test with curl
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM" \
  -H "Accept: audio/mpeg" \
  -H "Content-Type: application/json" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -d '{
    "text": "Hello, this is a test",
    "model_id": "eleven_turbo_v2_5"
  }' \
  --output test_audio.mp3
```

**If this works:** Your key is valid, server just needs restart
**If this fails:** Your key is invalid, get a new one from ElevenLabs

---

## ✅ Checklist

- [ ] `.env` file exists
- [ ] `ELEVENLABS_API_KEY` has actual key (not placeholder)
- [ ] Key starts with `sk_`
- [ ] Key is complete (no truncation)
- [ ] Server restarted after updating `.env`
- [ ] Test endpoint works

---

## 🚀 After Fixing

Once your API key is valid and server is restarted:
- ✅ Alarm trigger will work
- ✅ Voice generation will work
- ✅ Audio files will be created
- ✅ Frontend will play audio

Good luck! 🎉

