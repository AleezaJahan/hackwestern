# Fix Twitter App Permissions

## Current Error
```
"Your client app is not configured with the appropriate oauth1 app permissions for this endpoint."
```

## Solution: Enable "Read and Write" Permissions

### Step 1: Go to Twitter Developer Portal
1. Visit: https://developer.twitter.com/en/portal/dashboard
2. Sign in with your Twitter account
3. Click on your app

### Step 2: Change App Permissions
1. Go to **"Settings"** tab (or look for "User authentication settings")
2. Scroll down to **"App permissions"** section
3. Change from **"Read"** to **"Read and Write"**
4. Click **"Save"**

### Step 3: Regenerate Access Tokens (REQUIRED!)
After changing permissions, you MUST regenerate your tokens:

1. Go to **"Keys and tokens"** tab
2. Under **"Authentication Tokens"** section:
   - Click **"Regenerate"** for **Access Token**
   - Copy the new Access Token
   - Click **"Regenerate"** for **Access Token Secret**
   - Copy the new Access Token Secret

### Step 4: Update `.dev.vars`
Update `backend-social/.dev.vars` with the NEW tokens:

```bash
TWITTER_ACCESS_TOKEN=your_new_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_new_access_token_secret_here
```

### Step 5: Restart Backend
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
# Press Ctrl+C to stop, then:
npx wrangler dev
```

### Step 6: Test Again
```bash
curl -X POST http://localhost:8787/social/twitter/post \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "message": "eat, sleep, repeat", "force": true}'
```

## Important Notes

- **You MUST regenerate tokens** after changing permissions - old tokens won't work
- The API Key and API Secret stay the same - only Access Token and Access Token Secret change
- After updating `.dev.vars`, always restart `wrangler dev`

