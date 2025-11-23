# Debugging SMS to Mom 📱

## Issue: Text not being sent after 3 snoozes

### Step 1: Check if Twilio is Configured

The Twilio credentials are currently commented out in `.dev.vars`. You need to:

1. **Get Twilio credentials** (if you don't have them):
   - Sign up at https://www.twilio.com/
   - Get your Account SID, Auth Token, and Phone Number

2. **Add to `.dev.vars` file**:
   ```bash
   cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
   ```

   Edit `.dev.vars` and uncomment/add:
   ```
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

3. **Restart Person 4 backend** after adding credentials

### Step 2: Check Mom's Phone Number in Settings

1. Open frontend: http://localhost:3000
2. Go to Settings page
3. Make sure "Mom's Phone Number" is filled in and saved
4. Format: 10 digits (e.g., "1234567890")

### Step 3: Check Backend Logs

When you snooze 3 times, check the Person 4 backend terminal for logs like:
- `🔔 Snooze event received:` - Shows if mom_phone_number is being passed
- `📱 Sending text to mom at snooze 3` - Shows if the function is being called
- `📱 SMS send result:` - Shows the result

### Step 4: Test Manually

Test the SMS endpoint directly:

```bash
curl -X POST http://localhost:8787/snooze/event \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "snooze_count": 3,
    "wake_up_time": "2024-11-22T10:00:00Z",
    "mom_phone_number": "1234567890"
  }'
```

Check the response and logs.

### Common Issues:

1. **Twilio not configured** → Returns mock response (won't actually send SMS)
2. **Mom's phone number not saved** → Check Settings page
3. **Phone number format wrong** → Should be 10 digits (will auto-format to +1XXXXXXXXXX)
4. **Backend not receiving mom_phone_number** → Check frontend is passing it

### Quick Fix (Without Twilio - for testing):

If you don't have Twilio set up, the system will return a mock response. You'll see in logs:
```
⚠️ Twilio not configured. Returning mock response.
```

This means the logic is working, but you need Twilio credentials to actually send SMS.

