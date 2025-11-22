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
        self.model = genai.GenerativeModel('gemini-pro')
    
    def analyze_excuse(self, excuse: str, snooze_count: int) -> Dict[str, Any]:
        """Analyze the legitimacy of a user's excuse.
        
        Args:
            excuse: The user's spoken or text excuse
            snooze_count: Number of times user has snoozed
            
        Returns:
            Dictionary with legitimacy_score, analysis, and recommended_intensity
        """
        prompt = EXCUSE_ANALYSIS_PROMPT.format(
            excuse=excuse,
            snooze_count=snooze_count
        )
        
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
            
            # Ensure all required fields are present
            if "legitimacy_score" not in result:
                result["legitimacy_score"] = 20  # Default low score
            if "analysis" not in result:
                result["analysis"] = "Sounds like a typical excuse."
            if "recommended_intensity" not in result:
                result["recommended_intensity"] = get_snooze_level(snooze_count)
                
            return result
            
        except Exception as e:
            # Fallback response if parsing fails
            print(f"Error analyzing excuse: {e}")
            return {
                "legitimacy_score": 15,  # Assume it's BS
                "analysis": "Couldn't parse the excuse, but it's probably not valid.",
                "recommended_intensity": get_snooze_level(snooze_count)
            }
    
    def generate_roast(self, excuse: str, snooze_count: int) -> str:
        """Generate a snarky roast based on the user's excuse and snooze count.
        
        Args:
            excuse: The user's excuse
            snooze_count: Number of times user has snoozed
            
        Returns:
            Roast text to be converted to speech
        """
        level = get_snooze_level(snooze_count)
        prompt = get_roast_prompt(excuse, snooze_count, level)
        
        try:
            response = self.model.generate_content(prompt)
            roast = response.text.strip()
            
            # Remove quotes if present
            if roast.startswith('"') and roast.endswith('"'):
                roast = roast[1:-1]
            elif roast.startswith("'") and roast.endswith("'"):
                roast = roast[1:-1]
                
            return roast
            
        except Exception as e:
            print(f"Error generating roast: {e}")
            # Fallback roast
            return f"Really? '{excuse}' after {snooze_count} snoozes? That's the best you can do? Get up!"
    
    def generate_combined_response(self, excuse: str, snooze_count: int) -> Dict[str, Any]:
        """Analyze excuse and generate roast in one call.
        
        Args:
            excuse: The user's excuse
            snooze_count: Number of times user has snoozed
            
        Returns:
            Dictionary with analysis and roast
        """
        analysis = self.analyze_excuse(excuse, snooze_count)
        roast = self.generate_roast(excuse, snooze_count)
        
        return {
            "analysis": analysis,
            "roast": roast,
            "snooze_count": snooze_count
        }

