# API Keys Setup Guide 🔑

Your API keys have been configured! Here's what to do next:

## ✅ Person 2 Backend (.env file)

Your `.env` file has been created with:
- ✅ ElevenLabs API Key
- ✅ Gemini API Key
- ✅ Default ElevenLabs Voice ID (`21m00Tcm4TlvDq8ikWAM` - Rachel voice)

**Note:** You can change the voice ID later by editing `.env` file. Popular voices:
- `21m00Tcm4TlvDq8ikWAM` - Rachel (Default - friendly female)
- `EXAVITQu4vr4xnSDxMaL` - Bella (friendly female)
- `VR6AewLTigWG4xSOukaG` - Arnold (confident male)
- `ThT5KcBeYPX3keUQqHPh` - Dorothy (young female)
- `XB0fDUnXU5powFXDhCwa` - Charlotte (British female)

Visit [ElevenLabs Voice Library](https://elevenlabs.io/app/voice-library) to find more voices.

---

## ✅ Person 4 Backend (Simple Storage - No Setup!)

**Great news!** Person 4 backend now uses simple JSON storage - no database setup needed! 🎉

### Setup Steps:

**That's it - no setup required!** The backend uses in-memory storage by default.

**Optional: Persistent Storage (Workers KV)**
If you want data to persist across restarts:

```bash
cd backend-social

# Create Workers KV namespace
wrangler kv:namespace create "DB_KV"

# This will output something like:
# { binding = "DB_KV", id = "abc123..." }
# 
# Copy the id and add to wrangler.toml under [vars]:
# DB_KV = "abc123..."
```

**Note:** For hackathon demos, in-memory storage is perfect (no setup needed)!

---

## 🚀 Quick Test

### Test Person 2 Backend:

```bash
# Activate virtual environment
source venv/bin/activate  # or: venv\Scripts\activate on Windows

# Install dependencies (if not done)
pip install -r requirements.txt

# Start server
python main.py
```

Visit `http://localhost:8000/docs` - you should see the API docs!

### Test Person 4 Backend:

```bash
cd backend-social

# Set secrets first (see above)
# Then start dev server
npm run dev
```

Visit the URL shown (usually `http://localhost:8787`) - you should see health check!

---

## ⚠️ Important Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore` ✅
2. **Never share API keys publicly**
3. **Rotate keys if exposed**
4. **Use environment variables in production**

---

## 🎯 Next Steps

1. ✅ API keys configured
2. ✅ Person 4 backend ready (no database setup needed!)
3. ⏳ Test Person 2 backend
4. ⏳ Test Person 4 backend (zero config!)
5. ⏳ Start frontend and test full flow

See `SETUP_GUIDE.md` for full instructions!

