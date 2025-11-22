"""Google Gemini API integration for excuse analysis and roast generation."""
import google.generativeai as genai
from typing import Dict, Any
from config import Config
from prompts import get_roast_prompt, EXCUSE_ANALYSIS_PROMPT, get_snooze_level

class GeminiService:
    """Service for using Gemini API for excuse analysis and roast generation."""
    
    def __init__(self):
        self.api_key = Config.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("Gemini API key not configured")
        
        genai.configure(api_key=self.api_key)
        # Using gemini-2.0-flash-exp as specified - faster, latest model
        self.model = genai.GenerativeModel(Config.GEMINI_MODEL)
    
    def analyze_excuse(self, excuse: str, snooze_count: int, user_history: list = None) -> Dict[str, Any]:
        """Analyze the legitimacy of a user's excuse - matching specification exactly.
        
        Args:
            excuse: The user's spoken or text excuse
            snooze_count: Number of times user has snoozed
            user_history: List of past excuses (optional)
            
        Returns:
            Dictionary with excuseRating (1-10), isLying (bool), roast, escalationLevel
        """
        user_history_str = ", ".join(user_history) if user_history else "None"
        
        # Exact prompt from specification
        prompt = f"""You are a brutally honest but funny alarm clock assistant. 

A user just gave this excuse for snoozing: "{excuse}"

Context:
- This is snooze #{snooze_count}
- Past excuses: {user_history_str}

Tasks:
1. Rate the excuse quality (1-10)
2. Detect if they're lying
3. Generate a snarky roast (2-3 sentences max)
4. Suggest the escalation level: mild, medium, nuclear

Response format (JSON):
{{
  "excuseRating": 3,
  "isLying": true,
  "roast": "Your response here",
  "escalationLevel": "medium"
}}"""
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Try to parse JSON response
            import json
            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            response_text = response_text.strip()
            
            result = json.loads(response_text)
            
            # Map to our format for backward compatibility
            return {
                "excuseRating": result.get("excuseRating", 3),
                "isLying": result.get("isLying", True),
                "roast": result.get("roast", ""),
                "escalationLevel": result.get("escalationLevel", "medium"),
                # Legacy fields
                "legitimacy_score": (result.get("excuseRating", 3) * 10),  # Convert 1-10 to 10-100
                "analysis": result.get("roast", "Sounds like a typical excuse."),
                "recommended_intensity": result.get("escalationLevel", "moderate")
            }
            
        except Exception as e:
            # Fallback response if parsing fails - escalating meanness
            print(f"Error analyzing excuse: {e}")
            
            # Escalating fallback messages
            fallback_roasts = {
                1: f"Really? '{excuse}'? That's the best you can do? Pathetic.",
                2: f"Wow, '{excuse}' again? You're really showing your true colors here. This is getting sad.",
                3: f"'{excuse}'? After THREE snoozes? You're a complete disaster. This is when things get serious.",
                4: f"'{excuse}'? You're absolutely pathetic. Four snoozes? You have no self-respect.",
                5: f"'{excuse}'? FIVE snoozes? You're a complete failure. I'm genuinely embarrassed for you."
            }
            
            roast = fallback_roasts.get(min(snooze_count, 5), f"'{excuse}'? After {snooze_count} snoozes? You're beyond help.")
            
            return {
                "excuseRating": 2,
                "isLying": True,
                "roast": roast,
                "escalationLevel": "medium" if snooze_count <= 2 else "nuclear",
                "legitimacy_score": 20,
                "analysis": "Couldn't parse the excuse, but it's probably not valid.",
                "recommended_intensity": get_snooze_level(snooze_count)
            }
    
    def generate_roast(self, snooze_count: int, excuse: str = None) -> str:
        """Generate a snarky roast based on snooze count - escalating meanness.
        
        Args:
            snooze_count: Number of times user has snoozed
            excuse: Optional user excuse
            
        Returns:
            Roast text to be converted to speech
        """
        # Escalating prompts - gets progressively meaner and more derogatory
        escalation_prompts = {
            1: """Generate a disappointed, judgmental response for the FIRST snooze. 
            Start with "Really? That's the best you can do?" 
            Be mildly sarcastic and disappointed, like a friend who expected better.
            Keep it to 1-2 sentences. Be slightly condescending but not too mean yet.""",
            
            2: """Generate a more sarcastic and mean response for the SECOND snooze.
            The user has now snoozed twice. Be more pointed and judgmental.
            Make fun of their lack of willpower. Reference how pathetic this is getting.
            Be more derogatory than the first message. 1-2 sentences.""",
            
            3: """Generate a harsh, mean, and derogatory response for the THIRD snooze.
            This is getting ridiculous. Be brutal and call them out on their weakness.
            Make it clear they're pathetic and have no self-control.
            Be quite mean and insulting. Mention that this is when things get serious.
            1-2 sentences, very harsh tone.""",
            
            4: """Generate an extremely mean and threatening response for the FOURTH snooze.
            This is unacceptable. Be absolutely brutal and derogatory.
            Call them names, insult their character, make them feel terrible.
            Threaten them with consequences. Be as mean as possible while still being funny.
            1-2 sentences, nuclear-level meanness.""",
            
            5: """Generate the most brutal, savage, and derogatory response for the FIFTH snooze.
            This person is a complete failure at basic life skills.
            Be absolutely merciless. Insult their intelligence, work ethic, and character.
            Make it clear they're a disappointment. Threaten social media exposure.
            1-2 sentences, maximum meanness."""
        }
        
        # Get appropriate prompt based on snooze count
        # For snooze 6+, use the most brutal prompt
        prompt_key = min(snooze_count, 5)
        base_prompt = escalation_prompts.get(prompt_key, escalation_prompts[5])
        
        # Add excuse context if provided
        excuse_text = f'\n\nUser\'s excuse: "{excuse}"' if excuse else '\n\nThe user provided no excuse (which is even worse).'
        
        prompt = f"""{base_prompt}{excuse_text}

Generate a response that:
- Is 1-2 sentences max
- Escalates in meanness based on snooze count ({snooze_count})
- Gets progressively more derogatory and insulting
- Is brutally honest and harsh
- Still has dark humor but is genuinely mean

Return ONLY the roast text, no JSON, no quotes."""
        
        try:
            response = self.model.generate_content(prompt)
            roast = response.text.strip()
            
            # Remove quotes if present
            if roast.startswith('"') and roast.endswith('"'):
                roast = roast[1:-1]
            elif roast.startswith("'") and roast.endswith("'"):
                roast = roast[1:-1]
            
            # Remove "JSON" wrapper if present
            if roast.lower().startswith("json"):
                roast = roast[4:].strip()
            
            return roast
            
        except Exception as e:
            print(f"Error generating roast: {e}")
            # Fallback roast - escalating meanness
            fallback_roasts = {
                1: f"Really? '{excuse}'? That's the best you can do? Pathetic. Get up!" if excuse else "Really? That's the best you can do? Get up!",
                2: f"Wow, '{excuse}' again? You're really showing your true colors. This is getting sad. Get up!" if excuse else "Two snoozes? You're really showing your lack of willpower. Get up!",
                3: f"'{excuse}'? After THREE snoozes? You're a complete disaster. This is when things get serious. GET UP!" if excuse else "Three snoozes? You're a complete disaster. GET UP!",
                4: f"'{excuse}'? You're absolutely pathetic. Four snoozes? You have no self-respect. GET UP NOW!" if excuse else "Four snoozes? You're absolutely pathetic. GET UP NOW!",
                5: f"'{excuse}'? FIVE snoozes? You're a complete failure. I'm genuinely embarrassed for you. GET UP!" if excuse else "Five snoozes? You're a complete failure. GET UP!"
            }
            
            return fallback_roasts.get(min(snooze_count, 5), f"'{excuse}'? After {snooze_count} snoozes? You're beyond help. GET UP!" if excuse else f"{snooze_count} snoozes? You're beyond help. GET UP!")
    
    def generate_combined_response(self, excuse: str, snooze_count: int, user_history: list = None) -> Dict[str, Any]:
        """Analyze excuse and generate roast in one call - matching specification.
        
        Args:
            excuse: The user's excuse
            snooze_count: Number of times user has snoozed
            user_history: List of past excuses (optional)
            
        Returns:
            Dictionary with analysis and roast
        """
        # Use analyze_excuse which returns roast in the analysis
        analysis = self.analyze_excuse(excuse, snooze_count, user_history)
        
        # Extract roast from analysis or generate separately
        roast = analysis.get("roast") or self.generate_roast(snooze_count, excuse)
        
        return {
            "analysis": analysis,
            "roast": roast,
            "snooze_count": snooze_count
        }

