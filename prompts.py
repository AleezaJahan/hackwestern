"""Prompt engineering for different snooze levels (mild → nuclear)."""

# Define snooze level thresholds
SNOOZE_LEVELS = {
    "mild": (1, 2),        # 1-2 snoozes
    "moderate": (3, 4),    # 3-4 snoozes
    "aggressive": (5, 6),  # 5-6 snoozes
    "nuclear": (7, float('inf'))  # 7+ snoozes
}

def get_snooze_level(snooze_count: int) -> str:
    """Determine the snooze level based on snooze count."""
    if snooze_count <= 2:
        return "mild"
    elif snooze_count <= 4:
        return "moderate"
    elif snooze_count <= 6:
        return "aggressive"
    else:
        return "nuclear"

# Initial alarm wake-up messages - Matching specification exactly
def get_alarm_message(snooze_count: int, user_name: str = "there") -> str:
    """Generate alarm message based on snooze count - matching specification."""
    messages = {
        0: f"Good morning {user_name}. Time to wake up. I know you will, you're responsible.",
        1: "Seriously? Already hitting snooze? Interesting choice.",
        2: "Wow, twice. Your crush would be so impressed by your time management.",
        3: "Three times. Should I start drafting that tweet now?",
        4: "This is your final warning. Twitter is loading as we speak."
    }
    
    # For snooze count > 4, use nuclear messages
    if snooze_count >= 5:
        return f"ENOUGH! You've snoozed {snooze_count} times. This is pathetic. GET UP OR I'M POSTING YOUR SNOOZE STATS!"
    
    return messages.get(snooze_count, messages[4])

# Initial alarm wake-up messages (legacy format for compatibility)
ALARM_MESSAGES = {
    "mild": [
        "Good morning! Time to rise and shine. You've got this!",
        "Wake up, sleepyhead! The day awaits you.",
        "Rise and shine! Time to seize the day."
    ],
    "moderate": [
        "Alright, let's try this again. Time to wake up!",
        "Come on, you can do this. Get up already!",
        "This is your wake-up call. Literally. Get out of bed!"
    ],
    "aggressive": [
        "Seriously? Again? Get your act together and wake up!",
        "You know what time it is. Stop being lazy and get up!",
        "I'm not asking anymore. GET UP NOW!"
    ],
    "nuclear": [
        "ENOUGH! You've snoozed {count} times. This is pathetic. GET UP OR I'M POSTING YOUR SNOOZE STATS!",
        "I'm done being nice. You've hit snooze {count} times. Your crush will know about this if you don't get up RIGHT NOW!",
        "FINAL WARNING: You have {count} snoozes. If you don't get up in the next 30 seconds, I'm tweeting this to everyone you know!"
    ]
}

# Snooze roast prompts for Gemini
def get_roast_prompt(excuse: str, snooze_count: int, level: str) -> str:
    """Generate a roast prompt for Gemini based on excuse and snooze level."""
    
    level_context = {
        "mild": "Be mildly playful and sarcastic. Like a friend teasing another friend.",
        "moderate": "Be more pointed and sarcastic. Show some genuine concern mixed with humor.",
        "aggressive": "Be quite harsh and direct. Call them out on their excuses aggressively.",
        "nuclear": "Be absolutely brutal and savage. Pull no punches. Public shaming level."
    }
    
    base_prompt = f"""You are a passive-aggressive alarm clock AI. The user has snoozed {snooze_count} times.

User's excuse: "{excuse}"

Generate a snarky roast response that:
1. Calls out their pathetic excuse
2. Reminds them they've snoozed {snooze_count} times
3. Uses dark humor and sarcasm
4. {level_context.get(level, level_context["moderate"])}

Make it:
- 2-3 sentences max
- Witty and sharp
- {level_context.get(level, level_context["moderate"]).lower()}
- Remind them of the social media threat if snooze_count > 3

Response (no quotes, just the roast):"""
    
    return base_prompt

# Excuse analysis prompt for Gemini
EXCUSE_ANALYSIS_PROMPT = """Analyze the following sleep excuse and provide:
1. Legitimacy score (0-100, where 0 is complete BS and 100 is somewhat valid)
2. A brief analysis (1 sentence)
3. Recommended roast intensity (mild, moderate, aggressive, nuclear)

Excuse: "{excuse}"
Snooze count: {snooze_count}

Respond in JSON format:
{{
    "legitimacy_score": <number>,
    "analysis": "<brief analysis>",
    "recommended_intensity": "<mild|moderate|aggressive|nuclear>"
}}"""

# Social media threat message
def get_social_media_threat(snooze_count: int, wake_up_time: str) -> str:
    """Generate social media threat message."""
    return f"""🚨 PUBLIC SERVICE ANNOUNCEMENT 🚨

This person has snoozed their alarm {snooze_count} times today.
Wake-up time: {wake_up_time}

Their excuse? Probably something like "just 5 more minutes" 🥱

If you know this person, maybe check if they're still breathing? Just kidding... (or am I?)

#SnoozeChronicles #GetYourLifeTogether"""

