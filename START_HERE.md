# 🚀 START HERE - Quick Setup!

Everything is configured! Here's what to do:

## ✅ What's Done

- ✅ `.env` file created with your API keys
- ✅ Python virtual environment created
- ✅ Frontend `.env.local` created
- ✅ Simple storage (no database setup needed!)

---

## 🎯 Next Steps (3 Terminal Windows)

### Terminal 1: Person 2 Backend (AI & Voice)

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
source venv/bin/activate
python main.py
```

**Wait for:** `INFO: Uvicorn running on http://0.0.0.0:8000`

Then open: `http://localhost:8000/docs` (should show API docs)

---

### Terminal 2: Person 4 Backend (Social Media)

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
npm run dev
```

**Wait for:** `Ready on http://localhost:8787`

Then open: `http://localhost:8787/health` (should show `{"status":"ok"}`)

---

### Terminal 3: Frontend

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/frontend"
npm run dev
```

**Wait for:** `Local: http://localhost:3000`

Then open: `http://localhost:3000` (should show alarm clock interface!)

---

## 🧪 Test It!

1. Open `http://localhost:3000` in your browser
2. Click "⚙️ Settings" and configure:
   - Your Twitter handle (optional)
   - Phone number (optional)
   - Crush's Twitter handle (for embarrassment 😈)
3. Set an alarm for **2 minutes** in the future
4. Wait for alarm to trigger
5. Click "SNOOZE" and enter an excuse like "Just 5 more minutes"
6. Watch the AI roast you! 😅

---

## 🎉 You're Ready!

Once all 3 terminals show:
- ✅ Person 2 running on port 8000
- ✅ Person 4 running on port 8787
- ✅ Frontend running on port 3000

You can demo your Passive-Aggressive Alarm Clock! 🚀

---

## 🐛 Troubleshooting

**Python dependencies not installed?**
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
source venv/bin/activate
pip install -r requirements.txt
```

**Port already in use?**
- Person 2: Change `PORT=8001` in `.env` file
- Person 4: Check terminal for actual port number
- Frontend: Usually uses 3000 automatically

**Backend not connecting?**
- Verify all 3 services are running
- Check browser console for errors
- Verify `.env.local` has correct URLs

---

Need help? Check `NEXT_STEPS.md` for detailed instructions!

