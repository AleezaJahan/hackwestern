# Backend Deployment Guide

## Quick Start - Test Locally

1. **Install dependencies:**
   ```bash
   cd hackwestern
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Run the backend:**
   ```bash
   python main.py
   ```

   Server runs at: http://localhost:8000

3. **Test it:**
   Visit http://localhost:8000/docs to see the API documentation

## Deploy to Railway (Recommended - Free!)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Deploy
```bash
cd hackwestern
railway init
railway up
```

### Step 4: Add Environment Variables
Go to your Railway dashboard and add these variables:
- ELEVENLABS_API_KEY (optional for testing)
- ELEVENLABS_VOICE_ID (optional for testing)
- GEMINI_API_KEY (optional for testing)
- VAPI_API_KEY (optional for testing)
- PORT=8000

### Step 5: Get Your Backend URL
```bash
railway domain
```

Copy the URL (e.g., https://your-app.railway.app)

## Update Frontend

Add the backend URL to your frontend:

In `my-app/.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
```

Then redeploy the frontend:
```bash
cd my-app
vercel --prod
```

## Testing Without API Keys

The backend will work in "fallback mode" without API keys:
- Voice generation will be skipped
- Text responses will still work
- VAPI features will be disabled

You can add API keys later when you're ready!
