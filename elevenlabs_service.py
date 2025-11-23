"""ElevenLabs API integration for voice generation with snarky personality."""
import os
import requests
from typing import Optional
from config import Config
from prompts import get_snooze_level, ALARM_MESSAGES, get_alarm_message
import random

class ElevenLabsService:
    """Service for generating snarky voice messages using ElevenLabs."""
    
    def __init__(self):
        self.api_key = Config.ELEVENLABS_API_KEY
        self.voice_id = Config.ELEVENLABS_VOICE_ID
        self.api_url = Config.ELEVENLABS_API_URL
        
        # Voice personalities - Voice Selection Strategy
        self.voice_personalities = {
            "disappointed_parent": Config.VOICE_GENTLE,  # Rachel - for mild
            "sarcastic_friend": Config.VOICE_SARCASTIC,  # Bella - for moderate
            "drill_sergeant": Config.VOICE_AGGRESSIVE,   # Antoni - for aggressive
        }
        
    def generate_voice(
        self, 
        text: str, 
        voice_id: Optional[str] = None,
        stability: float = 0.5,
        similarity_boost: float = 0.75,
        style: float = 0.0,
        use_speaker_boost: bool = True,
        language: Optional[str] = "en",
        speed: float = 1.0
    ) -> bytes:
        """Generate audio from text using ElevenLabs TTS.
        
        Args:
            text: The text to convert to speech
            voice_id: Optional voice ID (uses default if not provided)
            stability: Voice stability (0-1)
            similarity_boost: Similarity boost (0-1)
            style: Style parameter for voice (0-1)
            use_speaker_boost: Whether to use speaker boost
            language: Language code (e.g., 'en', 'es', 'fr', etc.)
            speed: Speech speed (0.7-1.2, default 1.0, lower = slower)
            
        Returns:
            Audio data as bytes (MP3 format)
        """
        if not self.api_key:
            raise ValueError("ElevenLabs API key not configured")
            
        voice_id = voice_id or self.voice_id
        if not voice_id:
            raise ValueError("ElevenLabs voice ID not configured")
        
        url = f"{self.api_url}/text-to-speech/{voice_id}"
        
        # Debug: Check if API key is set
        if not self.api_key:
            raise ValueError("ElevenLabs API key is empty!")
        
        api_key_clean = self.api_key.strip()
        print(f"[DEBUG] Using API key: {api_key_clean[:20]}... (length: {len(api_key_clean)})")
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key_clean
        }
        
        # Select model based on language - use multilingual model for non-English
        # eleven_multilingual_v2 supports 29 languages
        # eleven_turbo_v2_5 is faster but primarily English
        print(f"[DEBUG ElevenLabs] Language parameter: {language}")
        if language and language != "en":
            model_id = "eleven_multilingual_v2"  # Multilingual model for non-English
            print(f"[DEBUG ElevenLabs] Using multilingual model for language: {language}")
        else:
            model_id = "eleven_turbo_v2_5"  # Fast English model
            print(f"[DEBUG ElevenLabs] Using English model")
        print(f"[DEBUG ElevenLabs] Text to speak: {text[:100]}...")
        
        # Adjust voice parameters based on snooze level for snarky personality
        data = {
            "text": text,
            "model_id": model_id,
            "voice_settings": {
                "stability": stability,
                "similarity_boost": similarity_boost,
                "style": style,
                "use_speaker_boost": use_speaker_boost
            }
        }
        
        # Add speed parameter if specified (ElevenLabs supports speed 0.7-1.2)
        if speed != 1.0:
            data["voice_settings"]["speed"] = speed
        
        # Add language code if using multilingual model and language is specified
        if language and language != "en" and model_id == "eleven_multilingual_v2":
            # ElevenLabs multilingual model auto-detects language from text
            # But we can add language hint if needed (some models support it)
            pass
        
        print(f"[DEBUG] Making request to: {url}")
        response = requests.post(url, json=data, headers=headers)
        print(f"[DEBUG] Response status: {response.status_code}")
        if response.status_code != 200:
            print(f"[DEBUG] Response text: {response.text[:200]}")
        response.raise_for_status()
        
        return response.content
    
    def generate_alarm_message(self, snooze_count: int = 0, user_name: str = "there", language: str = "en", gemini_service=None, translation_service=None) -> str:
        """Generate appropriate alarm message based on snooze count.
        
        Args:
            snooze_count: Number of times user has snoozed
            user_name: Optional user name for personalization
            language: Language code (e.g., 'en', 'es', 'fr', etc.)
            gemini_service: Optional Gemini service for translation
            
        Returns:
            Message text to be converted to speech
        """
        # For English, use the specification-exact messages
        if language == "en":
            return get_alarm_message(snooze_count, user_name)
        
        # For other languages, translate the base message using Google Translate API
        english_message = get_alarm_message(snooze_count, user_name)
        print(f"[DEBUG generate_alarm_message] Language: {language}, Translation service: {translation_service is not None}")
        
        if language == "en":
            print(f"[DEBUG generate_alarm_message] English language, returning original message")
            return english_message
        
        # Prefer translation service over Gemini for translation
        if translation_service:
            try:
                print(f"[DEBUG] ===== TRANSLATING ALARM MESSAGE (Google Translate) =====")
                print(f"[DEBUG] Target language: {language}")
                print(f"[DEBUG] English message: {english_message}")
                
                translated = translation_service.translate_text(english_message, language)
                
                if translated != english_message:
                    print(f"[DEBUG] ✅ Translation successful!")
                    print(f"[DEBUG] Translated message: {translated}")
                    return translated
                else:
                    print(f"[WARNING] Translation returned original text, falling back")
            except Exception as e:
                print(f"[ERROR] ❌ Error translating alarm message: {e}")
                import traceback
                traceback.print_exc()
        
        # Fallback to Gemini if translation service not available
        if gemini_service:
            try:
                language_names = {
                    "es": "Spanish", "fr": "French", "de": "German", "it": "Italian",
                    "pt": "Portuguese", "ja": "Japanese", "ko": "Korean", "zh": "Chinese",
                    "ru": "Russian", "ar": "Arabic", "hi": "Hindi"
                }
                target_language = language_names.get(language, language.upper())
                
                print(f"[DEBUG] ===== FALLBACK: TRANSLATING WITH GEMINI =====")
                prompt = f"""Translate the following alarm clock message to {target_language}. 
Keep the same tone, sarcasm, and personality. Maintain the same meaning and energy.
Do not add any explanations, just return the translated message.

Message to translate: "{english_message}"

Translated message:"""
                
                response = gemini_service.model.generate_content(prompt)
                translated = response.text.strip()
                if translated.startswith('"') and translated.endswith('"'):
                    translated = translated[1:-1]
                elif translated.startswith("'") and translated.endswith("'"):
                    translated = translated[1:-1]
                
                print(f"[DEBUG] ✅ Gemini translation successful: {translated}")
                return translated
            except Exception as e:
                print(f"[ERROR] ❌ Gemini translation also failed: {e}")
        
        # If no translation service available, return English
        print(f"[WARNING] No translation service available, using English")
        return english_message
    
    def select_voice(self, snooze_count: int) -> str:
        """Select voice based on snooze count - Voice Selection Strategy.
        
        Args:
            snooze_count: Number of times user has snoozed
            
        Returns:
            Voice ID to use
        """
        if snooze_count <= 1:
            return self.voice_personalities["disappointed_parent"]  # Rachel - gentle
        elif snooze_count <= 3:
            return self.voice_personalities["sarcastic_friend"]  # Bella - sarcastic
        else:
            return self.voice_personalities["drill_sergeant"]  # Antoni - aggressive
    
    def generate_audio_for_text(self, text: str, snooze_count: int = 0, voice_id: Optional[str] = None, language: str = "en") -> bytes:
        """Generate audio for given text with appropriate voice settings.
        
        Args:
            text: Text to convert to speech
            snooze_count: Number of snoozes (affects voice tone and selection)
            voice_id: Optional voice ID (if not provided, selects based on snooze_count)
            language: Language code (e.g., 'en', 'es', 'fr', etc.)
            
        Returns:
            Audio bytes
        """
        level = get_snooze_level(snooze_count)
        
        # Select voice based on snooze count if not provided
        if not voice_id:
            voice_id = self.select_voice(snooze_count)
        
        # Adjust voice parameters based on snooze level
        # More aggressive = more expressive/angry voice
        # Lower stability = more variation/expressiveness (angrier)
        # Higher style = more emotional/expressive (angrier)
        # Higher similarity_boost = more consistent with voice character
        # ALL LEVELS SET TO 8/10 ANGRY for consistent angry tone
        voice_settings = {
            "mild": {"stability": 0.2, "similarity_boost": 0.9, "style": 0.9, "speed": 1.0},  # 8/10 angry
            "moderate": {"stability": 0.2, "similarity_boost": 0.9, "style": 0.9, "speed": 1.0},  # 8/10 angry
            "aggressive": {"stability": 0.2, "similarity_boost": 0.9, "style": 0.9, "speed": 1.0},  # 8/10 angry
            "nuclear": {"stability": 0.2, "similarity_boost": 0.9, "style": 0.9, "speed": 1.0}  # 8/10 angry
        }
        
        settings = voice_settings.get(level, voice_settings["moderate"])
        
        # For the first alarm message (snooze_count 0), make it slower for clarity
        # Speed: 0.85 = slightly slower (15% slower), makes it easier to understand
        speed = 0.85 if snooze_count == 0 else settings.get("speed", 1.0)
        
        return self.generate_voice(
            text=text,
            voice_id=voice_id,
            stability=settings["stability"],
            similarity_boost=settings["similarity_boost"],
            style=settings["style"],
            language=language,
            speed=speed
        )
    
    def generate_alarm_voice(self, snooze_count: int, user_name: str = "there", language: str = "en", gemini_service=None, translation_service=None) -> bytes:
        """Generate alarm voice message - matching specification flow.
        
        Args:
            snooze_count: Number of times user has snoozed
            user_name: User name for personalization
            language: Language code (e.g., 'en', 'es', 'fr', etc.)
            gemini_service: Optional Gemini service for translation (fallback)
            translation_service: Optional translation service (preferred)
            
        Returns:
            Audio bytes (MP3 format)
        """
        message = self.generate_alarm_message(snooze_count, user_name, language, gemini_service, translation_service)
        return self.generate_audio_for_text(message, snooze_count, language=language)
    
    def save_audio(self, audio_data: bytes, filename: str) -> str:
        """Save audio data to file.
        
        Args:
            audio_data: Audio bytes to save
            filename: Name of the file
            
        Returns:
            Path to saved file
        """
        os.makedirs(Config.AUDIO_OUTPUT_DIR, exist_ok=True)
        filepath = os.path.join(Config.AUDIO_OUTPUT_DIR, filename)
        
        with open(filepath, "wb") as f:
            f.write(audio_data)
            
        return filepath

