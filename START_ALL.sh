#!/bin/bash

# Script to start all services for Rise & Roast
# This will kill existing processes and start fresh

echo "🚀 Starting Rise & Roast - All Services"
echo "========================================"

# Kill existing processes on the ports
echo "📛 Killing existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:8787 | xargs kill -9 2>/dev/null || true
pkill -f "wrangler dev" 2>/dev/null || true
pkill -f "python.*main.py" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

sleep 2

# Start Python Backend (Person 2 - AI & Voice)
echo ""
echo "🐍 Starting Python Backend (Port 8000)..."
cd "$(dirname "$0")"
if [ -d "venv" ]; then
    source venv/bin/activate
    python main.py > python_backend.log 2>&1 &
    PYTHON_PID=$!
    echo "   ✅ Python backend started (PID: $PYTHON_PID)"
    echo "   📝 Logs: python_backend.log"
else
    echo "   ⚠️  Warning: venv not found. Make sure to create it first:"
    echo "      python3 -m venv venv"
    echo "      source venv/bin/activate"
    echo "      pip install -r requirements.txt"
fi

# Start Social Media Backend (Person 4 - Cloudflare Worker)
echo ""
echo "☁️  Starting Social Media Backend (Port 8787)..."
cd "$(dirname "$0")/backend-social"
if [ -f "package.json" ]; then
    npm run dev > ../social_backend.log 2>&1 &
    SOCIAL_PID=$!
    echo "   ✅ Social backend started (PID: $SOCIAL_PID)"
    echo "   📝 Logs: social_backend.log"
    cd ..
else
    echo "   ⚠️  Warning: backend-social/package.json not found"
    cd ..
fi

# Start Frontend (Person 1 - Next.js)
echo ""
echo "⚛️  Starting Frontend (Port 3000)..."
cd "$(dirname "$0")/frontend"
if [ -f "package.json" ]; then
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "   ✅ Frontend started (PID: $FRONTEND_PID)"
    echo "   📝 Logs: frontend.log"
    cd ..
else
    echo "   ⚠️  Warning: frontend/package.json not found"
    cd ..
fi

echo ""
echo "========================================"
echo "✅ All services starting!"
echo ""
echo "📍 Services:"
echo "   - Frontend:        http://localhost:3000"
echo "   - Python Backend:  http://localhost:8000"
echo "   - Social Backend:  http://localhost:8787"
echo ""
echo "📝 Logs:"
echo "   - Python:   tail -f python_backend.log"
echo "   - Social:   tail -f social_backend.log"
echo "   - Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   ./STOP_ALL.sh"
echo ""

