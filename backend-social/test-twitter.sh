#!/bin/bash

# Test Twitter Posting Script
# This script tests the Twitter posting endpoint

echo "🧪 Testing Twitter Posting..."
echo ""

# Test the endpoint
response=$(curl -s -X POST http://localhost:8787/social/twitter/post \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user", "message": "eat, sleep, repeat", "force": true}')

echo "Response:"
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""

# Check if successful
if echo "$response" | grep -q '"success":true'; then
  echo "✅ SUCCESS! Tweet posted!"
  echo ""
  tweet_url=$(echo "$response" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
  if [ ! -z "$tweet_url" ]; then
    echo "Tweet URL: $tweet_url"
  fi
else
  echo "❌ FAILED! Check the error message above."
  echo ""
  echo "Common issues:"
  echo "1. Backend not running? Check: curl http://localhost:8787/health"
  echo "2. Credentials not loaded? Restart: npx wrangler dev"
  echo "3. Wrong permissions? Make sure app has 'Read and Write' permissions"
  echo "4. Tokens not regenerated? Regenerate Access Token after changing permissions"
fi

