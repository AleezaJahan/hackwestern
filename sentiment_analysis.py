"""Voice sentiment analysis for spoken excuses."""
import google.generativeai as genai
from typing import Dict, Any, Optional
from config import Config

class SentimentAnalyzer:
    """Analyze sentiment from spoken excuses using Gemini."""
    
    def __init__(self):
        self.api_key = Config.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("Gemini API key not configured")
        
        genai.configure(api_key=self.api_key)
        # Use the same model as the rest of the system for consistency
        self.model = genai.GenerativeModel(Config.GEMINI_MODEL)
    
    def analyze_sentiment(self, transcribed_text: str, audio_features: Optional[Dict] = None) -> Dict[str, Any]:
        """Analyze sentiment from transcribed speech.
        
        Args:
            transcribed_text: Text transcription of the user's spoken excuse
            audio_features: Optional dict with audio features (pitch, tone, etc.)
            
        Returns:
            Dictionary with sentiment analysis including:
            - sentiment (positive/negative/neutral)
            - confidence (0-1)
            - emotions (list of detected emotions)
            - sincerity_score (0-1, how genuine the excuse sounds)
        """
        prompt = f"""Analyze the sentiment and sincerity of the following sleep excuse transcription in EXTREME DETAIL.

Transcribed text: "{transcribed_text}"

IMPORTANT: Provide DEEP sentiment analysis to enable personalized, mean responses.

Analyze:
1. **Emotional State**: What is the person REALLY feeling? (desperate, lazy, manipulative, genuine, etc.)
2. **Excuse Type**: Categorize the excuse (breakup, health, laziness, manipulation, etc.)
3. **Personality Traits Revealed**: What does this excuse reveal about them? (weak-willed, dramatic, attention-seeking, etc.)
4. **Specific Details**: Extract specific details from the excuse that can be used for personalization
5. **Tone Analysis**: How are they saying it? (whiny, casual, dramatic, etc.)

Provide a detailed sentiment analysis including:
1. Sentiment (positive/negative/neutral)
2. Confidence score (0-1)
3. Detected emotions (list of 3-5 specific emotions with context)
4. Sincerity score (0-1, where 0 is lazy/insincere and 1 is genuinely sincere)
5. Is this a legitimate emotional excuse? (true/false)
6. Excuse category (breakup, health, laziness, manipulation, drama, etc.)
7. Personality traits revealed (list 2-3 traits)
8. Specific details to personalize response (extract key phrases, situations, etc.)
9. Tone of delivery (whiny, casual, dramatic, desperate, etc.)
10. Brief explanation (2-3 sentences with context)

Respond in JSON format:
{{
    "sentiment": "<positive|negative|neutral>",
    "confidence": <0.0-1.0>,
    "emotions": ["<emotion1>", "<emotion2>", "<emotion3>"],
    "sincerity_score": <0.0-1.0>,
    "is_legitimate_emotional": <true|false>,
    "excuse_category": "<breakup|health|laziness|manipulation|drama|other>",
    "personality_traits": ["<trait1>", "<trait2>"],
    "specific_details": ["<detail1>", "<detail2>"],
    "tone": "<whiny|casual|dramatic|desperate|lazy|other>",
    "explanation": "<detailed 2-3 sentence explanation with context>"
}}"""
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            response_text = response_text.strip()
            
            import json
            result = json.loads(response_text)
            
            # Validate and set defaults
            if "sentiment" not in result:
                result["sentiment"] = "negative"
            if "confidence" not in result:
                result["confidence"] = 0.5
            if "emotions" not in result:
                result["emotions"] = ["tired", "reluctant"]
            if "sincerity_score" not in result:
                result["sincerity_score"] = 0.3  # Default to low sincerity
            if "is_legitimate_emotional" not in result:
                # Check if emotions suggest legitimate emotional distress
                emotions = result.get("emotions", [])
                legitimate_emotions = ["sad", "heartbroken", "depressed", "anxious", "grief", "hurt", "devastated", "upset"]
                result["is_legitimate_emotional"] = any(emotion.lower() in legitimate_emotions for emotion in emotions) or result.get("sincerity_score", 0) > 0.7
            if "excuse_category" not in result:
                result["excuse_category"] = "laziness"
            if "personality_traits" not in result:
                result["personality_traits"] = ["weak-willed", "unmotivated"]
            if "specific_details" not in result:
                result["specific_details"] = []
            if "tone" not in result:
                result["tone"] = "casual"
            if "explanation" not in result:
                result["explanation"] = "Sounds like a typical excuse."
                
            return result
            
        except Exception as e:
            print(f"Error analyzing sentiment: {e}")
            # Fallback response
            return {
                "sentiment": "negative",
                "confidence": 0.5,
                "emotions": ["tired", "reluctant"],
                "sincerity_score": 0.2,  # Assume low sincerity
                "is_legitimate_emotional": False,
                "excuse_category": "laziness",
                "personality_traits": ["weak-willed", "unmotivated"],
                "specific_details": [],
                "tone": "casual",
                "explanation": "Could not analyze sentiment properly."
            }
    
    def is_excuse_legitimate(self, transcribed_text: str, sentiment_analysis: Optional[Dict] = None) -> bool:
        """Determine if excuse sounds legitimate based on sentiment analysis.
        
        Args:
            transcribed_text: Text transcription of excuse
            sentiment_analysis: Optional pre-computed sentiment analysis
            
        Returns:
            True if excuse seems legitimate, False otherwise
        """
        if sentiment_analysis is None:
            sentiment_analysis = self.analyze_sentiment(transcribed_text)
        
        # Consider excuse legitimate if sincerity score is above threshold
        sincerity_threshold = 0.6
        return sentiment_analysis.get("sincerity_score", 0) > sincerity_threshold

