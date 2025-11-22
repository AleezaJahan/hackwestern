# ElevenLabs Integration Explanation 🎤

## Quick Answer

**Person 4 does NOT directly use ElevenLabs.** Person 4 coordinates with **Person 2's backend**, which uses ElevenLabs for voice generation.

---

## The Flow

### Who Uses ElevenLabs?

✅ **Person 2's Backend** (AI & Voice Integration) - Uses ElevenLabs directly
❌ **Person 4's Backend** (Social Media Chaos) - Does NOT use ElevenLabs

### How Person 4 Coordinates with Person 2

```
┌─────────────────────────────────────────────────────────────┐
│ Person 4: Social Media Backend (NO ElevenLabs)              │
│                                                              │
│  When snooze_count >= 3:                                    │
│  └─> Calls Person 2's /roast/intensity endpoint            │
│      └─> "Hey Person 2, escalate roast intensity!"         │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Person 2: AI & Voice Backend (USES ElevenLabs)              │
│                                                              │
│  When called by Person 1 (Frontend):                        │
│  └─> POST /snooze                                           │
│      └─> Gemini generates roast based on snooze_count       │
│      └─> ElevenLabs generates voice from roast              │
│          └─> Uses snooze_count to adjust voice intensity    │
│              • Mild (1-2): Friendly tone                    │
│              • Moderate (3-4): Sarcastic tone               │
│              • Aggressive (5-6): Harsh tone                 │
│              • Nuclear (7+): Brutal tone                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Flow

### 1. Initial Alarm Trigger
```
Person 1 (Frontend)
  └─> POST Person 2's /alarm/trigger { snooze_count: 0 }
      └─> Person 2 generates friendly wake-up message
      └─> Person 2 uses ElevenLabs to generate voice
      └─> Returns audio file URL
```

### 2. User Snoozes with Excuse
```
Person 1 (Frontend)
  └─> POST Person 2's /snooze { 
        excuse: "Just 5 more minutes", 
        snooze_count: 3 
      }
      └─> Person 2's Gemini analyzes excuse
      └─> Person 2's Gemini generates roast
      └─> Person 2's ElevenLabs generates voice (moderate intensity)
      └─> Person 2 notifies Person 4 (if snooze_count >= 5)
```

### 3. Person 4 Receives Snooze Event
```
Person 2 (after generating voice)
  └─> POST Person 4's /snooze/event {
        user_id: "...",
        snooze_count: 5,
        excuse: "..."
      }
      └─> Person 4 records in database
      └─> Person 4 checks thresholds
      └─> Person 4 triggers social media threat (>= 5 snoozes)
      └─> Person 4 coordinates with Person 2 for escalation
```

### 4. Person 4 Coordinates Escalation
```
Person 4 (when snooze_count >= 3)
  └─> POST Person 2's /roast/intensity {
        user_id: "...",
        snooze_count: 5,
        recommended_intensity: "aggressive"
      }
      └─> Person 2 acknowledges escalation level
      └─> Next time Person 2 generates a roast, 
          it will use the escalated intensity with ElevenLabs
```

---

## Important Points

### Person 4's Role:
- ❌ Does NOT generate voice messages
- ❌ Does NOT use ElevenLabs
- ✅ Records snooze events in database
- ✅ Triggers social media threats (Twitter/SMS)
- ✅ Coordinates with Person 2 on escalation

### Person 2's Role:
- ✅ Generates roasts using Gemini
- ✅ Generates voice using ElevenLabs
- ✅ Adjusts voice intensity based on snooze_count
- ✅ Notifies Person 4 when thresholds are met

---

## Code Locations

### Person 4's Coordination (does NOT use ElevenLabs):
- **File**: `backend-social/src/integration.js`
- **Method**: `notifyPerson2()` - Calls Person 2's `/roast/intensity` endpoint
- **File**: `backend-social/src/index.js` - Receives snooze events from Person 2

### Person 2's ElevenLabs Usage (uses ElevenLabs):
- **File**: `elevenlabs_service.py`
- **Class**: `ElevenLabsService`
- **Method**: `generate_audio_for_text()` - Generates voice from text
- **Method**: `generate_alarm_message()` - Creates snarky messages based on snooze count
- **File**: `main.py` - Endpoints that use ElevenLabs:
  - `POST /alarm/trigger` - Uses ElevenLabs for initial alarm
  - `POST /snooze` - Uses ElevenLabs for roast voice
  - `POST /excuse/analyze` - Uses ElevenLabs for roast voice

---

## Why This Architecture?

1. **Separation of Concerns**:
   - Person 2: AI & Voice (ElevenLabs, Gemini)
   - Person 4: Social Media & Database (Twitter, SMS, Storage)

2. **Loose Coupling**:
   - Person 4 doesn't need to know about ElevenLabs
   - Person 2 handles all voice generation
   - Person 4 just coordinates escalation

3. **Easier Maintenance**:
   - If ElevenLabs API changes, only Person 2 needs updates
   - Person 4 can work independently

---

## Testing the Integration

### Test Person 2's ElevenLabs Integration:
```bash
# Start Person 2's backend
cd /path/to/hackwestern
python main.py

# Test alarm trigger (uses ElevenLabs)
curl -X POST http://localhost:8000/alarm/trigger \
  -H "Content-Type: application/json" \
  -d '{"snooze_count": 3, "user_id": "test123"}'

# Response includes audio_url generated by ElevenLabs
```

### Test Person 4's Coordination:
```bash
# Start Person 4's backend
cd backend-social
npm run dev

# Test coordination with Person 2
curl -X POST http://localhost:8787/snooze/event \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test123",
    "snooze_count": 5,
    "excuse": "Just 5 more minutes"
  }'

# Person 4 will call Person 2's /roast/intensity endpoint
```

---

## Summary

**Person 4 does NOT use ElevenLabs directly.**

Person 4's role:
- Coordinates escalation with Person 2
- Triggers social media actions
- Manages database/storage

Person 2's role:
- Uses ElevenLabs for voice generation
- Uses Gemini for roast generation
- Adjusts intensity based on snooze_count

The integration happens when:
1. Person 4 receives snooze events
2. Person 4 calls Person 2's `/roast/intensity` endpoint to coordinate escalation
3. Person 2 uses ElevenLabs (via `/snooze` endpoint) when frontend requests voice generation

