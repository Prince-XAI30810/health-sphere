"""
Medical Records API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import Optional, List
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
    MedicalRecordRequest,
    MedicalRecordResponse,
    GetMedicalRecordsResponse
)

router = APIRouter(prefix="/api/medical-records", tags=["medical-records"])

# Path to medical records JSON file - stored in patient folder
DATA_DIR = Path(__file__).parent.parent / "data"
PATIENT_DIR = DATA_DIR / "patient"
PATIENT_DIR.mkdir(parents=True, exist_ok=True)

MEDICAL_RECORDS_FILE = PATIENT_DIR / "medical_records.json"


def load_medical_records():
    """Load medical records from JSON file"""
    try:
        if MEDICAL_RECORDS_FILE.exists():
            with open(MEDICAL_RECORDS_FILE, 'r') as f:
                data = json.load(f)
                return data.get('records', [])
        return []
    except Exception as e:
        return []


def save_medical_records(records):
    """Save medical records to JSON file"""
    try:
        with open(MEDICAL_RECORDS_FILE, 'w') as f:
            json.dump({"records": records}, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving medical records: {str(e)}")


@router.post("/", response_model=MedicalRecordResponse)
async def create_medical_record(request: MedicalRecordRequest):
    """
    Create a new medical record
    """
    try:
        records = load_medical_records()
        
        # Create new record
        record_id = str(uuid.uuid4())
        record = MedicalRecordResponse(
            record_id=record_id,
            patient_id=request.patient_id,
            record_type=request.record_type,
            title=request.title,
            description=request.description,
            date=request.date,
            doctor_id=request.doctor_id,
            doctor_name=request.doctor_name,
            attachments=request.attachments or [],
            created_at=datetime.now().isoformat()
        )
        
        # Add to list
        records.append(record.dict())
        
        # Save to file
        save_medical_records(records)
        
        return record
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating medical record: {str(e)}")


@router.get("/patient/{patient_id}", response_model=GetMedicalRecordsResponse)
async def get_patient_records(patient_id: str):
    """
    Get all medical records for a patient
    """
    try:
        records = load_medical_records()
        patient_records = [
            MedicalRecordResponse(**rec) for rec in records
            if rec.get('patient_id') == patient_id
        ]
        
        # Sort by date (most recent first)
        patient_records.sort(key=lambda x: x.date, reverse=True)
        
        return GetMedicalRecordsResponse(
            success=True,
            records=patient_records
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving medical records: {str(e)}")


@router.get("/{record_id}", response_model=MedicalRecordResponse)
async def get_medical_record(record_id: str):
    """
    Get a specific medical record by ID
    """
    try:
        records = load_medical_records()
        for rec in records:
            if rec.get('record_id') == record_id:
                return MedicalRecordResponse(**rec)
        
        raise HTTPException(status_code=404, detail="Medical record not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving medical record: {str(e)}")

