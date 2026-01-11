"""
Consultation API - Handles audio processing, transcription, KPI extraction, and storage
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
import json
from pathlib import Path
from datetime import datetime
import os
import tempfile

import sys
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from adapters.azure_openai import AzureOpenAIHelper
from adapters.speech_to_text import AzureSpeechHelper
from adapters.logger import logger

router = APIRouter(prefix="/api/consultation", tags=["consultation"])

# Path to data files
DATA_DIR = Path(__file__).parent.parent / "data" / "doctor"
CONSULTATIONS_FILE = DATA_DIR / "consultations.json"
RECORDINGS_DIR = DATA_DIR / "recordings"

# Ensure recordings directory exists
RECORDINGS_DIR.mkdir(parents=True, exist_ok=True)


class Medication(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str


class AIAnalysis(BaseModel):
    call_summary: str
    symptoms: List[str]
    diagnosis: str
    prescriptions: List[Medication]


class ConsultationData(BaseModel):
    consultation_id: str
    patient_id: str
    patient_name: str
    date: str
    duration: str
    transcript: Optional[str] = ""
    ai_analysis: Optional[AIAnalysis] = None
    notes: Optional[str] = ""
    prescription_sent: bool = False
    created_at: str


class SaveConsultationRequest(BaseModel):
    consultation_id: str
    patient_id: str
    patient_name: str
    date: str
    duration: str
    symptoms: List[str]
    diagnosis: str
    notes: str
    medications: List[Medication]
    call_summary: str
    prescription_sent: bool


def load_consultations() -> List[Dict]:
    """Load consultations from JSON file"""
    try:
        if CONSULTATIONS_FILE.exists():
            with open(CONSULTATIONS_FILE, 'r') as f:
                data = json.load(f)
                return data.get('consultations', [])
        return []
    except Exception as e:
        logger.error(f"Error loading consultations: {e}")
        return []


def save_consultations(consultations: List[Dict]):
    """Save consultations to JSON file"""
    try:
        with open(CONSULTATIONS_FILE, 'w') as f:
            json.dump({"consultations": consultations}, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving consultations: {e}")
        raise HTTPException(status_code=500, detail="Failed to save consultation")


def extract_kpis_from_transcript(transcript: str, patient_name: str, chief_complaint: str = "") -> Dict:
    """Use LLM to extract KPIs from the consultation transcript"""
    try:
        llm = AzureOpenAIHelper()
        
        prompt = f"""Analyze this doctor-patient consultation transcript and extract the following information in JSON format.

The patient's name is {patient_name} and their chief complaint was: {chief_complaint}

Extract:
1. "call_summary": A brief 2-3 sentence professional summary of what was discussed
2. "symptoms": An array of symptoms mentioned by the patient (be specific)
3. "diagnosis": The doctor's diagnosis if mentioned, otherwise "Pending evaluation"
4. "prescriptions": An array of medications with "name", "dosage", "frequency", "duration" for each

IMPORTANT: Return ONLY valid JSON, no markdown or extra text.

Transcript:
{transcript}

