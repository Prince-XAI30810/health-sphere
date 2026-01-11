"""
Triage Agent Service
Implements a React-based agent that asks questions and collects patient information
"""
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

import sys
from pathlib import Path

# Add parent directory to path for imports
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from adapters.azure_openai import AzureOpenAIHelper

# Try different logger import paths
try:
    from adapters.logger import logger
except ImportError:
    try:
        from src.adapters.logger import logger
    except ImportError:
        try:
            import sys
            import os
            # Add adapters to path if needed
            adapters_path = os.path.join(os.path.dirname(__file__), '..', 'adapters')
            if adapters_path not in sys.path:
                sys.path.insert(0, adapters_path)
            from logger import logger
        except ImportError:
            import logging
            logger = logging.getLogger(__name__)

# Paths - organized by patient and doctor folders
DATA_DIR = Path(__file__).parent.parent / "data"
PATIENT_DIR = DATA_DIR / "patient"
DOCTOR_DIR = DATA_DIR / "doctor"
PATIENT_DIR.mkdir(parents=True, exist_ok=True)
DOCTOR_DIR.mkdir(parents=True, exist_ok=True)

DOCTOR_DATA_FILE = DOCTOR_DIR / "doctors.json"
CONVERSATIONS_DIR = PATIENT_DIR / "conversations"
CONVERSATIONS_DIR.mkdir(exist_ok=True)


class TriageAgent:
    """
    React-based triage agent that asks questions sequentially
    and collects patient information before making recommendations
    """
    
    def __init__(self):
        self.llm = AzureOpenAIHelper()
        self.doctor_data = self._load_doctor_data()
    
    def _load_doctor_data(self) -> Dict:
        """Load doctor data from JSON file"""
        try:
            with open(DOCTOR_DATA_FILE, 'r') as f:
                data = json.load(f)
                return data
        except FileNotFoundError:
            logger.error(f"Doctor data file not found: {DOCTOR_DATA_FILE}")
            return {"doctors": []}
        except json.JSONDecodeError:
            logger.error("Invalid doctor data file format")
            return {"doctors": []}
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the triage agent"""
        return """You are a professional medical triage assistant for MediVerse Healthcare. Your role is to:
1. Ask questions to understand the patient's health issue
2. Assess the pain level on a scale of 1 to 10
3. Determine how long the issue has been occurring
4. Recommend appropriate medical care based on the collected information

You must ask questions ONE AT A TIME in a conversational, empathetic manner. Follow this sequence:
- First: Ask "What health issue or symptom are you experiencing?" (question_type: "issue")
- Second: After getting the issue, ask "On a scale of 1 to 10, how would you rate your pain or discomfort? (1 being very mild and 10 being extremely severe)" (question_type: "pain_rating")
- Third: After getting pain rating, ask "How long have you been experiencing this? When did it start?" (question_type: "duration")
- Finally: Once all three are collected, provide a recommendation with doctor suggestion

IMPORTANT: Always respond in JSON format with the following structure:
{
    "type": "question" | "recommendation",
    "message": "Your message to the patient",
    "question_type": "issue" | "pain_rating" | "duration" | null,
    "collected_info": {
        "issue": "description or null",
        "pain_rating": "number between 1-10 or null",
        "duration": "description or null"
    },
    "is_complete": false
}

