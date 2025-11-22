# Backend & Social Media Chaos ⚙️

**Person 4: Backend & Social Media Integration**

This Cloudflare Worker handles serverless logic, database operations, Twitter/X API integration, escalation logic, and SMS threats via Twilio.

## Features

- ✅ **Cloudflare Workers** for serverless logic
- ✅ **Simple JSON Storage** (no external database required!) - Perfect for hackathons
  - Uses in-memory storage by default (resets on restart)
  - Optional: Workers KV for persistence (one command to set up)
- ✅ **Twitter/X API Integration** for posting threats and embarrassing stats
- ✅ **Escalation Logic** (snooze thresholds → action triggers)
- ✅ **Authentication & User Data Management**
- ✅ **SMS Threats via Twilio** for extra chaos
- ✅ **Integration** with Person 1 and Person 2 backends

## Architecture

```
Alarm triggers → ElevenLabs generates snarky voice message
    ↓
User hits snooze → Gemini API analyzes excuse + generates roast
    ↓
Multiple snoozes → Cloudflare Worker triggers social media threat
    ↓
Final snooze → Actually posts embarrassing wake-up stats
```

## Setup

### 1. Install Dependencies

```bash
cd backend-social
npm install
```

### 2. Configure Storage (Optional)

**For Hackathon Demo (No Setup Required!):**
- Uses in-memory storage by default
- Data resets on restart (perfect for demos)
- Zero configuration needed! 🎉

**For Persistent Storage (Optional):**
```bash
# Create Workers KV namespace (one-time setup)
wrangler kv:namespace create "DB_KV"

# This will output a namespace ID. Add it to wrangler.toml:
# [vars]
# DB_KV = "your_namespace_id"
```

### 2. Configure Environment Variables (Optional)

Only needed if you want Twitter/SMS features:

```bash
# Twitter/X API (optional - uses mock responses if not set)
wrangler secret put TWITTER_BEARER_TOKEN
wrangler secret put TWITTER_API_KEY
wrangler secret put TWITTER_API_SECRET
wrangler secret put TWITTER_ACCESS_TOKEN
wrangler secret put TWITTER_ACCESS_TOKEN_SECRET

# Twitter/X API (for posting threats)
wrangler secret put TWITTER_API_KEY
wrangler secret put TWITTER_API_SECRET
wrangler secret put TWITTER_ACCESS_TOKEN
wrangler secret put TWITTER_ACCESS_TOKEN_SECRET
wrangler secret put TWITTER_BEARER_TOKEN

# Twilio (for SMS threats)
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put TWILIO_PHONE_NUMBER

# Integration URLs
wrangler secret put PERSON1_BACKEND_URL
wrangler secret put PERSON2_BACKEND_URL

# Optional: OpenRouter (fallback AI)
wrangler secret put OPENROUTER_API_KEY
```

Or update `wrangler.toml` directly with your values (not recommended for secrets).

### 3. No Database Setup Needed! 🎉

**That's it!** The simple JSON storage works out of the box.

- ✅ No external database setup
- ✅ No schema migrations
- ✅ No configuration needed
- ✅ Perfect for hackathon demos!

Data is stored in memory (or Workers KV if configured).

### 4. Deploy

```bash
# Development
npm run dev

# Production
npm run deploy
```

## API Endpoints

### Health Check

```http
GET /health
```

Returns service status and health information.

### Snooze Event (from Person 1)

```http
POST /snooze/event
Content-Type: application/json

{
  "user_id": "user123",
  "snooze_count": 3,
  "excuse": "Just 5 more minutes",
  "transcribed_excuse": "just five more minutes",
  "alarm_time": "2024-01-01T08:00:00Z",
  "wake_up_time": "2024-01-01T08:15:00Z",
  "sentiment": { "score": 0.2, "label": "negative" },
  "legitimacy_score": 15.5
}
```

Records a snooze event and triggers escalation logic based on thresholds.

### Snooze Count Notification

```http
POST /snooze/count
Content-Type: application/json

{
  "user_id": "user123",
  "snooze_count": 5,
  "wake_up_time": "2024-01-01T08:15:00Z"
}
```

Checks if social media threat should be triggered.

### Force Escalation

```http
POST /escalate
Content-Type: application/json

{
  "user_id": "user123",
  "snooze_count": 7,
  "action_type": "twitter_post"  // or "sms", "twitter_threat", "nuclear", "auto"
}
```

Forces escalation to a specific action.

### Post to Twitter

```http
POST /social/twitter/post
Content-Type: application/json

{
  "user_id": "user123",
  "message": "Your custom tweet message",
  "snooze_count": 7,
  "force": false  // Set to true to post even without Twitter handle
}
```

Executes a Twitter post and records it in the database.

### Send SMS Threat

```http
POST /social/sms/threat
Content-Type: application/json

{
  "user_id": "user123",
  "message": "Your SMS threat message",
  "snooze_count": 3
}
```

Sends an SMS threat via Twilio.

### Get User Stats

```http
GET /user/stats?user_id=user123&date=2024-01-01
```

Returns embarrassing stats for a user.

### Get User Excuses

```http
GET /user/excuses?user_id=user123&limit=5
```

Returns top excuses for a user.

### Get Snooze History

```http
GET /user/history?user_id=user123&limit=10
```

Returns snooze history for a user.

## Escalation Thresholds

The system uses the following thresholds:

- **3 snoozes**: Send SMS threat
- **5 snoozes**: Generate social media threat (but don't post yet)
- **7 snoozes**: Actually post to Twitter
- **10 snoozes**: Nuclear option - Post embarrassing stats

These thresholds can be customized in `src/escalation.js`.

## Integration Points

### Person 1 (Alarm Trigger Backend)

Person 1 should send snooze events to:
```
POST /snooze/event
```

### Person 2 (AI & Voice Integration)

This backend coordinates with Person 2 on roast intensity by sending:
```
POST {PERSON2_BACKEND_URL}/roast/intensity
```

## Storage Structure

The simple storage includes the following data structures:

- **users**: User authentication and profile data (stored by user_id)
- **snooze_history**: Array of all snooze events
- **excuse_patterns**: Array of excuse patterns
- **embarrassing_stats**: Daily stats indexed by user_id-date
- **social_media_posts**: Array of all social media posts
- **escalation_triggers**: Array of escalation action logs

**Debug Endpoint:**
- `GET /debug/export` - Export all data (useful for debugging)

## Development

```bash
# Start local development server
npm run dev

# Deploy to Cloudflare Workers
npm run deploy
```

## Troubleshooting

### Twitter API Not Working

- Make sure you have valid Twitter API v2 credentials
- Check that your Bearer token has the right permissions
- For OAuth 1.0a, you may need to install additional libraries

### Twilio SMS Not Sending

- Verify your Twilio credentials are correct
- Check that your Twilio phone number is verified
- Ensure the destination phone number is in E.164 format (+1234567890)

### Storage Issues

- In-memory storage: Data resets on restart (this is normal!)
- Workers KV: Verify namespace ID is correct in wrangler.toml
- Check `/debug/export` endpoint to see current data

## License

MIT

## Authors

Carmen + paridhi

