# Terminal Commands - Copy & Paste Ready 🚀

Open **3 separate terminal windows** and run these commands:

---

## Terminal 1: Person 2 Backend (AI & Voice) 🎤

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
source venv/bin/activate
python main.py
```

**What to expect:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**Then test:** Open `http://localhost:8000/docs` in your browser

---

## Terminal 2: Person 4 Backend (Social Media) 🐦

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
npm run dev
```

**What to expect:**
```
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

**Then test:** Open `http://localhost:8787/health` in your browser

---

## Terminal 3: Frontend 🎨

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/frontend"
npm run dev
```

**What to expect:**
```
✓ Ready in Xs
○ Local:        http://localhost:3000
```

**Then test:** Open `http://localhost:3000` in your browser

---

## 🎯 Quick Test

Once all 3 are running:

1. Open `http://localhost:3000` in your browser
2. Click "⚙️ Settings" button
3. Set an alarm for **2 minutes** in the future
4. Wait for alarm to trigger
5. Click "SNOOZE" and enter an excuse
6. Watch the AI roast you! 😅

---

## 🐛 Troubleshooting

**Python dependencies not installed?**
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
source venv/bin/activate
pip install -r requirements.txt
```

**Port already in use?**
```bash
# Kill process on port 8000 (Person 2)
lsof -ti:8000 | xargs kill

# Or change PORT in .env file
```

**Frontend dependencies not installed?**
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/frontend"
npm install
```

---

## ✅ Checklist

- [ ] Terminal 1: Person 2 backend running (port 8000)
- [ ] Terminal 2: Person 4 backend running (port 8787)
- [ ] Terminal 3: Frontend running (port 3000)
- [ ] Can access frontend at `http://localhost:3000`
- [ ] Can set an alarm
- [ ] Alarm triggers and plays audio
- [ ] Snooze works and shows roast

---

## 🎉 Ready to Demo!

Once all checkboxes are checked, you're ready to demo! 🚀

