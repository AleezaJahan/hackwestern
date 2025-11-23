# Twilio Setup Guide 📱

## Step 1: Sign Up for Twilio (If You Don't Have an Account)

1. Go to https://www.twilio.com/
2. Click "Sign Up" (free trial available)
3. Verify your phone number
4. Complete the signup process

## Step 2: Get Your Twilio Credentials

Once logged into Twilio Console:

1. **Account SID & Auth Token**:
   - Go to: https://console.twilio.com/
   - Your **Account SID** is on the dashboard (starts with `AC...`)
   - Your **Auth Token** is also on the dashboard (click "show" to reveal it)
   - ⚠️ Keep these secret!

2. **Get a Phone Number**:
   - Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
   - Click "Get a number" (or use existing if you have one)
   - Choose a number (free trial numbers work)
   - Copy the phone number (format: +1234567890)

## Step 3: Add Credentials to Your Project

1. **Open the `.dev.vars` file**:
   ```bash
   cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
   nano .dev.vars
   # Or use any text editor
   ```

2. **Uncomment and fill in the Twilio credentials**:
   ```bash
   # Twilio Configuration (for SMS)
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

   Replace:
   - `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your Account SID
   - `your_auth_token_here` with your Auth Token
   - `+1234567890` with your Twilio phone number (include the + and country code)

3. **Save the file**

## Step 4: Restart the Person 4 Backend

After adding credentials, restart the backend:

```bash
# Stop the current backend (Ctrl+C in the terminal)
# Then restart:
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
npm run dev
```

## Step 5: Test It

1. **Set mom's phone number in frontend**:
   - Go to http://localhost:3000/settings
   - Add mom's phone number (10 digits, e.g., "1234567890")
   - Save settings

2. **Test by snoozing 3 times**:
   - Set an alarm
   - Snooze 3 times
   - Check if mom receives the text: "degenerate is not waking up"

3. **Or test manually**:
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

## Troubleshooting

### Issue: "Twilio not configured"
- Make sure `.dev.vars` file has the credentials (not commented out)
- Make sure you restarted the backend after adding credentials
- Check the file path: `backend-social/.dev.vars`

### Issue: "Invalid phone number"
- Make sure mom's phone number is 10 digits (US format)
- The system will auto-format to +1XXXXXXXXXX
- For international numbers, include country code

### Issue: "Authentication failed"
- Double-check your Account SID and Auth Token
- Make sure there are no extra spaces in `.dev.vars`
- Auth Token is case-sensitive

### Issue: "SMS not sending"
- Check Twilio console for error logs: https://console.twilio.com/us1/monitor/logs
- Free trial accounts have limitations
- Make sure your Twilio account has credits

## Free Trial Limitations

Twilio free trial:
- Can only send SMS to verified phone numbers (your own)
- Limited credits
- To send to any number, upgrade your account

**For testing**: Verify mom's phone number in Twilio console first:
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Add mom's phone number
3. Verify it via SMS code

## Quick Reference

**File to edit**: `backend-social/.dev.vars`

**Format**:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Restart backend after changes!**

