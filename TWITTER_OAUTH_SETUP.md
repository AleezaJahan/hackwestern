# Twitter OAuth 1.0a Setup Guide

## Problem
Bearer Tokens (OAuth 2.0 Application-Only) **cannot post tweets**. Twitter requires **OAuth 1.0a User Context** to post tweets.

## Solution: Get OAuth 1.0a Credentials

### Step 1: Go to Twitter Developer Portal
1. Visit: https://developer.twitter.com/en/portal/dashboard
2. Sign in with your Twitter account

### Step 2: Create/Select an App
1. Click on your app (or create a new one)
2. Go to "Keys and tokens" tab

### Step 3: Get Your Credentials
You need **4 values**:

1. **API Key** (Consumer Key)
   - Found under "Consumer Keys"
   - Click "Regenerate" if needed
   - Copy the "API Key"

2. **API Secret** (Consumer Secret)
   - Found under "Consumer Keys"
   - Click "Regenerate" if needed
   - Copy the "API Secret"

3. **Access Token**
   - Found under "Authentication Tokens"
   - Click "Generate" if you don't have one
   - Copy the "Access Token"

4. **Access Token Secret**
   - Found under "Authentication Tokens"
   - Click "Generate" if you don't have one
   - Copy the "Access Token Secret"

### Step 4: Update `.dev.vars`

Add these to your `backend-social/.dev.vars` file:

```bash
# Twitter OAuth 1.0a Credentials (REQUIRED for posting tweets)
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here

# Bearer Token (optional - for read-only operations)
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAG5O5gEAAAAA8ZmXQXxoUyUvzm5oz8e9R101NhM=knKVpbzDXvd2foZRZaQIGdpdOxy6hTnzw8czauSDGe4tYDDwNL
```

### Step 5: Restart Backend

```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
# Press Ctrl+C to stop, then:
npx wrangler dev
```

### Step 6: Test

```bash
curl -X POST http://localhost:8787/social/twitter/post \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "message": "eat, sleep, repeat", "force": true}'
```

## Important Notes

- **Bearer Token alone cannot post tweets** - it's read-only
- **OAuth 1.0a is required** for posting tweets
- Make sure your Twitter app has **Read and Write** permissions
- The tweet will post to the Twitter account associated with the Access Token

## Fix App Permissions (IMPORTANT!)

### Error: "Your client app is not configured with the appropriate oauth1 app permissions"

This means your Twitter app needs **"Read and Write"** permissions. Here's how to fix it:

1. **Go to Twitter Developer Portal**: https://developer.twitter.com/en/portal/dashboard
2. **Click on your app**
3. **Go to "Settings" tab** (or "User authentication settings")
4. **Find "App permissions"** section
5. **Change from "Read" to "Read and Write"**
6. **Click "Save"**
7. **IMPORTANT**: After changing permissions, you MUST regenerate your Access Token and Access Token Secret:
   - Go to "Keys and tokens" tab
   - Under "Authentication Tokens", click "Regenerate" for both:
     - Access Token
     - Access Token Secret
   - Copy the new tokens
8. **Update `.dev.vars`** with the new Access Token and Access Token Secret
9. **Restart `wrangler dev`**

## Troubleshooting

### "Invalid or expired token"
- Regenerate your Access Token and Access Token Secret
- Make sure you copied the full token (they're long!)

### "Your client app is not configured with the appropriate oauth1 app permissions"
- **This is the current issue!** Follow the steps above to enable "Read and Write" permissions
- After changing permissions, you MUST regenerate Access Token and Access Token Secret

### "Forbidden"
- Check that your app has "Read and Write" permissions
- Go to your app settings → User authentication settings → App permissions

### "Unauthorized"
- Double-check all 4 credentials are correct
- Make sure there are no extra spaces in `.dev.vars`
- Restart `wrangler dev` after updating `.dev.vars`

