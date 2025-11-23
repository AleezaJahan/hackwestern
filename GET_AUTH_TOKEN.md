# How to Get Your Twilio Auth Token 🔑

## Quick Steps:

1. **Go to Twilio Console**: https://console.twilio.com/

2. **Find Your Auth Token**:
   - On the dashboard, you'll see your **Account SID** (starts with `AC...`)
   - Right next to it, you'll see **Auth Token** (it's hidden by default)
   - Click the **eye icon** or **"show"** button to reveal it
   - It will look something like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

3. **Copy the Auth Token**:
   - Click the copy icon next to it
   - Or select and copy it manually

4. **Update `.dev.vars` file**:
   ```bash
   cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
   nano .dev.vars
   ```
   
   Replace this line:
   ```
   TWILIO_AUTH_TOKEN=REPLACE_WITH_YOUR_ACTUAL_AUTH_TOKEN
   ```
   
   With your real token:
   ```
   TWILIO_AUTH_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```
   (Use your actual token, not this example!)

5. **Save and restart backend**:
   - Save the file (Ctrl+X, then Y, then Enter in nano)
   - Restart Person 4 backend (Ctrl+C, then `npm run dev`)

## Visual Guide:

```
Twilio Console Dashboard:
┌─────────────────────────────────────┐
│ Account SID: ACbe8fa767e16e5c0... │
│ Auth Token:  [👁️ show] a1b2c3...  │ ← Click the eye icon!
└─────────────────────────────────────┘
```

## Important Notes:

- ⚠️ **Keep your Auth Token secret!** Don't share it or commit it to git
- ✅ The `.dev.vars` file is already in `.gitignore`, so it won't be committed
- ✅ Auth Token is case-sensitive - copy it exactly
- ✅ No spaces before or after the token

## After Adding Token:

1. Restart Person 4 backend
2. Test by snoozing 3 times
3. Check backend logs for: `💕 SMS send result: { success: true, ... }`

