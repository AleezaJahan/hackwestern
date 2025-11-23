# 🚀 Deployment Guide - Rise & Roast

This guide will help you deploy **Rise & Roast** to production, making it accessible on both desktop and mobile devices.

## Architecture Overview

Your app has 3 components:
1. **Frontend** (Next.js) → Deploy to **Vercel** ✅
2. **Python Backend** (FastAPI) → Deploy to **Railway**, **Render**, or **Fly.io**
3. **Social Media Backend** (Cloudflare Worker) → Already deployable via `npm run deploy`

---

## Step 1: Deploy Frontend to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

3. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository: `AleezaJahan/hackwestern`
   - **Root Directory**: Set to `frontend` (important!)
   - Click "Deploy"

4. **Configure Environment Variables**
   After the first deployment, go to **Settings** → **Environment Variables** and add:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-python-backend-url.railway.app
   NEXT_PUBLIC_SOCIAL_BACKEND_URL=https://your-cloudflare-worker.your-subdomain.workers.dev
   ```

5. **Redeploy**
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment → **Redeploy**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? rise-and-roast (or your choice)
# - Directory? ./frontend (or just .)
# - Override settings? No

# Set environment variables
vercel env add NEXT_PUBLIC_BACKEND_URL
# Enter: https://your-python-backend-url.railway.app

vercel env add NEXT_PUBLIC_SOCIAL_BACKEND_URL
# Enter: https://your-cloudflare-worker.your-subdomain.workers.dev

# Redeploy with new env vars
vercel --prod
```

---

## Step 2: Deploy Python Backend

### Option A: Railway (Recommended - Easy)

1. **Go to Railway**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - **Root Directory**: Leave empty (root of repo)
   - **Start Command**: `cd /Users/parimehla/Desktop/tame/hackwestern && source venv/bin/activate && python main.py`
   - Actually, better: Create a `Procfile` or use Railway's Python detection

3. **Create `Procfile` in root directory:**
   ```
   web: cd /app && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **Set Environment Variables in Railway:**
   - Go to **Variables** tab
   - Add all your `.env` variables:
     - `ELEVENLABS_API_KEY`
     - `GEMINI_API_KEY`
     - `GOOGLE_TRANSLATE_API_KEY`
     - `ELEVENLABS_VOICE_ID`
     - `PORT=8000` (or let Railway assign)

5. **Get your Railway URL**
   - Railway will give you a URL like: `https://your-app.railway.app`
   - Use this in your Vercel `NEXT_PUBLIC_BACKEND_URL`

### Option B: Render

1. **Go to Render**
   - Visit [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Connect your GitHub repo
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Port**: 8000

3. **Set Environment Variables**
   - Add all your `.env` variables in the Render dashboard

### Option C: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Initialize (in project root)
fly launch

# Set secrets
fly secrets set ELEVENLABS_API_KEY=your_key
fly secrets set GEMINI_API_KEY=your_key
# ... etc

# Deploy
fly deploy
```

---

## Step 3: Deploy Social Media Backend (Cloudflare Worker)

This is already set up! Just deploy:

```bash
cd backend-social

# Make sure you're logged in
npx wrangler login

# Set production secrets (if not already set)
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_PHONE_NUMBER
npx wrangler secret put TWITTER_API_KEY
npx wrangler secret put TWITTER_API_SECRET
npx wrangler secret put TWITTER_ACCESS_TOKEN
npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET
npx wrangler secret put TWITTER_BEARER_TOKEN

# Deploy
npm run deploy
```

Your worker will be available at: `https://your-worker-name.your-subdomain.workers.dev`

---

## Step 4: Update Environment Variables

After deploying all three services, update your Vercel environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update:
   - `NEXT_PUBLIC_BACKEND_URL` = Your Python backend URL
   - `NEXT_PUBLIC_SOCIAL_BACKEND_URL` = Your Cloudflare Worker URL
3. Redeploy your Vercel app

---

## Step 5: Test Your Deployment

1. **Visit your Vercel URL** (e.g., `https://rise-and-roast.vercel.app`)
2. **Test on Mobile:**
   - Open the URL on your phone
   - The app should be fully responsive
   - Test setting an alarm
   - Test snoozing and receiving roasts

3. **Test on Desktop:**
   - Open in browser
   - Test all features

---

## Quick Deployment Checklist

### Frontend (Vercel)
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Root directory set to `frontend`
- [ ] Environment variables set
- [ ] Deployed successfully
- [ ] Tested on mobile and desktop

### Python Backend (Railway/Render/Fly.io)
- [ ] Account created
- [ ] Project deployed
- [ ] Environment variables set
- [ ] Health check working (`/health` endpoint)
- [ ] CORS configured (should allow your Vercel domain)

### Social Media Backend (Cloudflare)
- [ ] Wrangler logged in
- [ ] Secrets set
- [ ] Deployed (`npm run deploy`)
- [ ] Health check working

### Final Steps
- [ ] All environment variables updated in Vercel
- [ ] Vercel app redeployed
- [ ] Tested end-to-end flow
- [ ] Mobile responsive design verified

---

## Troubleshooting

### CORS Errors
If you see CORS errors, update your Python backend `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-app.vercel.app",
        "https://your-vercel-app.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment Variables Not Working
- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding environment variables
- Check Vercel logs for errors

### Backend Not Responding
- Check Railway/Render/Fly.io logs
- Verify environment variables are set
- Check that the port is correct
- Test the `/health` endpoint directly

### Mobile Issues
- The app is already mobile-responsive
- Check viewport meta tag (already in `layout.tsx`)
- Test on actual device, not just browser dev tools

---

## Cost Estimates

- **Vercel**: Free tier (Hobby) is perfect for this
- **Railway**: $5/month (or free trial)
- **Render**: Free tier available
- **Fly.io**: Free tier available
- **Cloudflare Workers**: Free tier (100,000 requests/day)

**Total**: Can be completely free for low traffic!

---

## Support

If you run into issues:
1. Check Vercel deployment logs
2. Check backend logs (Railway/Render/Fly.io)
3. Check browser console for errors
4. Verify all environment variables are set correctly

Good luck with your deployment! 🚀

