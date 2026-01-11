"""
Patient Summary API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import Optional

import sys
from pathlib import Path

# Add parent directory to path for imports
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from models import (
    PatientSummaryRequest,
    PatientSummaryResponse
)
from services.patient_summary import PatientSummaryService

router = APIRouter(prefix="/api/patient-summary", tags=["patient-summary"])

# Initialize patient summary service
summary_service = PatientSummaryService()


@router.post("/", response_model=PatientSummaryResponse)
async def get_patient_summary(request: PatientSummaryRequest):
    """
    Get AI-generated patient summary for doctor
    """
    try:
        # For now, we'll use patient_id to get patient info
        # In a real system, you'd fetch this from a user database
        # For now, we'll use a placeholder
        patient_name = f"Patient {request.patient_id}"
        patient_email = f"patient{request.patient_id}@mediverse.com"
        
        # Generate summary
        result = summary_service.generate_summary(
            request.patient_id,
            patient_name,
            patient_email
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to generate summary"))
        
        # Convert appointments and records to response format
        from models import AppointmentResponse, MedicalRecordResponse, SessionSummary
        
        appointments = [
            AppointmentResponse(**apt) for apt in result.get("appointments", [])
        ]
        
        medical_records = [
            MedicalRecordResponse(**rec) for rec in result.get("medical_records", [])
        ]
        
        # Convert triage sessions
        triage_sessions = []
        for session in result.get("triage_sessions", []):
            collected_info = session.get("collected_info", {})
            triage_sessions.append(SessionSummary(
                session_id=session.get("session_id", ""),
                created_at=session.get("created_at", ""),
                status=session.get("status", "completed"),
                symptom=collected_info.get("issue"),
                triage_level=None,  # Can be calculated from pain_rating
                recommended_doctor=None
            ))
        
        return PatientSummaryResponse(
            success=True,
            patient_id=result["patient_id"],
            patient_name=result["patient_name"],
            patient_email=result["patient_email"],
            summary=result["summary"],
            medical_records=medical_records,
            appointments=appointments,
            triage_sessions=triage_sessions,
            patient_profile=result.get("patient_profile")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating patient summary: {str(e)}")

