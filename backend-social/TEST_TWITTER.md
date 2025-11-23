# Test Twitter Posting

## Quick Test Commands

### Test 1: Direct Twitter Post (Test Endpoint)
```bash
curl -X POST http://localhost:8787/social/twitter/post \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "message": "eat, sleep, repeat",
    "force": true
  }'
```

### Test 2: Test via Snooze Event (Full Flow)
```bash
curl -X POST http://localhost:8787/snooze/event \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "snooze_count": 5,
    "wake_up_time": "2024-11-22T10:00:00Z"
  }'
```

## Check Logs

When you run the test, check the terminal where `wrangler dev` is running. You should see:
- `🐦 TwitterService initialized:` - Shows if Bearer Token is loaded
- `🐦 Snooze X reached Twitter threshold` - Shows escalation triggered
- `🐦 Attempting to post tweet:` - Shows the API call
- `🐦 Response status:` - Shows HTTP status code
- `🐦 Twitter API error response:` - Shows any errors

## Common Issues

1. **Bearer Token not loaded**: Check `.dev.vars` file and restart `wrangler dev`
2. **401 Unauthorized**: Bearer Token might be invalid or expired
3. **403 Forbidden**: Bearer Token might not have write permissions
4. **429 Too Many Requests**: Rate limit exceeded

## Verify Bearer Token

The Bearer Token should be in `.dev.vars`:
```
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAG5O5gEAAAAA8ZmXQXxoUyUvzm5oz8e9R101NhM=knKVpbzDXvd2foZRZaQIGdpdOxy6hTnzw8czauSDGe4tYDDwNL
```

Make sure:
- No extra spaces
- Token is on one line
- Restart `wrangler dev` after changing `.dev.vars`

