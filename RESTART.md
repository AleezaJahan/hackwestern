# Restart Commands

## Quick Restart (All Services)

### Step 1: Stop All Running Services
Press `Ctrl+C` in each terminal where services are running, OR kill processes:

```bash
# Kill processes on ports (if stuck)
lsof -ti:8000 | xargs kill -9  # Person 2 Backend
lsof -ti:8787 | xargs kill -9  # Person 4 Backend  
lsof -ti:3000 | xargs kill -9  # Frontend
```

### Step 2: Restart Each Service (Open 3 Separate Terminals)

**Terminal 1 - Person 2 Backend (AI & Voice):**
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
python3 run.py
```

**Terminal 2 - Person 4 Backend (Social Media):**
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
npx wrangler dev
```

**Terminal 3 - Frontend:**
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/frontend"
npm run dev
```

## Verify Services Are Running

```bash
# Check Person 2 Backend
curl http://localhost:8000/health

# Check Person 4 Backend
curl http://localhost:8787/health

# Open Frontend in browser
open http://localhost:3000
```

## Restart Just One Service

### Restart Person 2 Backend Only
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern"
python3 run.py
```

### Restart Person 4 Backend Only (Important for Twitter!)
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
npx wrangler dev
```

### Restart Frontend Only
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/frontend"
npm run dev
```

