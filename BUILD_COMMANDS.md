# Build & Test Commands 🚀

Quick reference for building and testing the Passive-Aggressive Alarm Clock webapp.

## Prerequisites

Make sure you have:
- Python 3.9+ installed
- Node.js and npm installed
- API keys ready (ElevenLabs, Gemini, etc.)

## Step 1: Set Up Python Backend

```bash
# Navigate to project root
cd /Users/parimehla/Desktop/tame/hackwestern

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file from template (if it doesn't exist)
cp env_template.txt .env

# Edit .env file with your API keys
# nano .env  # or use your preferred editor
```

## Step 2: Set Up Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Create .env.local file (if it doesn't exist)
cat > .env.local << EOF
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_SOCIAL_BACKEND_URL=http://localhost:8787
NEXT_PUBLIC_USER_ID=test-user-123
EOF

# Go back to root
cd ..
```

## Step 3: Set Up Social Media Backend (Optional)

```bash
# Navigate to backend-social directory
cd backend-social

# Install Node.js dependencies
npm install

# Go back to root
cd ..
```

## Step 4: Run Everything

You'll need **3 terminal windows** (or use a process manager like `tmux` or `pm2`):

### Terminal 1: Python Backend
```bash
cd /Users/parimehla/Desktop/tame/hackwestern
source venv/bin/activate
python main.py
# Or: uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Frontend
```bash
cd /Users/parimehla/Desktop/tame/hackwestern/frontend
npm run dev
```

### Terminal 3: Social Media Backend (Optional)
```bash
cd /Users/parimehla/Desktop/tame/hackwestern/backend-social
npm run dev
```

## Quick Test Commands

### Test Python Backend
```bash
# Health check
curl http://localhost:8000/health

# Or open in browser
open http://localhost:8000/docs
```

### Test Frontend
```bash
# Open in browser
open http://localhost:3000
```

### Test Social Media Backend
```bash
# Health check (if endpoint exists)
curl http://localhost:8787
```

## One-Line Setup (After First Time)

If you've already set everything up once, you can use these quick commands:

```bash
# Python Backend
cd /Users/parimehla/Desktop/tame/hackwestern && source venv/bin/activate && python main.py

# Frontend (in another terminal)
cd /Users/parimehla/Desktop/tame/hackwestern/frontend && npm run dev

# Social Backend (in another terminal)
cd /Users/parimehla/Desktop/tame/hackwestern/backend-social && npm run dev
```

## Build for Production

### Frontend Production Build
```bash
cd frontend
npm run build
npm start
```

### Python Backend Production
```bash
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -ti:8000

# Kill it
kill -9 $(lsof -ti:8000)

# Or change PORT in .env file
```

### Missing Dependencies
```bash
# Python
pip install -r requirements.txt

# Frontend
cd frontend && npm install

# Social Backend
cd backend-social && npm install
```

### Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Expected URLs

- **Frontend**: http://localhost:3000
- **Python Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Social Media Backend**: http://localhost:8787

