"""Main FastAPI application for AI & Voice Integration backend."""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import io
import requests
from datetime import datetime

from config import Config
from elevenlabs_service import ElevenLabsService
from gemini_service import GeminiService
from sentiment_analysis import SentimentAnalyzer
from vapi_service import VAPIService
from prompts import get_snooze_level, get_social_media_threat

app = FastAPI(title="Passive-Aggressive Alarm Clock - AI & Voice Integration")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
elevenlabs_service = None
gemini_service = None
sentiment_analyzer = None
vapi_service = None

# Lazy initialization of services
def get_elevenlabs_service():
    global elevenlabs_service
    if elevenlabs_service is None:
        elevenlabs_service = ElevenLabsService()
    return elevenlabs_service

def get_gemini_service():
    global gemini_service
    if gemini_service is None:
        gemini_service = GeminiService()
    return gemini_service

def get_sentiment_analyzer():
    global sentiment_analyzer
    if sentiment_analyzer is None:
        sentiment_analyzer = SentimentAnalyzer()
    return sentiment_analyzer

def get_vapi_service():
    global vapi_service
    if vapi_service is None:
        vapi_service = VAPIService()
    return vapi_service


# Pydantic models for request/response
class AlarmTriggerRequest(BaseModel):
    snooze_count: int = 0
    user_id: Optional[str] = None
    wake_up_time: Optional[str] = None


class SnoozeRequest(BaseModel):
    excuse: str
    snooze_count: int
    user_id: Optional[str] = None
    transcribed_audio: Optional[str] = None


class ExcuseAnalysisRequest(BaseModel):
    excuse: str
    snooze_count: int
    transcribed_audio: Optional[str] = None


class AudioResponse(BaseModel):
    audio_url: Optional[str] = None
    message: str
    snooze_count: int
    level: str


class ExcuseResponse(BaseModel):
    analysis: Dict[str, Any]
    roast: str
    audio_url: Optional[str] = None
    snooze_count: int
    level: str


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "AI & Voice Integration Backend",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    """Health check with service status."""
    return {
        "status": "ok",
        "services": {
            "elevenlabs": bool(Config.ELEVENLABS_API_KEY),
            "gemini": bool(Config.GEMINI_API_KEY),
            "vapi": bool(Config.VAPI_API_KEY)
        }
    }


@app.post("/alarm/trigger", response_model=AudioResponse)
async def trigger_alarm(request: AlarmTriggerRequest):
    """Generate snarky voice message when alarm triggers.
    
    This endpoint is called when the alarm initially goes off.
    Matches specification: generateAlarmVoice(snoozeCount, userName)
    """
    try:
        elevenlabs = get_elevenlabs_service()
        
        # Get user name from request or use default
        user_name = getattr(request, 'user_name', None) or "there"
        
        # Generate appropriate message based on snooze count (matching specification)
        message = elevenlabs.generate_alarm_message(request.snooze_count, user_name)
        
        # Generate audio using specification method
        audio_data = elevenlabs.generate_alarm_voice(request.snooze_count, user_name)
        
        # Save audio file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"alarm_{request.snooze_count}_{timestamp}.mp3"
        audio_path = elevenlabs.save_audio(audio_data, filename)
        
        # Also provide base64 data URL for frontend
        import base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        # Return audio URL and metadata
        level = get_snooze_level(request.snooze_count)
        
        return AudioResponse(
            audio_url=f"/audio/{filename}",
            message=message,
            snooze_count=request.snooze_count,
            level=level
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating alarm: {str(e)}")


@app.get("/audio/{filename}")
async def get_audio(filename: str):
    """Serve audio files."""
    audio_path = os.path.join(Config.AUDIO_OUTPUT_DIR, filename)
    
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    def iterfile():
        with open(audio_path, mode="rb") as file_like:
            yield from file_like
    
    return StreamingResponse(
        iterfile(),
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Allow-Origin": "*",  # CORS for audio files
        }
    )


