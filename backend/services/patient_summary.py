"""
Patient Summary Service
Generates AI-powered patient summaries for doctors
"""
import json
from typing import Dict, List, Optional
from pathlib import Path
from datetime import datetime

import sys
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from adapters.azure_openai import AzureOpenAIHelper
from adapters.logger import logger

# Paths - organized by patient and doctor folders
DATA_DIR = backend_path / "data"
PATIENT_DIR = DATA_DIR / "patient"
DOCTOR_DIR = DATA_DIR / "doctor"
PATIENT_DIR.mkdir(parents=True, exist_ok=True)
DOCTOR_DIR.mkdir(parents=True, exist_ok=True)

APPOINTMENTS_FILE = DOCTOR_DIR / "appointments.json"
MEDICAL_RECORDS_FILE = PATIENT_DIR / "medical_records.json"
CONVERSATIONS_DIR = PATIENT_DIR / "conversations"
CONVERSATIONS_DIR.mkdir(exist_ok=True)


class PatientSummaryService:
    """Service to generate patient summaries for doctors"""
    
    def __init__(self):
        self.llm = AzureOpenAIHelper()
    
    def _load_appointments(self, patient_id: str) -> List[Dict]:
        """Load appointments for a patient"""
        try:
            if APPOINTMENTS_FILE.exists():
                with open(APPOINTMENTS_FILE, 'r') as f:
                    data = json.load(f)
                    return [apt for apt in data.get('appointments', []) if apt.get('patient_id') == patient_id]
            return []
        except Exception as e:
            logger.error(f"Error loading appointments: {e}")
            return []
    
    def _load_medical_records(self, patient_id: str) -> List[Dict]:
        """Load medical records for a patient"""
        try:
            if MEDICAL_RECORDS_FILE.exists():
                with open(MEDICAL_RECORDS_FILE, 'r') as f:
                    data = json.load(f)
                    return [rec for rec in data.get('records', []) if rec.get('patient_id') == patient_id]
            return []
        except Exception as e:
            logger.error(f"Error loading medical records: {e}")
            return []
    
    def _load_triage_sessions(self, patient_id: Optional[str] = None) -> List[Dict]:
        """Load triage sessions (if patient_id is provided, filter by it)"""
        sessions = []
        try:
            if CONVERSATIONS_DIR.exists():
                for file_path in CONVERSATIONS_DIR.glob("*.json"):
                    try:
                        with open(file_path, 'r') as f:
                            session = json.load(f)
                            if not patient_id or session.get("user_id") == patient_id:
                                sessions.append(session)
                    except Exception as e:
                        continue
            return sessions
        except Exception as e:
            logger.error(f"Error loading triage sessions: {e}")
            return []
    
    def _build_summary_prompt(self, patient_name: str, appointments: List[Dict], 
                              medical_records: List[Dict], triage_sessions: List[Dict]) -> str:
        """Build prompt for generating patient summary"""
        
        # Format appointments
        appointments_text = ""
        if appointments:
            appointments_text = "\n**Appointments:**\n"
            for apt in appointments[:5]:  # Last 5 appointments
                appointments_text += f"- {apt.get('appointment_date')} at {apt.get('appointment_time')}: {apt.get('reason', 'No reason provided')}\n"
                if apt.get('symptoms'):
                    appointments_text += f"  Symptoms: {apt.get('symptoms')}\n"
                if apt.get('pain_rating'):
                    appointments_text += f"  Pain Rating: {apt.get('pain_rating')}/10\n"
        else:
            appointments_text = "\n**Appointments:** No previous appointments found.\n"
        
        # Format medical records
        records_text = ""
        if medical_records:
            records_text = "\n**Medical Records:**\n"
            for rec in medical_records[:10]:  # Last 10 records
                records_text += f"- {rec.get('date')} - {rec.get('title')} ({rec.get('record_type')}): {rec.get('description', '')[:100]}...\n"
        else:
            records_text = "\n**Medical Records:** No medical records found.\n"
        
        # Format triage sessions
        triage_text = ""
        if triage_sessions:
            triage_text = "\n**Recent Triage Sessions:**\n"
            for session in triage_sessions[:5]:  # Last 5 sessions
                collected_info = session.get('collected_info', {})
                issue = collected_info.get('issue', 'Unknown')
                pain_rating = collected_info.get('pain_rating', 'N/A')
                duration = collected_info.get('duration', 'Unknown')
                triage_text += f"- {session.get('created_at', '')[:10]}: {issue} (Pain: {pain_rating}/10, Duration: {duration})\n"
        else:
            triage_text = "\n**Recent Triage Sessions:** No triage sessions found.\n"
        
        prompt = f"""You are a medical assistant helping a doctor prepare for a patient consultation. Generate a concise, professional patient summary based on the following information.

**Patient:** {patient_name}
{appointments_text}
{records_text}
{triage_text}

**Instructions:**
1. Create a comprehensive but concise summary (2-3 paragraphs)
2. Highlight key medical history, recent symptoms, and concerns
3. Identify patterns or recurring issues
4. Note any urgent or important information
5. Provide context for the upcoming consultation
6. Use professional medical terminology appropriately
7. Be empathetic and patient-focused

**Format your response as:**
- A brief overview paragraph
- Key medical history and patterns
- Current concerns and symptoms
- Recommendations for the consultation

Generate the summary now:"""
        
        return prompt
    
    def generate_summary(self, patient_id: str, patient_name: str, patient_email: str) -> Dict:
        """Generate patient summary for doctor"""
        try:
            # Load all patient data
            appointments = self._load_appointments(patient_id)
            medical_records = self._load_medical_records(patient_id)
            triage_sessions = self._load_triage_sessions(patient_id)
            
            # Build prompt
            prompt = self._build_summary_prompt(patient_name, appointments, medical_records, triage_sessions)
            
            # Get LLM response
            messages = [
                {"role": "system", "content": "You are a medical assistant helping doctors prepare for patient consultations. Generate clear, concise, and professional patient summaries."},
                {"role": "user", "content": prompt}
            ]
            
            summary = self.llm.get_response(messages, json_mode=False)
            
            return {
                "success": True,
                "patient_id": patient_id,
                "patient_name": patient_name,
                "patient_email": patient_email,
                "summary": summary,
                "appointments": appointments,
                "medical_records": medical_records,
                "triage_sessions": triage_sessions
            }
            
        except Exception as e:
            logger.error(f"Error generating patient summary: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "summary": f"Error generating summary for {patient_name}. Please review patient records manually."
            }
    
    def generate_patient_summary_for_queue(self, patient_id: str, patient_name: str, 
                                           doctor_id: str, appointment_id: str,
                                           conversation_history: List[Dict],
                                           symptoms: Optional[str],
                                           pain_rating: Optional[str],
                                           appointment_date: str,
                                           appointment_time: str) -> Dict:
        """Generate patient summary for patient queue"""
        try:
            # Load patient data
            appointments = self._load_appointments(patient_id)
            medical_records = self._load_medical_records(patient_id)
            
            # Calculate triage score from pain rating
            triage_score = "low"
            if pain_rating:
                try:
                    rating = int(pain_rating)
                    if rating >= 7:
                        triage_score = "high"
                    elif rating >= 4:
                        triage_score = "medium"
                    else:
                        triage_score = "low"
                except:
                    pass
            
            # Build summary prompt
            conversation_text = ""
            if conversation_history:
                conversation_text = "\n**Recent Conversation:**\n"
                for msg in conversation_history[-10:]:  # Last 10 messages
                    msg_type = msg.get("type", "unknown")
                    content = msg.get("content", "")[:200]  # Limit length
                    conversation_text += f"- {msg_type}: {content}\n"
            
            records_summary = ""
            if medical_records:
                records_summary = f"\n**Medical History:** {len(medical_records)} records found. Recent: {medical_records[-1].get('title', 'N/A') if medical_records else 'N/A'}"
            
            prompt = f"""Generate a concise patient summary for a doctor's queue. Based on the following information:

**Patient:** {patient_name}
**Symptoms:** {symptoms or 'Not specified'}
**Pain Rating:** {pain_rating or 'N/A'}/10
**Triage Score:** {triage_score}
{conversation_text}
{records_summary}

Create a brief 2-3 sentence summary highlighting:
1. Main complaint/symptoms
2. Pain level and urgency
3. Key context from conversation

Respond in JSON format:
{{
    "summary": "Brief patient summary",
    "triage_score": "{triage_score}",
    "key_points": ["point1", "point2", "point3"]
}}"""
            
            # Get LLM response
            messages = [
                {"role": "system", "content": "You are a medical assistant. Generate concise patient summaries for doctors."},
                {"role": "user", "content": prompt}
            ]
            
            response = self.llm.get_response(messages, json_mode=True)
            summary_data = json.loads(response)
            
            # Create queue entry
            queue_entry = {
                "appointment_id": appointment_id,
                "patient_id": patient_id,
                "patient_name": patient_name,
                "doctor_id": doctor_id,
                "appointment_date": appointment_date,
                "appointment_time": appointment_time,
                "status": "scheduled",
                "triage_score": summary_data.get("triage_score", triage_score),
                "summary": summary_data.get("summary", f"Patient {patient_name} scheduled for {appointment_date} at {appointment_time}"),
                "key_points": summary_data.get("key_points", []),
                "symptoms": symptoms,
                "pain_rating": pain_rating,
                "created_at": datetime.now().isoformat()
            }
            
            return queue_entry
            
        except Exception as e:
            logger.error(f"Error generating patient summary for queue: {e}", exc_info=True)
            # Return basic entry even if summary generation fails
            triage_score = "low"
            if pain_rating:
                try:
                    rating = int(pain_rating)
                    if rating >= 7:
                        triage_score = "high"
                    elif rating >= 4:
                        triage_score = "medium"
                except:
                    pass
            
            return {
                "appointment_id": appointment_id,
                "patient_id": patient_id,
                "patient_name": patient_name,
                "doctor_id": doctor_id,
                "appointment_date": appointment_date,
                "appointment_time": appointment_time,
                "status": "scheduled",
                "triage_score": triage_score,
                "summary": f"Patient {patient_name} - {symptoms or 'No symptoms specified'}",
                "key_points": [symptoms] if symptoms else [],
                "symptoms": symptoms,
                "pain_rating": pain_rating,
                "created_at": datetime.now().isoformat()
            }

