#!/bin/bash

# Script to stop all services for Rise & Roast

echo "🛑 Stopping Rise & Roast - All Services"
echo "========================================"

# Kill processes on ports
echo "📛 Killing processes on ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "   ✅ Stopped Frontend (3000)" || echo "   ⚠️  No process on port 3000"
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "   ✅ Stopped Python Backend (8000)" || echo "   ⚠️  No process on port 8000"
lsof -ti:8787 | xargs kill -9 2>/dev/null && echo "   ✅ Stopped Social Backend (8787)" || echo "   ⚠️  No process on port 8787"

# Kill by process name
echo ""
echo "📛 Killing processes by name..."
pkill -f "wrangler dev" 2>/dev/null && echo "   ✅ Stopped Wrangler" || echo "   ⚠️  No Wrangler process"
pkill -f "python.*main.py" 2>/dev/null && echo "   ✅ Stopped Python main.py" || echo "   ⚠️  No Python process"
pkill -f "next dev" 2>/dev/null && echo "   ✅ Stopped Next.js" || echo "   ⚠️  No Next.js process"

echo ""
echo "✅ All services stopped!"

