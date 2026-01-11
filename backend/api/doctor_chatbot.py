"""
Doctor Portal AI Chatbot API
Provides AI-powered chat functionality for doctors with context from patient queue
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
import json
from pathlib import Path

import sys
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from adapters.azure_openai import AzureOpenAIHelper
from adapters.logger import logger

router = APIRouter(prefix="/api/doctor-chat", tags=["doctor-chat"])

# Path to data files
DATA_DIR = Path(__file__).parent.parent / "data" / "doctor"
APPOINTMENTS_FILE = DATA_DIR / "appointments.json"
PATIENT_QUEUE_FILE = DATA_DIR / "patient_queue.json"


class DoctorChatRequest(BaseModel):
    message: str
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None


class DoctorChatResponse(BaseModel):
    success: bool
    response: str
    is_markdown: bool = True


def load_patient_queue(doctor_id: Optional[str] = None) -> List[Dict]:
    """Load patient queue data"""
    try:
        if PATIENT_QUEUE_FILE.exists():
            with open(PATIENT_QUEUE_FILE, 'r') as f:
                data = json.load(f)
                patients = data.get('patients', [])
                if doctor_id:
                    patients = [p for p in patients if p.get('doctor_id') == doctor_id]
                return patients
        return []
    except Exception as e:
        logger.error(f"Error loading patient queue: {e}")
        return []


def load_appointments(doctor_id: Optional[str] = None) -> List[Dict]:
    """Load appointments data"""
    try:
        if APPOINTMENTS_FILE.exists():
            with open(APPOINTMENTS_FILE, 'r') as f:
                data = json.load(f)
                appointments = data.get('appointments', [])
                if doctor_id:
                    appointments = [a for a in appointments if a.get('doctor_id') == doctor_id]
                return appointments
        return []
    except Exception as e:
        logger.error(f"Error loading appointments: {e}")
        return []


def build_context(doctor_id: Optional[str] = None, doctor_name: Optional[str] = None) -> str:
    """Build context from patient queue and appointments for LLM"""
    patients = load_patient_queue(doctor_id)
    appointments = load_appointments(doctor_id)
    
    context_parts = []
    
    # Add doctor info
    if doctor_name:
        context_parts.append(f"You are assisting {doctor_name}.")
    
    # Add patient queue info
    if patients:
        context_parts.append(f"\n**Current Patient Queue ({len(patients)} patients):**")
        for i, patient in enumerate(patients, 1):
            patient_info = f"""
{i}. **{patient.get('patient_name', 'Unknown')}**
   - Appointment ID: {patient.get('appointment_id', 'N/A')}
   - Date/Time: {patient.get('appointment_date', 'N/A')} at {patient.get('appointment_time', 'N/A')}
   - Status: {patient.get('status', 'N/A')}
   - Triage Score: {patient.get('triage_score', 'N/A')}
   - Symptoms: {patient.get('symptoms', 'N/A')}
   - Pain Rating: {patient.get('pain_rating', 'N/A')}/10
   - Summary: {patient.get('summary', 'N/A')}"""
            context_parts.append(patient_info)
    else:
        context_parts.append("\n**Current Patient Queue:** No patients in queue.")
    
    # Add appointments info
    if appointments:
        context_parts.append(f"\n**Scheduled Appointments ({len(appointments)}):**")
        for apt in appointments[:5]:  # Limit to 5 recent
            apt_info = f"""
- **{apt.get('patient_name', 'Unknown')}**: {apt.get('appointment_date', 'N/A')} at {apt.get('appointment_time', 'N/A')}
  Status: {apt.get('status', 'N/A')}, Symptoms: {apt.get('symptoms', 'N/A')}"""
            context_parts.append(apt_info)
    
    return "\n".join(context_parts)


@router.post("/chat", response_model=DoctorChatResponse)
async def doctor_chat(request: DoctorChatRequest):
    """
    AI-powered chat endpoint for doctors.
    Provides answers based on patient queue context and general medical knowledge.
    """
    try:
        llm = AzureOpenAIHelper()
        
        # Build context from patient queue and appointments
        context = build_context(request.doctor_id, request.doctor_name)
        
        # Create system prompt
        system_prompt = f"""You are an AI medical assistant helping a doctor in their practice. You have access to the current patient queue and appointment information.

**Your Capabilities:**
1. Answer questions about patients in the queue (their symptoms, triage level, appointment times)
2. Provide medical knowledge and clinical guidance
3. Help with differential diagnosis considerations
4. Suggest relevant lab tests or examinations
5. Answer general medical questions with evidence-based information

**Context Information:**
{context}

**Response Guidelines:**
- Format your responses in clear, professional **Markdown**
- Use headers (##), bullet points, bold text, and other formatting for readability
- For medical information, cite general guidelines when applicable
- Be concise but thorough
- If asked about a specific patient, reference their data from the context
- If you don't have specific patient information, acknowledge it and provide general guidance
- Always maintain a professional, clinical tone
- For clinical questions, consider providing differential diagnoses, relevant tests, and management options"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.message}
        ]
        
        # Get response from LLM
        response = llm.get_response(messages, json_mode=False)
        
        if not response or response == "Azure OpenAI Not Responding":
            return DoctorChatResponse(
                success=False,
                response="I apologize, but I'm having trouble processing your request. Please try again.",
                is_markdown=False
            )
        
        return DoctorChatResponse(
            success=True,
            response=response,
            is_markdown=True
        )
        
    except Exception as e:
        logger.error(f"Error in doctor chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@router.get("/context/{doctor_id}")
async def get_doctor_context(doctor_id: str):
    """
    Get the current context available to the doctor chatbot
    """
    try:
        context = build_context(doctor_id)
        patients = load_patient_queue(doctor_id)
        appointments = load_appointments(doctor_id)
        
        return {
            "success": True,
            "patient_count": len(patients),
            "appointment_count": len(appointments),
            "context_preview": context[:500] + "..." if len(context) > 500 else context
        }
    except Exception as e:
        logger.error(f"Error getting context: {e}")
        raise HTTPException(status_code=500, detail=str(e))
