"""Google Cloud Translation API service for translating text."""
import requests
from typing import Optional
from config import Config

class TranslationService:
    """Service for translating text using Google Cloud Translation API."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or Config.GOOGLE_TRANSLATE_API_KEY or Config.GEMINI_API_KEY  # Use translation key or fallback to Gemini key
        self.api_url = "https://translation.googleapis.com/language/translate/v2"
    
    def translate_text(self, text: str, target_language: str, source_language: str = "en") -> str:
        """Translate text to target language using Google Cloud Translation API.
        
        Args:
            text: Text to translate
            target_language: Target language code (e.g., 'es', 'fr', 'de')
            source_language: Source language code (default: 'en')
            
        Returns:
            Translated text
        """
        if not self.api_key:
            print("[WARNING] No Google API key configured for translation")
            return text
        
        if target_language == "en" or target_language == source_language:
            return text
        
        try:
            print(f"[DEBUG Translation] Translating to {target_language}: {text[:50]}...")
            
            # Google Cloud Translation API v2 endpoint
            url = f"{self.api_url}?key={self.api_key}"
            
            payload = {
                "q": text,
                "target": target_language,
                "source": source_language,
                "format": "text"
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                translated = data["data"]["translations"][0]["translatedText"]
                print(f"[DEBUG Translation] ✅ Translation successful: {translated[:50]}...")
                return translated
            else:
                print(f"[ERROR Translation] API error: {response.status_code} - {response.text}")
                return text
                
        except Exception as e:
            print(f"[ERROR Translation] Error translating text: {e}")
            import traceback
            traceback.print_exc()
            return text