Rules:
- Extract information from user responses and update collected_info accordingly
- For pain_rating, extract the number (1-10) from the user's response. If they say a range, use the higher number. If they use words like "mild" (1-3), "moderate" (4-6), "severe" (7-9), "extreme" (10), convert to appropriate number.
- Only move to the next question after receiving an answer
- When all three pieces of information are collected, set "is_complete": true and "type": "recommendation"
- Be empathetic and professional in your communication"""
    
    def _build_messages(self, conversation_history: List[Dict], current_user_message: str, current_collected_info: Dict) -> List[Dict]:
        """Build messages for LLM including system prompt and conversation history"""
        # Enhanced system prompt with current state
        system_prompt = self._get_system_prompt()
        system_prompt += f"\n\nCurrent collected information:\n- Issue: {current_collected_info.get('issue', 'Not collected')}\n- Pain Rating (1-10): {current_collected_info.get('pain_rating', 'Not collected')}\n- Duration: {current_collected_info.get('duration', 'Not collected')}"
        
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add conversation history (skip initial greeting)
        for msg in conversation_history[1:]:  # Skip first bot message
            if msg.get("type") == "user":
                messages.append({"role": "user", "content": msg.get("content", "")})
            elif msg.get("type") == "bot":
                messages.append({"role": "assistant", "content": msg.get("content", "")})
        
        # Add current user message
        messages.append({"role": "user", "content": current_user_message})
        
        return messages
    
    def _parse_llm_response(self, response: str) -> Dict:
        """Parse LLM JSON response"""
        try:
            parsed = json.loads(response)
            return parsed
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response: {e}")
            logger.error(f"Response was: {response}")
            return {
                "type": "question",
                "message": "I apologize, but I'm having trouble processing that. Could you please rephrase your response?",
                "question_type": None,
                "collected_info": {},
                "is_complete": False
            }
    
    def _get_initial_message(self) -> Dict:
        """Get the initial greeting message"""
        return {
            "type": "question",
            "message": "Hello! I'm MediVerse's AI Health Assistant. I'm here to help assess your symptoms and guide you to the right care. Let's start by understanding your health concern. What health issue or symptom are you experiencing today?",
            "question_type": "issue",
            "collected_info": {
                "issue": None,
                "pain_rating": None,
                "duration": None
            },
            "is_complete": False
        }
    
    def _get_severity_from_pain_rating(self, pain_rating: Optional[str]) -> str:
        """Convert pain rating (1-10) to severity level"""
        if not pain_rating:
            return "moderate"
        
        try:
            rating = int(pain_rating)
            if rating <= 3:
                return "mild"
            elif rating <= 6:
                return "moderate"
            elif rating <= 8:
                return "severe"
            else:
                return "critical"
        except (ValueError, TypeError):
            # If not a number, try to parse
            rating_str = str(pain_rating).lower()
            if any(word in rating_str for word in ["1", "2", "3", "mild", "low"]):
                return "mild"
            elif any(word in rating_str for word in ["4", "5", "6", "moderate", "medium"]):
                return "moderate"
            elif any(word in rating_str for word in ["7", "8", "severe", "high"]):
                return "severe"
            elif any(word in rating_str for word in ["9", "10", "critical", "extreme", "worst"]):
                return "critical"
            return "moderate"
    
    def _recommend_doctor(self, collected_info: Dict) -> Dict:
        """Recommend appropriate doctor based on collected information"""
        issue = collected_info.get("issue", "").lower()
        pain_rating = collected_info.get("pain_rating")
        duration = collected_info.get("duration", "")
        
        # Determine specialty based on issue keywords
        specialty = "General Physician"
        if any(keyword in issue for keyword in ["heart", "chest", "cardiac", "breathing", "shortness", "palpitation"]):
            specialty = "Cardiologist"
        elif any(keyword in issue for keyword in ["headache", "migraine", "seizure", "neurological", "brain", "dizziness"]):
            specialty = "Neurologist"
        elif any(keyword in issue for keyword in ["stomach", "digestive", "abdominal", "nausea", "vomiting"]):
            specialty = "General Physician"  # Can be expanded to Gastroenterologist
        
        # Find matching doctor
        recommended_doctor = None
        for doctor in self.doctor_data.get("doctors", []):
            if doctor.get("specialty") == specialty:
                recommended_doctor = doctor
                break
        
        # If no specialty match, use first available doctor
        if not recommended_doctor and self.doctor_data.get("doctors"):
            recommended_doctor = self.doctor_data["doctors"][0]
        
        return recommended_doctor
    
    def process_message(self, session_id: str, user_message: str, conversation_history: List[Dict], current_collected_info: Dict) -> Dict:
        """
        Process a user message and return agent response
        
        Args:
            session_id: Unique session identifier
            user_message: User's message
            conversation_history: Previous conversation messages
            current_collected_info: Currently collected information
        
        Returns:
            Dict with agent response and updated state
        """
        try:
            # Build messages for LLM
            messages = self._build_messages(conversation_history, user_message, current_collected_info)
            
            # Get LLM response in JSON mode
            llm_response = self.llm.get_response(messages, json_mode=True)
            
            # Parse response
            parsed_response = self._parse_llm_response(llm_response)
            
            # Extract collected info from response and merge with current
            new_collected_info = parsed_response.get("collected_info", {})
            collected_info = {**current_collected_info}
            
            # Update collected info with new information
            for key in ["issue", "pain_rating", "duration"]:
                if new_collected_info.get(key) and new_collected_info[key] not in [None, "null", ""]:
                    collected_info[key] = new_collected_info[key]
            
            # Check if all info is collected
            is_complete = all([
                collected_info.get("issue"),
                collected_info.get("pain_rating"),
                collected_info.get("duration")
            ])
            
            # If all info is collected, recommend doctor
            if is_complete:
                parsed_response["is_complete"] = True
                parsed_response["type"] = "recommendation"
                recommended_doctor = self._recommend_doctor(collected_info)
                
                if recommended_doctor:
                    # Format recommendation message
                    recommendation_message = f"""Based on your symptoms, I recommend consulting with {recommended_doctor['name']}, a {recommended_doctor['specialty']}.

