# Testing Commands 🧪

Quick reference for testing the Passive-Aggressive Alarm Clock system.

## Prerequisites

Make sure you have:
- Python 3.8+ installed
- Node.js installed
- All API keys in `.env` file (root directory)
- All dependencies installed

---

## Step 1: Start Person 2 Backend (AI & Voice) 🎤

**Terminal 1 - Person 2 Backend:**

```bash
# Navigate to project root
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"

# Activate virtual environment (if you have one)
# source venv/bin/activate  # Uncomment if using venv

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start the backend server
python3 run.py
```

**Expected output:**
```
Starting Passive-Aggressive Alarm Clock - AI & Voice Integration Backend...
✓ Created directories: audio_output, temp
✓ All required API keys are set
Starting server on http://0.0.0.0:8000
API Documentation: http://localhost:8000/docs
```

**Keep this terminal open!**

---

## Step 2: Start Person 4 Backend (Social Media) 📱

**Terminal 2 - Person 4 Backend:**

```bash
# Navigate to backend-social directory
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"

# Install dependencies (if not already installed)
npm install

# Start Cloudflare Workers dev server
npm run dev
```

**Expected output:**
```
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

**Keep this terminal open!**

---

## Step 3: Start Frontend 🎨

**Terminal 3 - Frontend:**

```bash
# Navigate to frontend directory
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/frontend"

# Install dependencies (if not already installed)
npm install

# Start Next.js dev server
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Keep this terminal open!**

---

## Step 4: Test the System 🧪

### Option A: Test via Frontend (Recommended)

1. Open browser: http://localhost:3000
2. Go to Settings page and fill in:
   - Your email (optional)
   - Your phone number (optional)
   - Mom's phone number (for snooze 4)
   - Twitter handle (optional)
3. Go back to main page
4. Set an alarm time (a few minutes in the future)
5. Wait for alarm or manually trigger it
6. Test snoozing with different excuses:
   - **Legitimate excuse**: "I broke up with my boyfriend" → Should get empathetic response
   - **Lazy excuse**: "I'm just tired" → Should get mean response
7. Test escalation:
   - Snooze 1-3: Should get insults
   - Snooze 4: Should text mom (if mom's phone number is set)
   - Snooze 5: Should prompt for image and post to Twitter

### Option B: Test API Endpoints Directly

**Terminal 4 - Test API:**

```bash
# Test 1: Analyze excuse (legitimate emotional excuse)
curl -X POST http://localhost:8000/snooze \
  -H "Content-Type: application/json" \
  -d '{
    "excuse": "I broke up with my boyfriend",
    "snooze_count": 1,
    "user_id": "test-user-123"
  }'

# Test 2: Analyze excuse (lazy excuse)
curl -X POST http://localhost:8000/snooze \
  -H "Content-Type: application/json" \
  -d '{
    "excuse": "I am just tired",
    "snooze_count": 2,
    "user_id": "test-user-123"
  }'

# Test 3: Trigger alarm
curl -X POST http://localhost:8000/alarm/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "snooze_count": 0,
    "user_name": "Test User"
  }'

# Test 4: Check Person 4 backend health
curl http://localhost:8787/health

# Test 5: Test snooze event (triggers escalation)
curl -X POST http://localhost:8787/snooze/event \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "snooze_count": 4,
    "wake_up_time": "2024-11-22T10:00:00Z",
    "mom_phone_number": "1234567890"
  }'
```

---

## Quick Test Scenarios 🎯

### Scenario 1: Test Empathetic Response
```bash
curl -X POST http://localhost:8000/snooze \
  -H "Content-Type: application/json" \
  -d '{
    "excuse": "I broke up with my boyfriend last night",
    "snooze_count": 1,
    "user_id": "test-user"
  }'
```
**Expected**: Empathetic response like "I'm sorry that happened, but you're better than them..."

### Scenario 2: Test Mean Response
```bash
curl -X POST http://localhost:8000/snooze \
  -H "Content-Type: application/json" \
  -d '{
    "excuse": "just 5 more minutes",
    "snooze_count": 2,
    "user_id": "test-user"
  }'
```
**Expected**: Mean, judgmental response

### Scenario 3: Test Escalation (Snooze 4 - Text Mom)
```bash
curl -X POST http://localhost:8787/snooze/event \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "snooze_count": 4,
    "wake_up_time": "2024-11-22T10:00:00Z",
    "mom_phone_number": "1234567890"
  }'
```
**Expected**: SMS sent to mom with "degenerate is not waking up"

### Scenario 4: Test Escalation (Snooze 5 - Twitter Post)
```bash
curl -X POST http://localhost:8787/snooze/event \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "snooze_count": 5,
    "wake_up_time": "2024-11-22T10:00:00Z",
    "image_data": "base64_encoded_image_here",
    "image_type": "image/jpeg"
  }'
```
**Expected**: Tweet posted with embarrassing stats (and image if provided)

---

## Check Logs 📋

### Person 2 Backend Logs
- Check Terminal 1 for API requests and responses
- Check for errors in sentiment analysis or voice generation

### Person 4 Backend Logs
- Check Terminal 2 for escalation triggers
- Check for SMS/Twitter API calls

### Frontend Logs
- Check Terminal 3 for Next.js compilation
- Check browser console (F12) for frontend errors

---

## Troubleshooting 🔧

### Backend not starting?
```bash
# Check if port 8000 is already in use
lsof -i :8000

# Kill process if needed
kill -9 <PID>
```

### Frontend not starting?
```bash
# Check if port 3000 is already in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### API keys not working?
```bash
# Check .env file exists
cat .env

# Verify API keys are set
python3 -c "from config import Config; print('ElevenLabs:', bool(Config.ELEVENLABS_API_KEY)); print('Gemini:', bool(Config.GEMINI_API_KEY))"
```

### Dependencies missing?
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node dependencies (Person 4)
cd backend-social && npm install

# Install Node dependencies (Frontend)
cd frontend && npm install
```

---

## Stop All Servers 🛑

Press `Ctrl+C` in each terminal to stop the servers.

Or kill all processes:
```bash
# Kill Person 2 backend
pkill -f "python run.py"

# Kill Person 4 backend
pkill -f "wrangler dev"

# Kill Frontend
pkill -f "next dev"
```

---

## API Documentation 📚

- **Person 2 Backend**: http://localhost:8000/docs (Swagger UI)
- **Person 4 Backend**: http://localhost:8787 (Cloudflare Workers)
- **Frontend**: http://localhost:3000

---

## Quick Start (All in One) 🚀

If you want to start everything quickly:

```bash
# Terminal 1: Person 2 Backend
cd "/Users/parimehla/Desktop/Hack Western/hackwestern" && python3 run.py &

# Terminal 2: Person 4 Backend  
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social" && npm run dev &

# Terminal 3: Frontend
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/frontend" && npm run dev &
```

Then open: http://localhost:3000

