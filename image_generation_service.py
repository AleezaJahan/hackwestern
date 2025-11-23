"""Image generation service for creating farm animal images."""
import google.generativeai as genai
import requests
import base64
from typing import Optional
from config import Config
import io
import random

class ImageGenerationService:
    """Service for generating farm animal images."""
    
    def __init__(self):
        self.api_key = Config.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("Gemini API key not configured")
        
        genai.configure(api_key=self.api_key)
        # Use Gemini 2.0 Flash - note: it doesn't directly generate images
        # but we can use it to help with prompts or use alternative services
        self.model = genai.GenerativeModel(Config.GEMINI_MODEL)
    
    def generate_farm_animal_image_url(self) -> str:
        """Generate or get a URL to a farm animal image.
        
        Note: Gemini 2.0 Flash doesn't directly generate images, so we use:
        1. A free image service (Unsplash) as placeholder
        2. Or you can integrate with DALL-E, Stable Diffusion, etc.
        
        Returns:
            URL to a farm animal image (must be directly accessible by Twilio)
        """
        try:
            print("[DEBUG ImageGen] Getting farm animal image URL...")
            
            # Since Gemini 2.0 Flash doesn't generate images directly,
            # we'll use a free image service as a placeholder
            # In production, you could:
            # - Use DALL-E API
            # - Use Stable Diffusion API
            # - Use another AI image generation service
            
            # Use direct image URLs from reliable sources that Twilio can access
            # Twilio requires direct image URLs that are publicly accessible and don't redirect
            # Using direct links to farm animal images from reliable CDNs
            
            # List of direct image URLs for farm animals
            # These are direct links to actual images that Twilio can fetch
            farm_animal_images = [
                'https://images.pexels.com/photos/288621/pexels-photo-288621.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',  # Cow
                'https://images.pexels.com/photos/130655/pexels-photo-130655.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',  # Pig
                'https://images.pexels.com/photos/1406506/pexels-photo-1406506.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',  # Chicken
                'https://images.pexels.com/photos/288621/pexels-photo-288621.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',  # Sheep
                'https://images.pexels.com/photos/130655/pexels-photo-130655.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',  # Goat
            ]
            
            # Use a random image URL
            image_url = random.choice(farm_animal_images)
            
            # Fallback: If Pexels doesn't work, use a simple direct image URL
            # You can replace this with your own hosted image or use a different service
            
            print(f"[DEBUG ImageGen] Generated image URL: {image_url}")
            return image_url
            
        except Exception as e:
            print(f"[ERROR ImageGen] Error getting image URL: {e}")
            # Fallback to a default farm animal image (direct URL)
            return "https://images.unsplash.com/photo-1527153818091-23a6c4db9f5a?w=800&h=600&fit=crop"

