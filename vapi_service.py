"""VAPI/Genesys voice interaction flow integration."""
import requests
from typing import Dict, Any, Optional
from config import Config

class VAPIService:
    """Service for VAPI voice interaction flows."""
    
    def __init__(self):
        self.api_key = Config.VAPI_API_KEY
        self.api_url = Config.VAPI_API_URL
        self.assistant_id = Config.VAPI_ASSISTANT_ID
    
    def create_phone_call(
        self,
        phone_number: str,
        assistant_id: Optional[str] = None,
        custom_data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Create a phone call using VAPI.
        
        Args:
            phone_number: Phone number to call
            assistant_id: Optional assistant ID (uses default if not provided)
            custom_data: Optional custom data to pass to the call
            
        Returns:
            Call information dictionary
        """
        if not self.api_key:
            raise ValueError("VAPI API key not configured")
        
        assistant_id = assistant_id or self.assistant_id
        if not assistant_id:
            raise ValueError("VAPI Assistant ID not configured")
        
        url = f"{self.api_url}/call"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "assistantId": assistant_id,
            "phoneNumberId": phone_number,
            "customer": {
                "number": phone_number
            }
        }
        
        if custom_data:
            data["customData"] = custom_data
        
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        
        return response.json()
    
    def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """Get the status of a VAPI call.
        
        Args:
            call_id: The call ID to check
            
        Returns:
            Call status information
        """
        if not self.api_key:
            raise ValueError("VAPI API key not configured")
        
        url = f"{self.api_url}/call/{call_id}"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        return response.json()
    
    def handle_voice_interaction(
        self,
        transcribed_text: str,
        snooze_count: int,
        session_data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Handle voice interaction during alarm snooze.
        
        Args:
            transcribed_text: Transcribed user speech
            snooze_count: Number of times user has snoozed
            session_data: Optional session data
            
        Returns:
            Dictionary with response text and actions
        """
        # This would integrate with VAPI's webhook/event system
        # For now, return structured data for processing
        
        return {
            "transcribed_text": transcribed_text,
            "snooze_count": snooze_count,
            "session_data": session_data or {},
            "requires_response": True
        }

# Placeholder for Genesys integration (similar structure)
class GenesysService:
    """Service for Genesys voice interaction flows."""
    
    def __init__(self):
        # Genesys configuration would go here
        pass
    
    def create_call(self, phone_number: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a call using Genesys."""
        # Implementation would go here
        raise NotImplementedError("Genesys integration not yet implemented")

