# 🚀 Quick Start Commands

## Option 1: Use the Scripts (Easiest)

### Start All Services:
```bash
./START_ALL.sh
```

### Stop All Services:
```bash
./STOP_ALL.sh
```

---

## Option 2: Manual Start (3 Separate Terminals)

### Terminal 1 - Python Backend (Port 8000):
```bash
cd /Users/parimehla/Desktop/tame/hackwestern
source venv/bin/activate
python main.py
```

### Terminal 2 - Social Media Backend (Port 8787):
```bash
cd /Users/parimehla/Desktop/tame/hackwestern/backend-social
npm run dev
```

### Terminal 3 - Frontend (Port 3000):
```bash
cd /Users/parimehla/Desktop/tame/hackwestern/frontend
npm run dev
```

---

## Option 3: One-Liner Commands

### Kill All Existing Processes:
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null; lsof -ti:8000 | xargs kill -9 2>/dev/null; lsof -ti:8787 | xargs kill -9 2>/dev/null; pkill -f "wrangler dev" 2>/dev/null; pkill -f "python.*main.py" 2>/dev/null; pkill -f "next dev" 2>/dev/null
```

### Start Python Backend:
```bash
cd /Users/parimehla/Desktop/tame/hackwestern && source venv/bin/activate && python main.py &
```

### Start Social Backend:
```bash
cd /Users/parimehla/Desktop/tame/hackwestern/backend-social && npm run dev &
```

### Start Frontend:
```bash
cd /Users/parimehla/Desktop/tame/hackwestern/frontend && npm run dev &
```

---

## Service URLs:
- **Frontend**: http://localhost:3000
- **Python Backend**: http://localhost:8000
- **Social Backend**: http://localhost:8787

---

## Health Checks:
```bash
# Check Python Backend
curl http://localhost:8000/health

# Check Social Backend
curl http://localhost:8787/health

# Check Frontend (should return HTML)
curl http://localhost:3000
```

