# Next Steps - Quick Start Guide 🚀

Here's exactly what you need to do to get everything running!

## ✅ What's Already Done

- ✅ API keys configured (ElevenLabs, Gemini)
- ✅ `.env` file created
- ✅ Simple storage implemented (no database setup!)
- ✅ Frontend dependencies installed
- ✅ Person 4 backend dependencies installed

---

## Step 1: Set Up Person 2 Backend (AI & Voice) 🎤

This is the main backend that handles AI and voice generation.

### 1.1 Install Python Dependencies

```bash
# Create virtual environment (if not done)
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 1.2 Test Person 2 Backend

```bash
# Make sure venv is activated
source venv/bin/activate

# Start the server
python main.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Checkpoint:** Open `http://localhost:8000/docs` in browser - you should see API documentation!

---

## Step 2: Start Person 4 Backend (Social Media) 🐦

This backend handles social media threats and storage (no setup needed anymore!).

### 2.1 Start the Backend

```bash
cd backend-social

# That's it! No database setup needed!
npm run dev
```

**Expected output:**
```
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

✅ **Checkpoint:** Visit `http://localhost:8787/health` - should return `{"status":"ok"}`

---

## Step 3: Set Up Frontend 🎨

### 3.1 Create Environment File

```bash
cd frontend

# Create .env.local file
cat > .env.local << 'EOF'
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_SOCIAL_BACKEND_URL=http://localhost:8787
EOF
```

### 3.2 Start Frontend

```bash
# Still in frontend directory
npm run dev
```

**Expected output:**
```
✓ Ready in Xs
○ Local:        http://localhost:3000
```

✅ **Checkpoint:** Open `http://localhost:3000` - you should see the alarm clock interface!

---

## Step 4: Test the Complete Flow 🧪

### 4.1 Start All Services

Open **3 terminal windows/tabs**:

**Terminal 1 - Person 2 Backend:**
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
source venv/bin/activate
python main.py
```

**Terminal 2 - Person 4 Backend:**
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/frontend"
npm run dev
```

### 4.2 Test the Alarm

1. Open `http://localhost:3000` in your browser
2. Click "⚙️ Settings" and configure:
   - Your Twitter handle (optional)
   - Phone number (optional, for SMS threats)
   - Crush's Twitter handle (for embarrassment factor 😈)
3. Go back to main page
4. Set an alarm for **2 minutes** in the future
5. Wait for alarm to trigger
6. Click "SNOOZE" and enter an excuse
7. Watch the AI roast you! 😅

### 4.3 Test Escalation

- Snooze 3+ times to trigger SMS threat (simulated)
- Snooze 5+ times to see social media threat warning
- Snooze 7+ times to see Twitter post (simulated if Twitter not configured)

---

## Troubleshooting 🔧

### Person 2 Backend Issues

**"Module not found" errors?**
```bash
# Make sure venv is activated and dependencies are installed
source venv/bin/activate
pip install -r requirements.txt
```

**"Port 8000 already in use"?**
- Change `PORT=8001` in `.env` file
- Or kill the process using port 8000:
  ```bash
  lsof -ti:8000 | xargs kill
  ```

**"ElevenLabs API key not configured"?**
- Check your `.env` file has `ELEVENLABS_API_KEY` set
- Verify the key is correct

### Person 4 Backend Issues

**"Cannot find module"?**
```bash
cd backend-social
npm install
```

**Port 8787 already in use?**
- Cloudflare Workers will use a different port automatically
- Check the terminal output for the actual port

### Frontend Issues

**"Cannot connect to backend"?**
- Verify Person 2 backend is running on port 8000
- Verify Person 4 backend is running
- Check `.env.local` has correct URLs

**Audio not playing?**
- Check browser console for errors
- Verify Person 2 backend is serving audio files
- Try opening audio URL directly in browser

---

## Quick Command Reference 📝

### Start Everything (3 terminals)

```bash
# Terminal 1: Person 2
cd "/Users/parimehla/Desktop/Hack Western/hackwestern" && source venv/bin/activate && python main.py

# Terminal 2: Person 4
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social" && npm run dev

# Terminal 3: Frontend
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/frontend" && npm run dev
```

---

## What to Check ✅

- [ ] Person 2 backend running on port 8000 (check `/docs` endpoint)
- [ ] Person 4 backend running (check `/health` endpoint)
- [ ] Frontend running on port 3000
- [ ] Can set alarm in frontend
- [ ] Alarm triggers and plays audio
- [ ] Snooze works and shows roast
- [ ] Stats are recorded (check Person 4 `/debug/export` endpoint)

---

## Ready to Demo! 🎉

Once all 3 services are running and you can:
- ✅ Set an alarm
- ✅ See it trigger
- ✅ Snooze and get roasted
- ✅ See escalation warnings

You're ready to demo! 🚀

---

## Need Help?

- Check `SETUP_GUIDE.md` for detailed setup
- Check `FLOW_VERIFICATION.md` for integration details
- Check API docs at `http://localhost:8000/docs`

Good luck! 🎊

