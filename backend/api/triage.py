"""
Triage API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import Optional

import sys
from pathlib import Path

# Add parent directory to path for imports
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from models import (
    StartSessionRequest,
    StartSessionResponse,
    SendMessageRequest,
    SendMessageResponse,
    MessageResponse,
    ConversationResponse,
    SessionSummary,
    UserSessionsResponse
)
from services.triage_agent import TriageAgent

router = APIRouter(prefix="/api/triage", tags=["triage"])

# Initialize triage agent
triage_agent = TriageAgent()


@router.post("/start", response_model=StartSessionResponse)
async def start_triage_session(request: StartSessionRequest):
    """
    Start a new triage session
    Returns a session ID and initial greeting message
    """
    try:
        session_id = triage_agent.start_session(request.user_id)
        conversation = triage_agent.get_conversation(session_id)
        
        if not conversation:
            raise HTTPException(status_code=500, detail="Failed to create session")
        
        initial_message = conversation["messages"][0]["content"]
        
        return StartSessionResponse(
            success=True,
            session_id=session_id,
            initial_message=initial_message,
            message="Session started successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting session: {str(e)}")


@router.post("/message", response_model=SendMessageResponse)
async def send_message(request: SendMessageRequest):
    """
    Send a message to the triage agent
    """
    try:
        # Load conversation history
        conversation = triage_agent.get_conversation(request.session_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Build conversation history for agent
        conversation_history = []
        for msg in conversation.get("messages", []):
            conversation_history.append({
                "type": msg.get("type"),
                "content": msg.get("content")
            })
        
        # Get current collected info
        current_collected_info = conversation.get("collected_info", {})
        
        # Process message
        result = triage_agent.process_message(
            request.session_id,
            request.message,
            conversation_history,
            current_collected_info
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Processing failed"))
        
        response_data = result.get("response", {})
        collected_info = result.get("collected_info", {})
        recommended_doctor = response_data.get("recommended_doctor")
        
        # Save user message
        triage_agent.add_message(
            request.session_id,
            "user",
            request.message
        )
        
        # Save bot response
        bot_metadata = {
            "question_type": response_data.get("question_type"),
            "collected_info": collected_info,
            "is_complete": response_data.get("is_complete", False)
        }
        
        if recommended_doctor:
            bot_metadata["recommended_doctor"] = recommended_doctor
        
        triage_agent.add_message(
            request.session_id,
            "bot",
            response_data.get("message", ""),
            bot_metadata
        )
        
        return SendMessageResponse(
            success=True,
            response=response_data,
            recommended_doctor=recommended_doctor,
            collected_info=collected_info
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")


@router.get("/conversation/{session_id}", response_model=ConversationResponse)
async def get_conversation(session_id: str):
    """
    Get conversation history by session ID
    """
    try:
        conversation = triage_agent.get_conversation(session_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Convert messages to response format
        messages = []
        for msg in conversation.get("messages", []):
            messages.append(MessageResponse(
                id=msg.get("id"),
                type=msg.get("type"),
                content=msg.get("content"),
                timestamp=msg.get("timestamp"),
                metadata=msg.get("metadata")
            ))
        
        return ConversationResponse(
            session_id=conversation.get("session_id"),
            user_id=conversation.get("user_id"),
            created_at=conversation.get("created_at"),
            messages=messages,
            collected_info=conversation.get("collected_info", {}),
            status=conversation.get("status", "active")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation: {str(e)}")


@router.get("/sessions", response_model=UserSessionsResponse)
async def get_user_sessions(user_id: Optional[str] = None):
    """
    Get all sessions for a user (or all sessions if no user_id provided)
    Returns session summaries with basic information
    """
    try:
        sessions = triage_agent.get_all_sessions(user_id)
        
        session_summaries = []
        for session in sessions:
            # Extract symptom from collected info or first user message
            symptom = None
            collected_info = session.get("collected_info", {})
            if collected_info.get("issue"):
                symptom = collected_info["issue"]
            else:
                # Try to get from first user message
                for msg in session.get("messages", []):
                    if msg.get("type") == "user":
                        symptom = msg.get("content", "")[:50] + "..." if len(msg.get("content", "")) > 50 else msg.get("content", "")
                        break
            
            # Get triage level from last bot message
            triage_level = None
            recommended_doctor = None
            for msg in reversed(session.get("messages", [])):
                if msg.get("type") == "bot":
                    metadata = msg.get("metadata", {})
                    if metadata.get("recommended_doctor"):
                        recommended_doctor = metadata["recommended_doctor"].get("name", "")
                    # Check for triage level in metadata or infer from pain_rating
                    collected_info_in_msg = metadata.get("collected_info", {})
                    pain_rating = collected_info_in_msg.get("pain_rating")
                    if pain_rating:
                        try:
                            rating = int(pain_rating)
                            if rating <= 3:
                                triage_level = "low"
                            elif rating <= 6:
                                triage_level = "medium"
                            elif rating <= 8:
                                triage_level = "high"
                            else:
                                triage_level = "high"  # 9-10 is critical/high
                        except (ValueError, TypeError):
                            # Fallback if not a number
                            pass
                    break
            
            session_summaries.append(SessionSummary(
                session_id=session.get("session_id"),
                created_at=session.get("created_at"),
                status=session.get("status", "active"),
                symptom=symptom,
                triage_level=triage_level,
                recommended_doctor=recommended_doctor
            ))
        
        # Sort by created_at descending (most recent first)
        session_summaries.sort(key=lambda x: x.created_at, reverse=True)
        
        return UserSessionsResponse(
            success=True,
            sessions=session_summaries
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sessions: {str(e)}")


@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """
    Delete a triage session by session ID
    """
    try:
        success = triage_agent.delete_session(session_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {"success": True, "message": "Session deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")

