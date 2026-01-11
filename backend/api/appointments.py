"""
Appointments API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict
import json
import uuid
from datetime import datetime
from pathlib import Path

import sys
from pathlib import Path as PathLib

# Add parent directory to path for imports
backend_path = PathLib(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from models import (
    ScheduleAppointmentRequest,
    ScheduleAppointmentResponse,
    AppointmentResponse,
    GetAppointmentsResponse
)
from services.patient_summary import PatientSummaryService

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

# Path to appointments JSON file - stored in doctor folder
DATA_DIR = Path(__file__).parent.parent / "data"
DOCTOR_DIR = DATA_DIR / "doctor"
DOCTOR_DIR.mkdir(parents=True, exist_ok=True)

APPOINTMENTS_FILE = DOCTOR_DIR / "appointments.json"
PATIENT_QUEUE_FILE = DOCTOR_DIR / "patient_queue.json"
PAST_APPOINTMENTS_FILE = DOCTOR_DIR / "past_appointments.json"


def load_appointments():
    """Load appointments from JSON file"""
    try:
        if APPOINTMENTS_FILE.exists():
            with open(APPOINTMENTS_FILE, 'r') as f:
                data = json.load(f)
                return data.get('appointments', [])
        return []
    except Exception as e:
        return []


def save_appointments(appointments):
    """Save appointments to JSON file"""
    try:
        with open(APPOINTMENTS_FILE, 'w') as f:
            json.dump({"appointments": appointments}, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving appointments: {str(e)}")


def load_patient_queue():
    """Load patient queue from JSON file"""
    try:
        if PATIENT_QUEUE_FILE.exists():
            with open(PATIENT_QUEUE_FILE, 'r') as f:
                data = json.load(f)
                return data.get('patients', [])
        return []
    except Exception as e:
        return []


def save_patient_queue(patients):
    """Save patient queue to JSON file"""
    try:
        with open(PATIENT_QUEUE_FILE, 'w') as f:
            json.dump({"patients": patients}, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving patient queue: {str(e)}")


def load_past_appointments():
    """Load past appointments from JSON file"""
    try:
        if PAST_APPOINTMENTS_FILE.exists():
            with open(PAST_APPOINTMENTS_FILE, 'r') as f:
                data = json.load(f)
                return data.get('appointments', [])
        return []
    except Exception as e:
        return []


def generate_appointment_notes(symptoms: Optional[str], conversation_history: List[Dict], 
                               pain_rating: Optional[str] = None) -> str:
    """
    Generate concise 2-line appointment notes using LLM based on patient symptoms and conversation history
    """
    try:
        from services.patient_summary import PatientSummaryService
        summary_service = PatientSummaryService()
        
        # Extract main issue from symptoms or conversation
        main_issue = symptoms or ""
        conversation_context = ""
        
        # Build conversation context from history
        if conversation_history:
            user_messages = [
                msg.get("content", "") 
                for msg in conversation_history 
                if msg.get("type") == "user"
            ]
            if user_messages:
                conversation_context = " ".join(user_messages[:3])  # Take first 3 user messages
                if not main_issue:
                    main_issue = user_messages[0][:200] if user_messages else ""
        
        # Build comprehensive prompt for LLM
        prompt = f"""You are a medical assistant creating appointment notes for a doctor. Based on the patient information below, generate exactly 2 lines (2 sentences) summarizing the patient's health concern.

Requirements:
- Exactly 2 lines, no more, no less
- Plain text only, no markdown formatting
- Professional but patient-friendly language
- First line: Main health concern/symptoms
- Second line: Additional context (pain level, duration, or other relevant details)

Patient Information:
- Symptoms/Issue: {main_issue or 'Not specified'}
- Pain Rating: {pain_rating or 'Not specified'}/10
- Conversation Context: {conversation_context[:300] if conversation_context else 'No additional context'}

