# Debug Twitter Posting

## Step 1: Check if Backend is Running

```bash
curl http://localhost:8787/health
```

**Expected**: Should return JSON with `"status": "ok"`

**If it fails**: Start the backend:
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
npx wrangler dev
```

## Step 2: Check if Credentials are Loaded

Look at the `wrangler dev` terminal output. When the server starts, you should see:

```
🐦 TwitterService initialized:
🐦 OAuth 1.0a credentials present: true
🐦 Bearer Token present: true
🐦 Can post tweets: true
🐦 Is configured: true
```

**If you see `false` for OAuth 1.0a credentials**:
- Check `.dev.vars` file exists in `backend-social/` directory
- Make sure all 4 credentials are there (no extra spaces)
- Restart `wrangler dev`

## Step 3: Test Twitter Posting

### Option A: Use the test script
```bash
cd "/Users/parimehla/Desktop/Hack Western/hackwestern/backend-social"
./test-twitter.sh
```

### Option B: Manual test
```bash
curl -X POST http://localhost:8787/social/twitter/post \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "message": "eat, sleep, repeat", "force": true}'
```

## Step 4: Check the Logs

In your `wrangler dev` terminal, you should see:

**If OAuth 1.0a is working:**
```
🐦 Checking credentials:
🐦 API Key: PRESENT
🐦 API Secret: PRESENT
🐦 Access Token: PRESENT
🐦 Access Token Secret: PRESENT
🐦 Using OAuth 1.0a authentication
🐦 OAuth header generated: YES
```

**If successful:**
```
🐦 Response status: 201
🐦 Response ok: true
🐦 Tweet posted successfully: {...}
```

**If there's an error:**
```
🐦 Response status: 403 (or 401)
🐦 Twitter API error response: {...}
```

## Common Errors and Fixes

### Error: "Your client app is not configured with the appropriate oauth1 app permissions"
**Fix**: 
1. Go to Twitter Developer Portal → Your App → Settings
2. Change App permissions to "Read and Write"
3. **Regenerate Access Token and Access Token Secret**
4. Update `.dev.vars` with new tokens
5. Restart `wrangler dev`

### Error: "Invalid or expired token"
**Fix**: 
- Regenerate Access Token and Access Token Secret
- Update `.dev.vars`
- Restart `wrangler dev`

### Error: "OAuth 1.0a credentials present: false"
**Fix**:
- Check `.dev.vars` file is in `backend-social/` directory
- Make sure all 4 credentials are there:
  - `TWITTER_API_KEY=...`
  - `TWITTER_API_SECRET=...`
  - `TWITTER_ACCESS_TOKEN=...`
  - `TWITTER_ACCESS_TOKEN_SECRET=...`
- No extra spaces or quotes
- Restart `wrangler dev`

### Error: Connection refused / Can't connect
**Fix**:
- Make sure `wrangler dev` is running
- Check it's running on port 8787
- Try: `curl http://localhost:8787/health`

## Success Indicators

✅ **Success looks like:**
```json
{
  "success": true,
  "tweet_id": "1234567890",
  "url": "https://twitter.com/i/web/status/1234567890",
  "message": "Tweet posted successfully"
}
```

❌ **Failure looks like:**
```json
{
  "success": false,
  "message": "Failed to post tweet: Twitter API error: ..."
}
```

## Next Steps After Success

Once the test works:
1. Snooze 5 times in your app
2. The system will automatically post "eat, sleep, repeat" to Twitter
3. Check your Twitter account to see the tweet!

