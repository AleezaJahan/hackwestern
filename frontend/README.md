# 🌙 Rise & Roast - Frontend & User Experience 🎨

**Frontend & User Experience**

This is the Next.js frontend for **Rise & Roast**, a passive-aggressive alarm clock that uses AI to roast you for snoozing. It provides a beautiful, mobile-responsive interface with dark purple galaxy theme, glassmorphism effects, and full internationalization support.

## ✨ Cool Features

### 🎨 **Beautiful UI/UX**
- **Dark Purple Galaxy Theme**: Stunning dark purple gradient background with glassmorphism effects
- **Mobile-First Design**: Fully responsive and optimized for mobile devices (iOS/Android)
- **Glassmorphism Cards**: Beautiful frosted glass effect on all cards and components
- **Circular Progress Indicators**: Visual sleep stats with animated circular progress rings
- **Smooth Animations**: Pulse effects, transitions, and hover states throughout
- **Time Display**: Large, beautiful current time and alarm time displays

### ⏰ **Alarm Management**
- **Apple-Style Alarm Setting**: Set alarms by time only (no date needed) - automatically sets for today or tomorrow
- **Alarm History**: Save and reuse previous alarms (just like Apple's alarm app)
- **Previous Alarms List**: View all your past alarms with reuse and delete options
- **Real-Time Countdown**: See exactly how many minutes until your alarm goes off
- **Alarm Status Display**: Beautiful visual indicators for alarm state

### 🎙️ **Audio & Voice Features**
- **ElevenLabs Audio Integration**: High-quality voice messages with escalating intensity
- **Multilingual Voice Support**: Voice speaks in your selected language (29+ languages)
- **Countdown Audio**: Specialized countdown sequences for threats
  - Crush text countdown with 5-second warning
  - Twitter post countdown with 5-second warning
- **Audio Player Component**: Custom audio player with play/pause controls
- **Alarm Sound**: Continuous alarm sound when alarm is active

### 🤖 **AI Roast Display**
- **Real-Time Roast Display**: Shows AI-generated roasts from Gemini API
- **Snooze Counter**: Visual progress indicators showing escalation level
- **Escalation Visualization**: Color-coded levels (purple shades) showing threat level
- **Social Media Threat Warnings**: Countdown warnings before escalation

### 🌍 **Internationalization**
- **Dual Language System**: Separate voice language and text language settings
- **16+ Supported Languages**: 
  - Voice: English, Spanish, French, German, Italian, Portuguese, Polish, Turkish, Russian, Dutch, Czech, Arabic, Chinese, Japanese, Hungarian, Korean
  - Text: English, Spanish, French, German, Italian, Portuguese
- **Localized Dates**: Dates formatted according to selected text language
- **Translated UI**: All UI text, buttons, labels, and messages are translated
- **Translation System**: Comprehensive translation keys for all UI elements

### 📊 **Sleep Statistics**
- **Circular Progress Stats**: Beautiful animated circular progress indicators showing:
  - Average hours slept (target: 8+ hours)
  - Good sleep days (8+ hours)
  - Current streak (consecutive good sleep days)
  - Total sessions
  - Total snoozes
  - Average snoozes per session
- **Sleep Session Tracking**: Automatically tracks sleep duration and snooze counts
- **Visual Feedback**: Complete ring = 8+ hours of sleep

### 🎯 **Escalation System**
- **Progressive Threats**: Multiple snoozes trigger escalating threats (Roasts → SMS → Social Media)
- **Countdown Popups**: 
  - **Crush Text Countdown**: 5-second countdown before texting your crush
    - Warning message: "I'm going to text your crush in 5 seconds if you don't wake up"
    - Countdown numbers: 5, 4, 3, 2, 1
    - Final message: "text sent to crush loser"
  - **Twitter Threat Countdown**: 5-second countdown before posting to Twitter
    - Warning message: "I'm going to post an embarrassing message in 5 seconds if you don't wake up"
    - Countdown numbers: 5, 4, 3, 2, 1
    - Final message: "posted to Twitter loser"
- **Cancel Functionality**: Cancel countdowns to stop threats (but it's too late!)
- **Visual Warnings**: Purple-themed warning boxes before escalation

### 👤 **User Onboarding**
- **Multi-Step Onboarding Popup**: Beautiful 6-step setup flow for first-time users
  1. Basic Information (name, gender)
  2. Contact Information (email, phone)
  3. Crush Information (crush phone number)
  4. Social Media Settings (Twitter handle, threat toggles)
  5. Voice Language Selection
  6. Text Language Selection
- **Validation**: Real-time validation with error messages
- **Progress Indicator**: Visual progress bar showing setup completion
- **Auto-Fill Settings**: Onboarding data automatically fills settings page

### ⚙️ **Settings & Configuration**
- **Comprehensive Settings Page**: Full-featured settings with all options
- **User Profile**: Name, gender, email, phone number
- **Crush Settings**: Crush phone number for SMS threats
- **Social Media**: Twitter handle for embarrassing posts
- **Threat Toggles**: Enable/disable SMS and social media threats
- **Language Selection**: Separate dropdowns for voice and text languages
- **Validation**: Error alerts if required fields are missing when threats are enabled
- **Settings Reset**: Clear all settings and return to onboarding

### 📱 **Mobile Optimizations**
- **Touch-Friendly**: All buttons meet 44x44px minimum touch target size
- **Responsive Text**: Text scales appropriately on all screen sizes
- **Mobile Layouts**: Forms stack vertically on mobile, horizontal on desktop
- **Full-Screen Popups**: Countdown popups are optimized for mobile screens
- **Viewport Meta Tag**: Proper scaling and zoom settings

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework with custom purple theme
- **React Hot Toast** - Beautiful toast notifications
- **Local Storage** - Client-side data persistence for settings, alarms, and sleep stats
- **Date/Time Utilities** - Custom utilities for alarm time calculations

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
│   ├── layout.tsx           # Root layout with viewport meta
│   └── globals.css          # Global styles and purple theme
├── components/              # React components
│   ├── AudioPlayer.tsx      # ElevenLabs audio playback
│   ├── AlarmSound.tsx       # Continuous alarm sound
│   ├── RoastDisplay.tsx     # AI roast display
│   ├── SnoozeCounter.tsx    # Snooze counter & escalation
│   ├── SocialMediaThreat.tsx # Social media warnings
│   ├── CrushTextCountdown.tsx # Crush text countdown popup
│   ├── TwitterThreatCountdown.tsx # Twitter countdown popup
│   ├── SleepStats.tsx       # Sleep statistics with circular progress
│   └── OnboardingPopup.tsx  # Multi-step onboarding flow
├── lib/                     # Utilities
│   ├── api.ts              # API client for backend calls
│   ├── storage.ts          # LocalStorage utilities
│   ├── utils.ts            # Helper functions (time, formatting)
│   └── translations.ts     # Translation system for UI text
└── package.json
```

## Usage

### Setting an Alarm

1. Navigate to the main page
2. Set an alarm time using the time picker (no date needed - automatically sets for today or tomorrow)
3. Click "Set Alarm"
4. See countdown showing minutes until alarm
5. View alarm in "Previous Alarms" section for easy reuse

### Snoozing

1. When the alarm goes off, you'll hear the alarm sound and see the wake-up interface
2. Enter an excuse (required) - the AI will analyze it
3. Click "SNOOZE" - the AI will generate a roast based on your excuse
4. The alarm will continue after the roast
5. Each snooze increases the threat level

### Escalation Flow

- **1-2 snoozes**: Mild roasts (purple theme)
- **3 snoozes**: 
  - Warning appears: "Next snooze will text your crush!"
  - If you snooze again: 5-second countdown → Text sent to crush with romantic message + 8 random emojis
- **4 snoozes**: Warning appears: "Next snooze will post to Twitter!"
- **5 snoozes**: 
  - 5-second countdown → Post embarrassing tweet to Twitter/X
  - Message: "eat, sleep, repeat" with timestamp

### Viewing Settings

1. Click the "Settings" button (top right)
2. Configure:
   - **User Info**: Name, gender, email, phone number
   - **Crush Info**: Crush phone number (required if SMS threats enabled)
   - **Social Media**: Twitter handle (required if social media threats enabled)
   - **Threat Toggles**: Enable/disable SMS and social media threats
   - **Voice Language**: Language for voice messages (29+ languages)
   - **Text Language**: Language for UI text (6 languages)
3. Click "Save Settings" to save

### Sleep Statistics

- View sleep stats at the bottom of the home page
- Each stat shows in a circular progress indicator
- Complete ring = 8+ hours of sleep
- Stats include:
  - Average hours slept
  - Good sleep days
  - Current streak
  - Total sessions
  - Total snoozes
  - Average snoozes

### Onboarding

- First-time users see a multi-step onboarding popup
- Complete all steps to set up your profile
- Settings are automatically filled from onboarding
- Can skip steps, but required fields must be filled if threats are enabled
- After completion, popup disappears and you see the main screen

## Integration Points

### AI & Voice Backend

The frontend calls the Python backend for:
- **Alarm Trigger**: `POST /alarm/trigger` (with language parameter)
- **Snooze Handling**: `POST /snooze` (with language parameter)
- **Countdown Audio**: `POST /countdown/audio` (for threat countdowns)
- **Audio Files**: Receives base64-encoded audio data

### Social Media Backend (Cloudflare Worker)

The frontend notifies the social backend:
- **Snooze Events**: `POST /snooze/event` (when thresholds are reached)
- **Crush Text**: Automatically triggered at snooze 3
- **Twitter Post**: Automatically triggered at snooze 5

## Escalation Levels

The frontend visualizes escalation based on snooze count (all in purple theme):

- **Mild (1-2 snoozes)**: 😊 Light purple - Playful messages
- **Moderate (3-4 snoozes)**: 😐 Medium purple - Pointed sarcasm
- **Aggressive (5-6 snoozes)**: 😠 Dark purple - Harsh calls to action
- **Nuclear (7+ snoozes)**: 💀 Very dark purple - Brutal roasts with social media posts

## Escalation Thresholds

- **3 snoozes**: SMS threat via Twilio (text crush with romantic message + 8 random emojis)
- **5 snoozes**: Post embarrassing tweet to Twitter/X ("eat, sleep, repeat" with timestamp)

## Mobile Responsive

The frontend is fully responsive and optimized for mobile devices:
- **Touch-Friendly**: All buttons meet 44x44px minimum touch target
- **Responsive Layouts**: Forms stack on mobile, horizontal on desktop
- **Mobile-First Design**: Optimized for phone alarms
- **Viewport Meta Tag**: Proper scaling and zoom
- **Full-Screen Popups**: Countdown popups optimized for mobile
- **Responsive Text**: Text scales appropriately on all screen sizes

## Internationalization

### Voice Languages (29+)
- English, Spanish, French, German, Italian, Portuguese
- Polish, Turkish, Russian, Dutch, Czech
- Arabic, Chinese, Japanese, Hungarian, Korean
- And more via ElevenLabs multilingual model

### Text Languages (6)
- English, Spanish, French, German, Italian, Portuguese

### How It Works
1. User selects voice language in settings
2. User selects text language in settings (or onboarding)
3. All UI text is translated using the translation system
4. Alarm messages and roasts are translated by the backend
5. Voice speaks in the selected language
6. Dates are formatted according to text language locale

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

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_BACKEND_URL` - Your Python backend URL
   - `NEXT_PUBLIC_SOCIAL_BACKEND_URL` - Your Cloudflare Worker URL
4. Deploy!

The frontend is fully optimized for Vercel deployment with:
- Static generation where possible
- Client-side rendering for dynamic content
- Proper viewport and mobile optimizations

## Troubleshooting

### Backend Connection Issues

- Verify that `NEXT_PUBLIC_BACKEND_URL` points to the Python backend
- Verify that `NEXT_PUBLIC_SOCIAL_BACKEND_URL` points to the Cloudflare Worker
- Check that both backends are running
- Check browser console for CORS errors

### Audio Playback Issues

- Ensure the backend is serving audio files correctly
- Check browser console for CORS errors
- Verify that the audio URL is correct
- Check that audio is base64-encoded correctly

### Settings Not Saving

- Check browser localStorage permissions
- Verify that the browser allows localStorage
- Check browser console for errors
- Try clearing browser cache

### Language Not Changing

- Verify settings are saved correctly
- Check that language parameter is being sent to backend
- Refresh page after changing language
- Check browser console for API errors

### Hydration Errors

- These are normal during development
- The app uses client-side rendering for dynamic content
- All components handle SSR properly with safe defaults

## License

MIT

## Authors

ALEEZA + Carmen