Generate exactly 2 lines of appointment notes:"""
        
        messages = [
            {
                "role": "system", 
                "content": "You are a medical assistant. Generate concise, professional appointment notes in exactly 2 lines. Use plain text only, no markdown formatting."
            },
            {
                "role": "user", 
                "content": prompt
            }
        ]
        
        # Call LLM to generate notes
        summary = summary_service.llm.get_response(messages, json_mode=False)
        
        # Clean up and ensure exactly 2 lines
        if summary:
            # Remove markdown formatting
            clean_summary = summary.replace('**', '').replace('*', '').replace('#', '').replace('`', '').strip()
            
            # Split into lines and filter empty lines
            lines = [line.strip() for line in clean_summary.split('\n') if line.strip()]
            
            # Take exactly 2 lines
            if len(lines) >= 2:
                # Join first 2 lines
                result = f"{lines[0]}\n{lines[1]}"
            elif len(lines) == 1:
                # If only one line, split by sentence and take first 2 sentences
                sentences = [s.strip() for s in lines[0].split('.') if s.strip()]
                if len(sentences) >= 2:
                    result = f"{sentences[0]}.\n{sentences[1]}."
                else:
                    result = f"{lines[0]}\nAppointment scheduled for consultation."
            else:
                # Fallback
                result = f"Patient consultation scheduled.\nHealth concern: {main_issue[:100] if main_issue else 'General health issue'}."
            
            # Ensure result is not too long (max 250 chars per line)
            result_lines = result.split('\n')
            if len(result_lines) >= 2:
                line1 = result_lines[0][:250]
                line2 = result_lines[1][:250]
                return f"{line1}\n{line2}"
            else:
                return result
        else:
            # Fallback if LLM returns empty
            if main_issue:
                return f"Patient consultation regarding: {main_issue[:100]}.\nPain rating: {pain_rating or 'Not specified'}/10."
            return "Appointment scheduled via AI Triage.\nPatient consultation for health concern."
        
    except Exception as e:
        import logging
        logging.error(f"Error generating appointment notes with LLM: {e}", exc_info=True)
        # Fallback to simple summary
        if symptoms:
            return f"Patient consultation regarding: {symptoms[:100]}.\nAppointment scheduled for evaluation."
        return "Appointment scheduled via AI Triage.\nPatient consultation for health concern."


@router.post("/schedule", response_model=ScheduleAppointmentResponse)
async def schedule_appointment(request: ScheduleAppointmentRequest):
    """
    Schedule a new appointment and add to patient queue
    """
    try:
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Received appointment request: patient_id={request.patient_id}, doctor_id={request.doctor_id}")
        
        appointments = load_appointments()
        
        # Get conversation history to generate appointment notes
        conversation_history = []
        if request.triage_session_id:
            from services.triage_agent import TriageAgent
            triage_agent = TriageAgent()
            try:
                session_data = triage_agent.get_conversation(request.triage_session_id)
                if session_data:
                    conversation_history = [
                        {"type": msg.get("type"), "content": msg.get("content")}
                        for msg in session_data.get("messages", [])
                    ]
            except Exception as e:
                import logging
                logging.warning(f"Could not load conversation history: {e}")
        
        # Generate simple appointment notes (2-line summary)
        appointment_notes = generate_appointment_notes(
            symptoms=request.symptoms,
            conversation_history=conversation_history,
            pain_rating=request.pain_rating
        )
        
        # Create new appointment
        appointment_id = str(uuid.uuid4())
        appointment = AppointmentResponse(
            appointment_id=appointment_id,
            patient_id=request.patient_id,
            patient_name=request.patient_name,
            patient_email=request.patient_email,
            doctor_id=request.doctor_id,
            doctor_name=request.doctor_name,
            appointment_date=request.appointment_date,
            appointment_time=request.appointment_time,
            status="scheduled",
            reason=appointment_notes,  # Use generated simple summary instead of full recommendation
            created_at=datetime.now().isoformat(),
            triage_session_id=request.triage_session_id,
            symptoms=request.symptoms,
            pain_rating=request.pain_rating
        )
        
        # Add to list
        appointments.append(appointment.dict())
        
        # Save to file
        save_appointments(appointments)
        
        # Generate patient summary and add to patient queue
        try:
            patient_queue = load_patient_queue()
            summary_service = PatientSummaryService()
            
            # Use conversation_history already loaded above
            
            # Generate patient summary
            patient_summary = summary_service.generate_patient_summary_for_queue(
                patient_id=request.patient_id,
                patient_name=request.patient_name,
                doctor_id=request.doctor_id,
                appointment_id=appointment_id,
                conversation_history=conversation_history,
                symptoms=request.symptoms,
                pain_rating=request.pain_rating,
                appointment_date=request.appointment_date,
                appointment_time=request.appointment_time
            )
            
            # Add to patient queue
            patient_queue.append(patient_summary)
            save_patient_queue(patient_queue)
            
        except Exception as e:
            # Log error but don't fail the appointment scheduling
            import logging
            logging.warning(f"Error generating patient summary for queue: {e}")
        
        return ScheduleAppointmentResponse(
            success=True,
            message="Appointment scheduled successfully",
            appointment=appointment
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scheduling appointment: {str(e)}")


@router.get("/patient/{patient_id}", response_model=GetAppointmentsResponse)
async def get_patient_appointments(patient_id: str):
    """
    Get all appointments for a patient
    """
    try:
        appointments = load_appointments()
        patient_appointments = [
            AppointmentResponse(**apt) for apt in appointments
            if apt.get('patient_id') == patient_id
        ]
        
        # Sort by date (most recent first)
        patient_appointments.sort(key=lambda x: x.appointment_date, reverse=True)
        
        return GetAppointmentsResponse(
            success=True,
            appointments=patient_appointments
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving appointments: {str(e)}")


@router.get("/doctor/{doctor_id}", response_model=GetAppointmentsResponse)
async def get_doctor_appointments(doctor_id: str):
    """
    Get all appointments for a doctor
    """
    try:
        appointments = load_appointments()
        doctor_appointments = [
            AppointmentResponse(**apt) for apt in appointments
            if apt.get('doctor_id') == doctor_id
        ]
        
        # Sort by date (most recent first)
        doctor_appointments.sort(key=lambda x: x.appointment_date, reverse=True)
        
        return GetAppointmentsResponse(
            success=True,
            appointments=doctor_appointments
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving appointments: {str(e)}")


@router.get("/queue/doctor/{doctor_id}")
async def get_doctor_patient_queue(doctor_id: str):
    """
    Get patient queue for a doctor from patient_queue.json
    """
    try:
        patient_queue = load_patient_queue()
        doctor_queue = [
            patient for patient in patient_queue
            if patient.get('doctor_id') == doctor_id
        ]
        
        # Sort by appointment date and time (earliest first)
        doctor_queue.sort(key=lambda x: (x.get('appointment_date', ''), x.get('appointment_time', '')), reverse=False)
        
        return {
            "success": True,
            "patients": doctor_queue
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving patient queue: {str(e)}")


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(appointment_id: str):
    """
    Get a specific appointment by ID
    """
    try:
        appointments = load_appointments()
        for apt in appointments:
            if apt.get('appointment_id') == appointment_id:
                return AppointmentResponse(**apt)
        
        raise HTTPException(status_code=404, detail="Appointment not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving appointment: {str(e)}")


@router.get("/patient/{patient_id}/past", response_model=GetAppointmentsResponse)
async def get_patient_past_appointments(patient_id: str):
    """
    Get past appointments for a patient (from past_appointments.json)
    """
    try:
        past_appointments = load_past_appointments()
        patient_past_appointments = []
        for apt in past_appointments:
            if apt.get('patient_id') == patient_id:
                # Convert to AppointmentResponse format, handling optional fields
                apt_dict = dict(apt)
                # Ensure all required fields are present
                if 'diagnosis' not in apt_dict:
                    apt_dict['diagnosis'] = None
                if 'doctor_notes' not in apt_dict:
                    apt_dict['doctor_notes'] = None
                if 'ai_summary' not in apt_dict:
                    apt_dict['ai_summary'] = None
                try:
                    patient_past_appointments.append(AppointmentResponse(**apt_dict))
                except Exception as e:
                    # Skip invalid appointments
                    continue
        
        # Also check regular appointments for completed ones
        appointments = load_appointments()
        completed_appointments = []
        for apt in appointments:
            if apt.get('patient_id') == patient_id and apt.get('status') == 'completed':
                apt_dict = dict(apt)
                if 'diagnosis' not in apt_dict:
                    apt_dict['diagnosis'] = None
                if 'doctor_notes' not in apt_dict:
                    apt_dict['doctor_notes'] = None
                if 'ai_summary' not in apt_dict:
                    apt_dict['ai_summary'] = None
                try:
                    completed_appointments.append(AppointmentResponse(**apt_dict))
                except Exception as e:
                    continue
        
        # Combine and sort by date (most recent first)
        all_past = patient_past_appointments + completed_appointments
        all_past.sort(key=lambda x: x.appointment_date, reverse=True)
        
        return GetAppointmentsResponse(
            success=True,
            appointments=all_past
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving past appointments: {str(e)}")


@router.patch("/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status: str):
    """
    Update appointment status (scheduled, completed, cancelled)
    """
    try:
        appointments = load_appointments()
        for apt in appointments:
            if apt.get('appointment_id') == appointment_id:
                apt['status'] = status
                save_appointments(appointments)
                return {"success": True, "message": "Appointment status updated"}
        
        raise HTTPException(status_code=404, detail="Appointment not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating appointment: {str(e)}")