@app.post("/excuse/analyze", response_model=ExcuseResponse)
async def analyze_excuse(request: ExcuseAnalysisRequest, background_tasks: BackgroundTasks):
    """Analyze user's excuse and generate a roast.
    
    This endpoint is called when user hits snooze and provides an excuse.
    """
    try:
        gemini = get_gemini_service()
        elevenlabs = get_elevenlabs_service()
        
        # Analyze excuse and generate roast
        result = gemini.generate_combined_response(request.excuse, request.snooze_count)
        
        # Analyze sentiment if transcribed audio is provided
        sentiment_result = None
        if request.transcribed_audio:
            analyzer = get_sentiment_analyzer()
            sentiment_result = analyzer.analyze_sentiment(request.transcribed_audio)
        
        # Generate audio for the roast
        roast_text = result["roast"]
        audio_data = elevenlabs.generate_audio_for_text(roast_text, request.snooze_count)
        
        # Save audio file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"roast_{request.snooze_count}_{timestamp}.mp3"
        audio_path = elevenlabs.save_audio(audio_data, filename)
        
        level = get_snooze_level(request.snooze_count)
        
        # Pass snooze data to Person 4's backend (social media threat)
        # Notify at >= 3 snoozes to match frontend notification threshold
        if request.snooze_count >= 3:
            background_tasks.add_task(
                notify_social_media_backend,
                request.snooze_count,
                request.user_id,
                datetime.now().isoformat(),
                request.excuse,
                result.get("analysis", {}),
                sentiment_result
            )
        
        return ExcuseResponse(
            analysis=result["analysis"],
            roast=roast_text,
            audio_url=f"/audio/{filename}",
            snooze_count=request.snooze_count,
            level=level
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing excuse: {str(e)}")


@app.post("/excuse/sentiment")
async def analyze_excuse_sentiment(request: ExcuseAnalysisRequest):
    """Analyze sentiment from spoken excuse (voice sentiment analysis)."""
    try:
        analyzer = get_sentiment_analyzer()
        
        # Use transcribed audio if provided, otherwise use excuse text
        text_to_analyze = request.transcribed_audio or request.excuse
        
        # Analyze sentiment
        sentiment_result = analyzer.analyze_sentiment(text_to_analyze)
        is_legitimate = analyzer.is_excuse_legitimate(text_to_analyze, sentiment_result)
        
        return {
            "sentiment": sentiment_result,
            "is_legitimate": is_legitimate,
            "excuse": request.excuse,
            "snooze_count": request.snooze_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing sentiment: {str(e)}")


@app.post("/api/alarm/snooze")
async def api_alarm_snooze(request: SnoozeRequest, background_tasks: BackgroundTasks):
    """Combined API endpoint matching specification - /api/alarm/snooze.
    
    Main API Route: /api/alarm/snooze
    Flow: Generate roast with Gemini → Convert to voice with ElevenLabs → Return both
    """
    return await handle_snooze(request, background_tasks)


@app.post("/snooze")
async def handle_snooze(request: SnoozeRequest, background_tasks: BackgroundTasks):
    """Handle snooze event - combines excuse analysis and alarm generation.
    
    This is the main combined API endpoint matching the specification.
    Flow: Generate roast with Gemini → Convert to voice with ElevenLabs → Return both
    """
    try:
        gemini = get_gemini_service()
        elevenlabs = get_elevenlabs_service()
        analyzer = get_sentiment_analyzer()
        
        # Step 1: Analyze sentiment FIRST (if excuse provided) to influence roast meanness
        sentiment_result = None
        text_to_analyze = request.transcribed_audio or request.excuse
        if text_to_analyze:
            try:
                sentiment_result = analyzer.analyze_sentiment(text_to_analyze)
            except Exception as e:
                print(f"Error analyzing sentiment: {e}")
                # Continue without sentiment analysis
        
        # Step 2: Generate roast with Gemini, incorporating sentiment analysis
        # The more they snooze AND the more insincere they sound, the meaner the response
        result = gemini.generate_combined_response(
            request.excuse or "", 
            request.snooze_count,
            None,  # user_history
            sentiment_result  # Pass sentiment to make response meaner
        )
        roast_text = result.get("roast", "")
        
        # Step 3: Convert roast to voice with ElevenLabs (matches specification)
        audio_data = elevenlabs.generate_audio_for_text(roast_text, request.snooze_count)
        
        # Step 4: Save to storage (or could stream directly)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"snooze_{request.snooze_count}_{timestamp}.mp3"
        audio_path = elevenlabs.save_audio(audio_data, filename)
        
        # Step 5: Read audio as base64 for data URL (matching specification format)
        import base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        audio_data_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        level = get_snooze_level(request.snooze_count)
        escalation_level = "critical" if request.snooze_count >= 3 else "warning"
        
        # Step 6: Store stats in database (via Person 4 backend)
        # Notify Person 4 at snooze_count >= 3 to trigger SMS threat
        if request.snooze_count >= 3:
            background_tasks.add_task(
                notify_social_media_backend,
                request.snooze_count,
                request.user_id,
                datetime.now().isoformat(),
                request.excuse,
                result.get("analysis", {}),
                sentiment_result
            )
        
        # Step 7: Return both text and audio (matching specification)
        response_data = {
            "roastText": roast_text,
            "audioUrl": audio_data_url,  # Base64 data URL
            "audio_url": f"/audio/{filename}",  # Also provide file URL for compatibility
            "escalationLevel": escalation_level,
            "snooze_count": request.snooze_count,
            "level": level,
            "analysis": result.get("analysis", {})
        }
        
        if sentiment_result:
            response_data["sentiment"] = sentiment_result
        
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error handling snooze: {str(e)}")


@app.post("/social-media/threat")
async def generate_social_media_threat(snooze_count: int, user_id: Optional[str] = None):
    """Generate social media threat message for high snooze counts."""
    try:
        wake_up_time = datetime.now().strftime("%I:%M %p")
        threat_message = get_social_media_threat(snooze_count, wake_up_time)
        
        return {
            "threat_message": threat_message,
            "snooze_count": snooze_count,
            "wake_up_time": wake_up_time,
            "user_id": user_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating threat: {str(e)}")


def notify_social_media_backend(
    snooze_count: int, 
    user_id: Optional[str], 
    wake_up_time: str,
    excuse: Optional[str] = None,
    analysis: Optional[dict] = None,
    sentiment: Optional[dict] = None
):
    """Notify Person 4's backend about snooze event for social media threat."""
    try:
        url = f"{Config.PERSON4_BACKEND_URL}/snooze/event"
        data = {
            "user_id": user_id,
            "snooze_count": snooze_count,
            "wake_up_time": wake_up_time,
            "alarm_time": wake_up_time,  # Using wake_up_time as alarm_time for consistency
            "excuse": excuse,
            "transcribed_excuse": excuse,
            "legitimacy_score": analysis.get("legitimacy_score") if analysis else None,
            "sentiment": sentiment,
            "timestamp": datetime.now().isoformat()
        }
        requests.post(url, json=data, timeout=5)
    except Exception as e:
        print(f"Error notifying Person 4 backend: {e}")


@app.post("/roast/intensity")
async def coordinate_roast_intensity(request: dict):
    """Coordinate roast intensity with Person 4's backend.
    
    This endpoint is called by Person 4 to coordinate when to escalate roast intensity.
    """
    try:
        snooze_count = request.get("snooze_count", 0)
        current_intensity = request.get("current_roast_intensity", "mild")
        recommended_intensity = request.get("recommended_intensity", "mild")
        
        # Return the intensity that should be used for future roasts
        # Person 4 can use this to determine escalation
        level = get_snooze_level(snooze_count)
        
        return {
            "success": True,
            "current_intensity": current_intensity,
            "recommended_intensity": recommended_intensity,
            "actual_level": level,
            "snooze_count": snooze_count,
            "message": f"Roast intensity coordinated. Using {level} level."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error coordinating roast intensity: {str(e)}")


@app.post("/vapi/call")
async def create_vapi_call(phone_number: str, assistant_id: Optional[str] = None):
    """Create a VAPI call for voice interaction."""
    try:
        vapi = get_vapi_service()
        call_info = vapi.create_phone_call(phone_number, assistant_id)
        return call_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating VAPI call: {str(e)}")


@app.get("/vapi/call/{call_id}")
async def get_vapi_call_status(call_id: str):
    """Get status of a VAPI call."""
    try:
        vapi = get_vapi_service()
        call_status = vapi.get_call_status(call_id)
        return call_status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting call status: {str(e)}")


@app.post("/countdown/audio")
async def generate_countdown_audio(request: Dict[str, Any]):
    """Generate countdown audio using ElevenLabs.
    
    Request body:
    {
        "text": "5" or "4" or "3" or "2" or "1" or "Text sent"
    }
    """
    try:
        text = request.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        elevenlabs = get_elevenlabs_service()
        
        # Use a consistent voice for countdown (sarcastic friend voice - Bella)
        # This matches the snooze 3 level voice
        voice_id = Config.VOICE_SARCASTIC  # Bella voice
        
        # Generate audio
        audio_data = elevenlabs.generate_voice(
            text=text,
            voice_id=voice_id,
            stability=0.5,
            similarity_boost=0.75,
            style=0.6,
            use_speaker_boost=True
        )
        
        # Return base64 encoded audio
        import base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return JSONResponse(content={
            "audio_base64": audio_base64,
            "text": text
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating countdown audio: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    # Create audio output directory
    os.makedirs(Config.AUDIO_OUTPUT_DIR, exist_ok=True)
    os.makedirs(Config.TEMP_DIR, exist_ok=True)
    
    uvicorn.run(app, host="0.0.0.0", port=Config.PORT)

