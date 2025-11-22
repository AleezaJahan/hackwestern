# Frontend & User Experience 🎨

**Person 1: Frontend & User Experience**

This is the Next.js frontend for the Passive-Aggressive Alarm Clock. It provides a beautiful, mobile-responsive interface for setting alarms, receiving AI-generated roasts, and tracking snooze escalation.

## Features

- ✅ **Alarm Interface** - Set alarm time, snooze button, excuse input
- ✅ **Settings Page** - Social media connections, crush's Twitter handle, snooze tolerance
- ✅ **Real-time Roast Display** - Shows AI-generated roasts from Gemini
- ✅ **Snooze Counter & Escalation Visualization** - Visual progress indicators
- ✅ **Mobile-Responsive Design** - Optimized for phone alarms
- ✅ **Audio Playback** - ElevenLabs audio integration
- ✅ **Social Media Threat Warnings** - Countdown to escalation

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Beautiful toast notifications
- **Axios** - HTTP client for API calls
- **date-fns** - Date manipulation utilities

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
# Backend API URLs
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_SOCIAL_BACKEND_URL=http://localhost:8787

# Optional: Default user ID for testing
NEXT_PUBLIC_USER_ID=test-user-123
```

### 3. Run Development Server

```bash
npm run dev
```

The frontend will start at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main alarm interface
│   ├── settings/            # Settings page
│   │   └── page.tsx
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── AudioPlayer.tsx      # ElevenLabs audio playback
│   ├── RoastDisplay.tsx     # AI roast display
│   ├── SnoozeCounter.tsx    # Snooze counter & escalation
│   └── SocialMediaThreat.tsx # Social media warnings
├── lib/                     # Utilities
│   ├── api.ts              # API client
│   ├── storage.ts          # LocalStorage utilities
│   └── utils.ts            # Helper functions
└── package.json
```

## Usage

### Setting an Alarm

1. Navigate to the main page
2. Set an alarm time using the datetime picker
3. Click "Set Alarm"
4. Wait for the alarm to trigger

### Snoozing

1. When the alarm goes off, click "SNOOZE"
2. Enter an excuse (required)
3. The AI will analyze your excuse and generate a roast
4. The alarm will continue after the roast

### Viewing Settings

1. Click the "⚙️ Settings" button
2. Configure:
   - Email (optional)
   - Phone number (for SMS threats)
   - Twitter handle (your handle)
   - Crush's Twitter handle (for embarrassment factor)
   - Snooze tolerance
   - Enable/disable social media and SMS threats

## Integration Points

### Person 2 (AI & Voice Backend)

The frontend calls Person 2's backend for:
- **Alarm Trigger**: `POST /alarm/trigger`
- **Snooze Handling**: `POST /snooze`
- **Excuse Analysis**: `POST /excuse/analyze`
- **Audio Files**: `GET /audio/{filename}`

### Person 4 (Social Media Backend)

The frontend notifies Person 4's backend:
- **Snooze Events**: `POST /snooze/event` (when snooze_count >= 3)
- **User Stats**: `GET /user/stats`
- **Snooze History**: `GET /user/history`

## Escalation Levels

The frontend visualizes escalation based on snooze count:

- **Mild (1-2 snoozes)**: 😊 Green - Playful messages
- **Moderate (3-4 snoozes)**: 😐 Yellow - Pointed sarcasm
- **Aggressive (5-6 snoozes)**: 😠 Orange - Harsh calls to action
- **Nuclear (7+ snoozes)**: 💀 Red - Brutal roasts with social media posts

## Escalation Thresholds

- **3 snoozes**: SMS threat via Twilio
- **5 snoozes**: Social media threat generated
- **7 snoozes**: Actually posts to Twitter/X
- **10 snoozes**: Nuclear option - Post embarrassing stats

## Mobile Responsive

The frontend is fully responsive and optimized for mobile devices:
- Touch-friendly buttons
- Responsive layouts
- Mobile-first design
- Works as a PWA (can be installed on phones)

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Troubleshooting

### Backend Connection Issues

- Verify that `NEXT_PUBLIC_BACKEND_URL` points to Person 2's backend
- Verify that `NEXT_PUBLIC_SOCIAL_BACKEND_URL` points to Person 4's backend
- Check that both backends are running

### Audio Playback Issues

- Ensure the backend is serving audio files correctly
- Check browser console for CORS errors
- Verify that the audio URL is correct

### Settings Not Saving

- Check browser localStorage permissions
- Verify that the browser allows localStorage
- Check browser console for errors

## License

MIT

## Authors

ALEEZA + Carmen

