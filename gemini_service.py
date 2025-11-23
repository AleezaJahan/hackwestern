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
    
    def analyze_excuse(self, excuse: str, snooze_count: int, user_history: list = None, sentiment_analysis: Dict = None) -> Dict[str, Any]:
        """Analyze the legitimacy of a user's excuse - matching specification exactly.
        
        Args:
            excuse: The user's spoken or text excuse
            snooze_count: Number of times user has snoozed
            user_history: List of past excuses (optional)
            sentiment_analysis: Optional sentiment analysis from voice/text analysis
            
        Returns:
            Dictionary with excuseRating (1-10), isLying (bool), roast, escalationLevel
        """
        user_history_str = ", ".join(user_history) if user_history else "None"
        
        # Build sentiment context if available
        sentiment_context = ""
        if sentiment_analysis:
            sentiment = sentiment_analysis.get("sentiment", "neutral")
            sincerity = sentiment_analysis.get("sincerity_score", 0.5)
            emotions = sentiment_analysis.get("emotions", [])
            is_legitimate = sentiment_analysis.get("is_legitimate_emotional", False)
            
            if is_legitimate:
                # This is a legitimate emotional excuse - be empathetic
                sentiment_context = f"""
Sentiment Analysis:
- This is a LEGITIMATE EMOTIONAL EXCUSE (e.g., breakup, loss, health issue, family problem)
- Detected sentiment: {sentiment}
- Emotions detected: {', '.join(emotions)}
- Sincerity score: {sincerity:.2f} (genuine emotional distress)
- RESPONSE STYLE: Be EMPATHETIC, SUPPORTIVE, and ENCOURAGING. Acknowledge their pain but still motivate them to wake up.
- Say things like "I'm sorry that happened" or "That must be really hard" but then encourage them that they're strong and can get through this.
"""
            else:
                # This is a lazy/insincere excuse - be mean
                sentiment_context = f"""
Sentiment Analysis:
- Detected sentiment: {sentiment}
- Sincerity score: {sincerity:.2f} (0 = lazy/insincere, 1 = genuine)
- Emotions detected: {', '.join(emotions)}
- The excuse sounds {'genuine' if sincerity > 0.6 else 'insincere/lying/lazy'}
- RESPONSE STYLE: Be MEAN and call them out on their laziness
"""
        
        # Determine response style based on whether it's legitimate emotional excuse
        is_legitimate = sentiment_analysis and sentiment_analysis.get("is_legitimate_emotional", False)
        
        if is_legitimate:
            # For legitimate emotional excuses, be empathetic but still encouraging
            meanness_levels = {
                1: "empathetic and supportive - acknowledge their pain, say you're sorry, but gently encourage them",
                2: "still empathetic but slightly more direct - acknowledge it's hard but remind them they're strong",
                3: "supportive but firm - acknowledge their pain but emphasize they need to get up and face the day",
                4: "empathetic but direct - acknowledge their struggle but be clear they need to wake up now",
                5: "supportive but very direct - acknowledge their pain but firmly encourage them to get up and move forward"
            }
            meanness = meanness_levels.get(min(snooze_count, 5), meanness_levels[5])
        else:
            # For lazy/insincere excuses, be mean
            meanness_levels = {
                1: "mildly disappointed and slightly judgmental",
                2: "sarcastic and more judgmental, making fun of their lack of willpower",
                3: "harsh, mean, and derogatory - call them out brutally",
                4: "extremely mean and threatening - absolutely brutal",
                5: "the most brutal, savage, and merciless - maximum meanness"
            }
            meanness = meanness_levels.get(min(snooze_count, 5), meanness_levels[5])
        
        # Exact prompt from specification, enhanced with sentiment
        prompt = f"""You are a brutally honest but funny alarm clock assistant. 

A user just gave this excuse for snoozing: "{excuse}"

Context:
- This is snooze #{snooze_count}
- Past excuses: {user_history_str}
{sentiment_context}
Meanness Level Required: {meanness}
- The more they snooze, the MEANER your response should be
- If sentiment analysis shows they're lying or insincere, be EVEN MEANER
- If this is snooze #{snooze_count}, match the meanness level exactly

Tasks:
1. Rate the excuse quality (1-10, lower = worse excuse)
2. Detect if they're lying (consider sentiment analysis if provided)
3. Generate a snarky roast (2-3 sentences max) that is {meanness}
4. Suggest the escalation level: mild, medium, nuclear

IMPORTANT: 
- Your response MUST match the style: {meanness}
- If this is a LEGITIMATE EMOTIONAL EXCUSE (breakup, loss, etc.): Be empathetic, supportive, say "I'm sorry that happened" or "That must be really hard", acknowledge their pain, but still encourage them that they're strong and can get through this. You're better than them, you can do this, etc.
- If this is a LAZY/INSINCERE excuse: Be mean and call them out
- Higher snooze count = more direct response (but still empathetic if legitimate)

Response format (JSON):
{{
  "excuseRating": 3,
  "isLying": true,
  "roast": "Your mean response here - must match {meanness}",
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
    
    def generate_roast(self, snooze_count: int, excuse: str = None, sentiment_analysis: Dict = None) -> str:
        """Generate a snarky roast based on snooze count - escalating meanness.
        
        Args:
            snooze_count: Number of times user has snoozed
            excuse: Optional user excuse
            sentiment_analysis: Optional sentiment analysis to make response meaner
            
        Returns:
            Roast text to be converted to speech
        """
        # Check if this is a legitimate emotional excuse
        is_legitimate = sentiment_analysis and sentiment_analysis.get("is_legitimate_emotional", False)
        
        if is_legitimate:
            # Empathetic, supportive prompts for legitimate emotional excuses
            escalation_prompts = {
                1: """Generate an empathetic and supportive response for the FIRST snooze.
                The user gave a legitimate emotional excuse (like a breakup, loss, or health issue).
                Start with "I'm sorry that happened" or "That must be really hard".
                Acknowledge their pain, but gently encourage them that they're strong and can get through this.
                Say things like "you're better than them" or "you can do this". Be warm and supportive.
                Keep it to 1-2 sentences. Be empathetic but still encourage them to wake up.""",
                
                2: """Generate a supportive but slightly more direct response for the SECOND snooze.
                Still acknowledge their emotional pain and say you're sorry.
                But be a bit more direct - remind them they're strong and need to face the day.
                Still empathetic but encouraging them to get up. 1-2 sentences.""",
                
                3: """Generate a supportive but firm response for the THIRD snooze.
                Acknowledge their struggle and that it's hard, but be clear they need to get up.
                Remind them they're strong and can handle this. Be empathetic but direct.
                1-2 sentences, supportive but firm tone.""",
                
                4: """Generate a supportive but very direct response for the FOURTH snooze.
                Acknowledge their pain but be clear they need to wake up now.
                Remind them they're capable and strong. Be empathetic but very direct.
                1-2 sentences, supportive but urgent tone.""",
                
                5: """Generate a supportive but extremely direct response for the FIFTH snooze.
                Acknowledge their struggle but firmly encourage them to get up and move forward.
                Remind them they're strong and can do this. Be empathetic but very firm.
                1-2 sentences, supportive but very direct tone."""
            }
        else:
            # Mean, judgmental prompts for lazy/insincere excuses
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
        
        # Add sentiment context
        sentiment_context = ""
        if sentiment_analysis:
            is_legitimate = sentiment_analysis.get("is_legitimate_emotional", False)
            sentiment = sentiment_analysis.get("sentiment", "neutral")
            sincerity = sentiment_analysis.get("sincerity_score", 0.5)
            emotions = sentiment_analysis.get("emotions", [])
            
            if is_legitimate:
                # Legitimate emotional excuse - be empathetic
                sentiment_context = f'\n\nCRITICAL: This is a LEGITIMATE EMOTIONAL EXCUSE (breakup, loss, health issue, etc.). Emotions detected: {", ".join(emotions)}. Be EMPATHETIC and SUPPORTIVE. Say "I\'m sorry that happened" or "That must be really hard". Acknowledge their pain but encourage them that they\'re strong and can get through this. You\'re better than them, you can do this, etc.'
            elif sincerity < 0.5:
                # Lazy/insincere excuse - be mean
                sentiment_context = f'\n\nCRITICAL: Sentiment analysis shows they are LYING or INSINCERE (sincerity: {sincerity:.2f}). Their excuse "{excuse}" is FAKE/LAZY. Be EXTRA MEAN and call them out on their dishonesty/laziness. Make it clear you know they\'re just making excuses.'
            elif sentiment == "negative":
                sentiment_context = f'\n\nSentiment analysis shows negative emotions: {", ".join(emotions)}. They sound frustrated or annoyed (but not from legitimate emotional distress). Use this to be even more condescending and mean.'
        
        prompt = f"""{base_prompt}{excuse_text}{sentiment_context}

