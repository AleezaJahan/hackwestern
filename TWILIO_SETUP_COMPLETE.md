# Twilio Setup Status ✅

## What's Configured

✅ **Account SID**: `ACbe8fa767e16e5c0afcf0ff655ab3e792`  
✅ **Auth Token**: `15fdca6cb3fc771f772cb3e86a7a6a0c`

## What You Need to Add

### 1. Get Your Twilio Phone Number

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers** → **Manage** → **Active numbers**
3. Copy your Twilio phone number (format: `+1234567890`)
4. Add it to `.dev.vars`:

```bash
cd backend-social
nano .dev.vars
```

Uncomment and update this line:
```
TWILIO_PHONE_NUMBER=+1234567890  # Replace with your actual Twilio number
```

### 2. Restart the Backend

After adding the phone number:
```bash
# Stop the backend (Ctrl+C or kill the process)
# Then restart:
cd backend-social
npm run dev
```

## Testing Twilio

### Test 1: Direct SMS Test

```bash
curl -X POST http://localhost:8787/social/sms/threat \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "message": "🧪 Test SMS from Passive-Aggressive Alarm Clock!",
    "snooze_count": 3
  }'
```

**Note:** This requires the user to have a phone number configured in the database.

### Test 2: Via Snooze Event (Full Flow)

The system automatically sends SMS at snooze threshold 3:

```bash
curl -X POST http://localhost:8787/snooze/event \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "snooze_count": 3,
    "wake_up_time": "2024-11-23T10:00:00Z",
    "phone_number": "+1234567890"
  }'
```

### Test 3: Update User with Phone Number First

```bash
# First, create/update user with phone number
curl -X POST http://localhost:8787/snooze/event \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "snooze_count": 1,
    "wake_up_time": "2024-11-23T10:00:00Z"
  }'

# Then test SMS (user will have phone_number from previous call if you set it in settings)
```

## How It Works

1. **Snooze Count 3**: Sends SMS threat to user's phone number
2. **Snooze Count 5**: Posts to Twitter
3. **Snooze Count 7+**: Nuclear option - posts embarrassing stats

## Troubleshooting

### "User has no phone number configured"
- The user needs to have a `phone_number` set in their settings
- This is typically set in the frontend settings page

### "Neither phone number nor messaging service SID configured"
- Make sure `TWILIO_PHONE_NUMBER` is set in `.dev.vars`
- Restart the backend after adding it

### "Twilio API error"
- Verify your Account SID and Auth Token are correct
- Check that your Twilio account has sufficient credits
- Ensure the phone number is verified in Twilio Console

## Current Configuration

All credentials are in: `backend-social/.dev.vars`

**Next Step:** Add your Twilio phone number to complete the setup!

