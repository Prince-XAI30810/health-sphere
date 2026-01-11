"""
Appointments API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import Optional
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


@router.post("/schedule", response_model=ScheduleAppointmentResponse)
async def schedule_appointment(request: ScheduleAppointmentRequest):
    """
    Schedule a new appointment and add to patient queue
    """
    try:
        appointments = load_appointments()
        
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
            reason=request.reason,
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
            
            # Get conversation history if session_id exists
            conversation_history = []
            if request.triage_session_id:
                from api.triage import router as triage_router
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

