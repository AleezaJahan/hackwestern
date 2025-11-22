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
        use_speaker_boost: bool = True
    ) -> bytes:
        """Generate audio from text using ElevenLabs TTS.
        
        Args:
            text: The text to convert to speech
            voice_id: Optional voice ID (uses default if not provided)
            stability: Voice stability (0-1)
            similarity_boost: Similarity boost (0-1)
            style: Style parameter for voice (0-1)
            use_speaker_boost: Whether to use speaker boost
            
        Returns:
            Audio data as bytes (MP3 format)
        """
        if not self.api_key:
            raise ValueError("ElevenLabs API key not configured")
            
        voice_id = voice_id or self.voice_id
        if not voice_id:
            raise ValueError("ElevenLabs voice ID not configured")
        
        url = f"{self.api_url}/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key
        }
        
        # Adjust voice parameters based on snooze level for snarky personality
        # Using eleven_turbo_v2_5 as specified - Fast, natural
        data = {
            "text": text,
            "model_id": "eleven_turbo_v2_5",  # Updated to match specification
            "voice_settings": {
                "stability": stability,
                "similarity_boost": similarity_boost,
                "style": style,
                "use_speaker_boost": use_speaker_boost
            }
        }
        
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        
        return response.content
    
    def generate_alarm_message(self, snooze_count: int = 0, user_name: str = "there") -> str:
        """Generate appropriate alarm message based on snooze count.
        
        Args:
            snooze_count: Number of times user has snoozed
            user_name: Optional user name for personalization
            
        Returns:
            Message text to be converted to speech
        """
        # Use the specification-exact messages
        return get_alarm_message(snooze_count, user_name)
    
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
    
    def generate_audio_for_text(self, text: str, snooze_count: int = 0, voice_id: Optional[str] = None) -> bytes:
        """Generate audio for given text with appropriate voice settings.
        
        Args:
            text: Text to convert to speech
            snooze_count: Number of snoozes (affects voice tone and selection)
            voice_id: Optional voice ID (if not provided, selects based on snooze_count)
            
        Returns:
            Audio bytes
        """
        level = get_snooze_level(snooze_count)
        
        # Select voice based on snooze count if not provided
        if not voice_id:
            voice_id = self.select_voice(snooze_count)
        
        # Adjust voice parameters based on snooze level
        # More aggressive = more expressive voice
        # Using specification values: stability: 0.5, similarity_boost: 0.75, style: 0.6
        voice_settings = {
            "mild": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.2},
            "moderate": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.6},
            "aggressive": {"stability": 0.4, "similarity_boost": 0.8, "style": 0.7},
            "nuclear": {"stability": 0.3, "similarity_boost": 0.85, "style": 0.9}
        }
        
        settings = voice_settings.get(level, voice_settings["moderate"])
        
        return self.generate_voice(
            text=text,
            voice_id=voice_id,
            stability=settings["stability"],
            similarity_boost=settings["similarity_boost"],
            style=settings["style"]
        )
    
    def generate_alarm_voice(self, snooze_count: int, user_name: str = "there") -> bytes:
        """Generate alarm voice message - matching specification flow.
        
        Args:
            snooze_count: Number of times user has snoozed
            user_name: User name for personalization
            
        Returns:
            Audio bytes (MP3 format)
        """
        message = self.generate_alarm_message(snooze_count, user_name)
        return self.generate_audio_for_text(message, snooze_count)
    
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

