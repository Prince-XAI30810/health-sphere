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
        """Generate simple 2-line patient summary from appointments.json"""
        try:
            # Load all patient data
            appointments = self._load_appointments(patient_id)
            medical_records = self._load_medical_records(patient_id)
            triage_sessions = self._load_triage_sessions(patient_id)
            
            # Get the most recent appointment
            latest_appointment = None
            if appointments:
                # Sort by date and get the most recent
                sorted_appointments = sorted(
                    appointments, 
                    key=lambda x: x.get('appointment_date', ''), 
                    reverse=True
                )
                latest_appointment = sorted_appointments[0]
            
            # Create simple 2-line summary from appointments.json
            patient_profile = None
            if latest_appointment:
                symptoms = latest_appointment.get('symptoms', '')
                pain_rating = latest_appointment.get('pain_rating', '')
                doctor_name = latest_appointment.get('doctor_name', '')
                appointment_time = latest_appointment.get('appointment_time', '')
                
                # Get duration from triage session if available
                duration = None
                if latest_appointment.get('triage_session_id'):
                    for session in triage_sessions:
                        if session.get('session_id') == latest_appointment.get('triage_session_id'):
                            collected_info = session.get('collected_info', {})
                            duration = collected_info.get('duration')
                            break
                
                # Line 1: Symptoms with duration
                line1 = symptoms or "General consultation"
                if duration:
                    line1 = f"{symptoms} for {duration}" if symptoms else f"General consultation for {duration}"
                
                # Line 2: Pain level and doctor
                if pain_rating:
                    line2 = f"Pain level {pain_rating}/10"
                else:
                    line2 = "Consult with doctor"
                
                if doctor_name:
                    line2 += f" - {doctor_name}"
                
                summary = f"{line1}\n{line2}"
                
                # Create patient profile
                patient_profile = {
                    "age": None,  # Not available in current data structure
                    "gender": None,  # Not available in current data structure
                    "blood_group": None,  # Not available in current data structure
                    "appointment_time": appointment_time,
                    "chief_complaint": symptoms
                }
            else:
                # No appointments found
                summary = f"Patient {patient_name}\nNo appointments scheduled"
            
            return {
                "success": True,
                "patient_id": patient_id,
                "patient_name": patient_name,
                "patient_email": patient_email,
                "summary": summary,
                "appointments": appointments,
                "medical_records": medical_records,
                "triage_sessions": triage_sessions,
                "patient_profile": patient_profile
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
                                           appointment_time: str,
                                           ai_summary: Optional[List[str]] = None) -> Dict:
        """Generate simple 2-line patient summary for patient queue from appointments.json"""
        try:
            # Load appointment from appointments.json
            appointment = None
            if APPOINTMENTS_FILE.exists():
                with open(APPOINTMENTS_FILE, 'r') as f:
                    data = json.load(f)
                    appointments_list = data.get('appointments', [])
                    # Find the appointment by appointment_id
                    for apt in appointments_list:
                        if apt.get('appointment_id') == appointment_id:
                            appointment = apt
                            break
            
            # Get symptoms and pain_rating from appointment if not provided
            if appointment:
                symptoms = symptoms or appointment.get('symptoms', '')
                pain_rating = pain_rating or appointment.get('pain_rating', '')
            
            # Use passed-in ai_summary first (to avoid race condition), 
            # then fall back to appointment's ai_summary if available
            summary = None
            key_points = []
            if ai_summary and isinstance(ai_summary, list) and len(ai_summary) > 0:
                # Use the directly passed ai_summary (2-line summary from LLM)
                summary = '\n'.join(ai_summary)
                # Use the ai_summary lines as key points for display
                key_points = ai_summary.copy()
            elif appointment and appointment.get('ai_summary') and isinstance(appointment.get('ai_summary'), list):
                # Fallback: Use the ai_summary from appointment file
                ai_summary_lines = appointment.get('ai_summary', [])
                summary = '\n'.join(ai_summary_lines)
                # Use the ai_summary lines as key points for display
                key_points = ai_summary_lines.copy()
            else:
                # Fallback: Calculate triage score from pain rating
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
                
                # Get duration from triage session if available
                duration = None
                if appointment and appointment.get('triage_session_id'):
                    try:
                        triage_sessions = self._load_triage_sessions(patient_id)
                        for session in triage_sessions:
                            if session.get('session_id') == appointment.get('triage_session_id'):
                                collected_info = session.get('collected_info', {})
                                duration = collected_info.get('duration')
                                break
                    except:
                        pass
                
                # Create simple 2-line summary from appointments.json data
                # Line 1: Symptoms with duration if available
                line1 = symptoms or "General consultation"
                if duration:
                    line1 = f"{symptoms} for {duration}" if symptoms else f"General consultation for {duration}"
                
                # Line 2: Pain level and doctor info
                if pain_rating:
                    line2 = f"Pain level {pain_rating}/10"
                else:
                    line2 = "Consult with doctor"
                
                # If doctor name is available, add it
                if appointment and appointment.get('doctor_name'):
                    doctor_name = appointment.get('doctor_name', '')
                    line2 += f" - {doctor_name}"
                
                # Create simple 2-line summary
                summary = f"{line1}\n{line2}"
                
                # Create key points from symptoms, pain rating, and duration
                if symptoms and duration:
                    key_points.append(f"{symptoms} for {duration}")
                elif symptoms:
                    key_points.append(symptoms)
                if pain_rating:
                    key_points.append(f"Pain level {pain_rating}/10")
                if appointment and appointment.get('doctor_name'):
                    doctor_name = appointment.get('doctor_name', '')
                    specialty = "General Physician"  # Default, can be enhanced later
                    key_points.append(f"Consult with {doctor_name}, {specialty}")
            
            # Calculate triage score from pain rating (needed for queue)
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
            
            # Get patient profile info from triage session if available
            age = None
            gender = None
            blood_group = None
            if appointment and appointment.get('triage_session_id'):
                try:
                    triage_sessions = self._load_triage_sessions(patient_id)
                    for session in triage_sessions:
                        if session.get('session_id') == appointment.get('triage_session_id'):
                            collected_info = session.get('collected_info', {})
                            # Try to extract from collected_info if available
                            # For now, use defaults as these aren't collected in triage
                            break
                except:
                    pass
            
            # Create queue entry with patient profile info
            queue_entry = {
                "appointment_id": appointment_id,
                "patient_id": patient_id,
                "patient_name": patient_name,
                "doctor_id": doctor_id,
                "appointment_date": appointment_date,
                "appointment_time": appointment_time,
                "status": "scheduled",
                "triage_score": triage_score,
                "summary": summary,
                "key_points": key_points,
                "symptoms": symptoms,
                "pain_rating": pain_rating,
                "chief_complaint": symptoms,  # Chief complaint is the symptoms
                "age": age,  # Will be None if not available
                "gender": gender,  # Will be None if not available
                "blood_group": blood_group,  # Will be None if not available
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
            
            # Create simple fallback summary
            line1 = symptoms or "General consultation"
            line2 = f"Pain level {pain_rating}/10" if pain_rating else "Consult with doctor"
            summary = f"{line1}\n{line2}"
            
            return {
                "appointment_id": appointment_id,
                "patient_id": patient_id,
                "patient_name": patient_name,
                "doctor_id": doctor_id,
                "appointment_date": appointment_date,
                "appointment_time": appointment_time,
                "status": "scheduled",
                "triage_score": triage_score,
                "summary": summary,
                "key_points": [symptoms] if symptoms else [],
                "symptoms": symptoms,
                "pain_rating": pain_rating,
                "created_at": datetime.now().isoformat()
            }