If the transcript is empty or unclear, provide reasonable defaults based on the chief complaint."""

        messages = [
            {"role": "system", "content": "You are a medical transcription AI that extracts structured information from doctor-patient consultations. Always respond with valid JSON only."},
            {"role": "user", "content": prompt}
        ]
        
        response = llm.get_response(messages, json_mode=True)
        
        if response and response != "Azure OpenAI Not Responding":
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse LLM response as JSON: {response}")
                return get_default_analysis(patient_name, chief_complaint)
        
        return get_default_analysis(patient_name, chief_complaint)
        
    except Exception as e:
        logger.error(f"Error extracting KPIs: {e}")
        return get_default_analysis(patient_name, chief_complaint)


def get_default_analysis(patient_name: str, chief_complaint: str) -> Dict:
    """Return default analysis when LLM fails"""
    return {
        "call_summary": f"Consultation completed with {patient_name}. Patient presented with {chief_complaint}. Further evaluation recommended.",
        "symptoms": [chief_complaint] if chief_complaint else ["Not specified"],
        "diagnosis": "Pending evaluation",
        "prescriptions": []
    }


@router.post("/process-recording")
async def process_recording(
    audio: UploadFile = File(...),
    patient_id: str = Form(...),
    patient_name: str = Form(...),
    chief_complaint: str = Form(""),
    duration: str = Form("00:00")
):
    """
    Process an audio recording: transcribe and extract KPIs using LLM.
    """
    try:
        # Save the uploaded audio to a temp file
        temp_dir = tempfile.gettempdir()
        audio_path = os.path.join(temp_dir, f"consultation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav")
        
        with open(audio_path, 'wb') as f:
            content = await audio.read()
            f.write(content)
        
        logger.info(f"Audio file saved to {audio_path}")
        
        # Transcribe the audio
        speech_helper = AzureSpeechHelper()
        transcript = speech_helper.transcribe_from_file(audio_path)
        
        logger.info(f"Transcription completed: {transcript[:100]}..." if transcript else "No transcription")
        
        # Extract KPIs using LLM
        ai_analysis = extract_kpis_from_transcript(transcript, patient_name, chief_complaint)
        
        # Clean up temp file
        try:
            os.remove(audio_path)
        except:
            pass
        
        # Generate consultation ID
        consultation_id = f"CONS-{int(datetime.now().timestamp() * 1000)}"
        
        return JSONResponse({
            "success": True,
            "consultation_id": consultation_id,
            "transcript": transcript,
            "ai_analysis": ai_analysis,
            "message": "Recording processed successfully"
        })
        
    except Exception as e:
        logger.error(f"Error processing recording: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save")
async def save_consultation(request: SaveConsultationRequest):
    """
    Save a completed consultation to storage.
    """
    try:
        consultations = load_consultations()
        
        # Create consultation record
        consultation = {
            "consultation_id": request.consultation_id,
            "patient_id": request.patient_id,
            "patient_name": request.patient_name,
            "date": request.date,
            "duration": request.duration,
            "symptoms": request.symptoms,
            "diagnosis": request.diagnosis,
            "notes": request.notes,
            "medications": [med.dict() for med in request.medications],
            "call_summary": request.call_summary,
            "prescription_sent": request.prescription_sent,
            "created_at": datetime.now().isoformat(),
            "kpis": {
                "consultationTime": request.duration,
                "medicationsPrescribed": len(request.medications),
                "followUpRequired": len(request.medications) > 0
            }
        }
        
        # Check if consultation already exists (update case)
        existing_idx = None
        for i, c in enumerate(consultations):
            if c.get('consultation_id') == request.consultation_id:
                existing_idx = i
                break
        
        if existing_idx is not None:
            consultations[existing_idx] = consultation
        else:
            consultations.append(consultation)
        
        save_consultations(consultations)
        
        return JSONResponse({
            "success": True,
            "consultation_id": request.consultation_id,
            "message": "Consultation saved successfully"
        })
        
    except Exception as e:
        logger.error(f"Error saving consultation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{consultation_id}")
async def get_consultation(consultation_id: str):
    """
    Get a specific consultation by ID.
    """
    try:
        consultations = load_consultations()
        
        for consultation in consultations:
            if consultation.get('consultation_id') == consultation_id:
                return {"success": True, "consultation": consultation}
        
        raise HTTPException(status_code=404, detail="Consultation not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting consultation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def list_consultations():
    """
    List all consultations.
    """
    try:
        consultations = load_consultations()
        return {
            "success": True,
            "consultations": consultations,
            "count": len(consultations)
        }
    except Exception as e:
        logger.error(f"Error listing consultations: {e}")
        raise HTTPException(status_code=500, detail=str(e))