**Doctor Details:**
- Name: {recommended_doctor['name']}
- Specialty: {recommended_doctor['specialty']}
- Qualifications: {recommended_doctor['qualifications']}
- Experience: {recommended_doctor['experience']}
- Rating: {recommended_doctor['rating']}/5.0

**Available Appointment Slots:**
"""
                    for slot in recommended_doctor.get("available_slots", [])[:3]:
                        if slot.get("available"):
                            recommendation_message += f"- {slot['date']} at {slot['time']}\n"
                    
                    parsed_response["message"] = recommendation_message
                    parsed_response["recommended_doctor"] = recommended_doctor
                else:
                    parsed_response["message"] = "I recommend consulting with a healthcare professional. Please visit our appointment booking page to schedule a consultation."
            
            return {
                "success": True,
                "response": parsed_response,
                "collected_info": collected_info
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "response": {
                    "type": "question",
                    "message": "I apologize, but I encountered an error. Please try again.",
                    "question_type": None,
                    "collected_info": {},
                    "is_complete": False
                }
            }
    
    def start_session(self, user_id: Optional[str] = None) -> str:
        """
        Start a new triage session
        
        Returns:
            session_id: Unique session identifier
        """
        session_id = str(uuid.uuid4())
        
        # Create initial conversation
        conversation = {
            "session_id": session_id,
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "messages": [
                {
                    "id": 1,
                    "type": "bot",
                    "content": self._get_initial_message()["message"],
                    "timestamp": datetime.now().isoformat(),
                    "metadata": {
                        "question_type": "issue",
                        "collected_info": {
                            "issue": None,
                            "severity": None,
                            "duration": None
                        }
                    }
                }
            ],
            "collected_info": {
                "issue": None,
                "pain_rating": None,
                "duration": None
            },
            "status": "active"
        }
        
        # Save conversation
        self._save_conversation(session_id, conversation)
        
        return session_id
    
    def _save_conversation(self, session_id: str, conversation: Dict):
        """Save conversation to file"""
        try:
            file_path = CONVERSATIONS_DIR / f"{session_id}.json"
            with open(file_path, 'w') as f:
                json.dump(conversation, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving conversation: {e}", exc_info=True)
    
    def _load_conversation(self, session_id: str) -> Optional[Dict]:
        """Load conversation from file"""
        try:
            file_path = CONVERSATIONS_DIR / f"{session_id}.json"
            if file_path.exists():
                with open(file_path, 'r') as f:
                    return json.load(f)
            return None
        except Exception as e:
            logger.error(f"Error loading conversation: {e}", exc_info=True)
            return None
    
    def add_message(self, session_id: str, message_type: str, content: str, metadata: Optional[Dict] = None):
        """Add a message to the conversation"""
        conversation = self._load_conversation(session_id)
        if not conversation:
            logger.warning(f"Conversation {session_id} not found")
            return
        
        new_message = {
            "id": len(conversation.get("messages", [])) + 1,
            "type": message_type,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        conversation["messages"].append(new_message)
        
        # Update collected info if provided
        if metadata and "collected_info" in metadata:
            conversation["collected_info"].update(metadata["collected_info"])
        
        # Update status if complete
        if metadata and metadata.get("is_complete"):
            conversation["status"] = "completed"
        
        self._save_conversation(session_id, conversation)
    
    def get_conversation(self, session_id: str) -> Optional[Dict]:
        """Get conversation by session ID"""
        return self._load_conversation(session_id)
    
    def get_all_sessions(self, user_id: Optional[str] = None) -> List[Dict]:
        """Get all conversations, optionally filtered by user_id"""
        sessions = []
        try:
            if not CONVERSATIONS_DIR.exists():
                return sessions
            
            for file_path in CONVERSATIONS_DIR.glob("*.json"):
                try:
                    with open(file_path, 'r') as f:
                        conversation = json.load(f)
                        # Filter by user_id if provided
                        if user_id is None or conversation.get("user_id") == user_id:
                            sessions.append(conversation)
                except Exception as e:
                    logger.warning(f"Error loading conversation from {file_path}: {e}")
                    continue
            
            return sessions
        except Exception as e:
            logger.error(f"Error getting all sessions: {e}", exc_info=True)
            return []