Generate a response that:
- Is 1-2 sentences max
- If this is a LEGITIMATE EMOTIONAL EXCUSE: Be empathetic, supportive, say "I'm sorry that happened", acknowledge their pain, but encourage them they're strong and can get through this
- If this is a LAZY/INSINCERE excuse: Be mean, judgmental, and call them out
- Escalates in directness based on snooze count ({snooze_count}) - but still empathetic if legitimate
- Still has personality and humor (empathetic humor if legitimate, dark humor if lazy)

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
    
    def generate_combined_response(self, excuse: str, snooze_count: int, user_history: list = None, sentiment_analysis: Dict = None) -> Dict[str, Any]:
        """Analyze excuse and generate roast in one call - matching specification.
        
        Args:
            excuse: The user's excuse
            snooze_count: Number of times user has snoozed
            user_history: List of past excuses (optional)
            sentiment_analysis: Optional sentiment analysis from voice/text
            
        Returns:
            Dictionary with analysis and roast
        """
        # Use analyze_excuse which returns roast in the analysis, incorporating sentiment
        analysis = self.analyze_excuse(excuse, snooze_count, user_history, sentiment_analysis)
        
        # Extract roast from analysis or generate separately with sentiment
        roast = analysis.get("roast") or self.generate_roast(snooze_count, excuse, sentiment_analysis)
        
        # If sentiment shows insincerity, make the roast even meaner
        if sentiment_analysis and sentiment_analysis.get("sincerity_score", 0.5) < 0.5:
            # Enhance the roast to be meaner if they're lying
            enhanced_roast = self.generate_roast(snooze_count, excuse, sentiment_analysis)
            if enhanced_roast and len(enhanced_roast) > len(roast):
                roast = enhanced_roast
        
        return {
            "analysis": analysis,
            "roast": roast,
            "snooze_count": snooze_count
        }

