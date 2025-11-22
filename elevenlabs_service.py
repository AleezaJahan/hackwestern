"""ElevenLabs API integration for voice generation with snarky personality."""
import os
import requests
from typing import Optional
from config import Config
from prompts import get_snooze_level, ALARM_MESSAGES
import random

class ElevenLabsService:
    """Service for generating snarky voice messages using ElevenLabs."""
    
    def __init__(self):
        self.api_key = Config.ELEVENLABS_API_KEY
        self.voice_id = Config.ELEVENLABS_VOICE_ID
        self.api_url = Config.ELEVENLABS_API_URL
        
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
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
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
    
    def generate_alarm_message(self, snooze_count: int = 0) -> str:
        """Generate appropriate alarm message based on snooze count.
        
        Args:
            snooze_count: Number of times user has snoozed
            
        Returns:
            Message text to be converted to speech
        """
        level = get_snooze_level(snooze_count)
        messages = ALARM_MESSAGES.get(level, ALARM_MESSAGES["mild"])
        
        # Select random message or format with snooze count if needed
        message = random.choice(messages)
        if "{count}" in message:
            message = message.format(count=snooze_count)
            
        return message
    
    def generate_audio_for_text(self, text: str, snooze_count: int = 0) -> bytes:
        """Generate audio for given text with appropriate voice settings.
        
        Args:
            text: Text to convert to speech
            snooze_count: Number of snoozes (affects voice tone)
            
        Returns:
            Audio bytes
        """
        level = get_snooze_level(snooze_count)
        
        # Adjust voice parameters based on snooze level
        # More aggressive = more expressive voice
        voice_settings = {
            "mild": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0},
            "moderate": {"stability": 0.4, "similarity_boost": 0.8, "style": 0.3},
            "aggressive": {"stability": 0.3, "similarity_boost": 0.85, "style": 0.6},
            "nuclear": {"stability": 0.2, "similarity_boost": 0.9, "style": 0.9}
        }
        
        settings = voice_settings.get(level, voice_settings["mild"])
        
        return self.generate_voice(
            text=text,
            stability=settings["stability"],
            similarity_boost=settings["similarity_boost"],
            style=settings["style"]
        )
    
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

