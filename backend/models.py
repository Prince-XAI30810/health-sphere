"""
Pydantic models for MediVerse API
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


# ==================== Authentication Models ====================

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar: Optional[str] = None


class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None


# ==================== Triage Models ====================

class StartSessionRequest(BaseModel):
    user_id: Optional[str] = None


class StartSessionResponse(BaseModel):
    success: bool
    session_id: str
    initial_message: str
    message: str


class SendMessageRequest(BaseModel):
    session_id: str
    message: str


class MessageResponse(BaseModel):
    id: int
    type: str
    content: str
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None


class SendMessageResponse(BaseModel):
    success: bool
    response: Dict[str, Any]
    recommended_doctor: Optional[Dict[str, Any]] = None
    collected_info: Dict[str, Any]


class ConversationResponse(BaseModel):
    session_id: str
    user_id: Optional[str]
    created_at: str
    messages: List[MessageResponse]
    collected_info: Dict[str, Any]
    status: str


class SessionSummary(BaseModel):
    session_id: str
    created_at: str
    status: str
    symptom: Optional[str] = None
    triage_level: Optional[str] = None
    recommended_doctor: Optional[str] = None


class UserSessionsResponse(BaseModel):
    success: bool
    sessions: List[SessionSummary]


# ==================== Appointment Models ====================

class ScheduleAppointmentRequest(BaseModel):
    patient_id: str
    patient_name: str
    patient_email: str
    doctor_id: str
    doctor_name: str
    appointment_date: str
    appointment_time: str
    reason: Optional[str] = None
    triage_session_id: Optional[str] = None
    symptoms: Optional[str] = None
    pain_rating: Optional[str] = None


class AppointmentResponse(BaseModel):
    appointment_id: str
    patient_id: str
    patient_name: str
    patient_email: str
    doctor_id: str
    doctor_name: str
    appointment_date: str
    appointment_time: str
    status: str
    reason: Optional[str] = None
    created_at: str
    triage_session_id: Optional[str] = None
    symptoms: Optional[str] = None
    pain_rating: Optional[str] = None


class ScheduleAppointmentResponse(BaseModel):
    success: bool
    message: str
    appointment: AppointmentResponse


class GetAppointmentsResponse(BaseModel):
    success: bool
    appointments: List[AppointmentResponse]


# ==================== Medical Records Models ====================

class MedicalRecordRequest(BaseModel):
    patient_id: str
    record_type: str
    title: str
    description: str
    date: str
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    attachments: Optional[List[str]] = None


class MedicalRecordResponse(BaseModel):
    record_id: str
    patient_id: str
    record_type: str
    title: str
    description: str
    date: str
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    attachments: Optional[List[str]] = None
    created_at: str


class GetMedicalRecordsResponse(BaseModel):
    success: bool
    records: List[MedicalRecordResponse]


# ==================== Doctor Patient Summary Models ====================

class PatientSummaryRequest(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None


class PatientSummaryResponse(BaseModel):
    success: bool
    patient_id: str
    patient_name: str
    patient_email: str
    summary: str
    medical_records: List[MedicalRecordResponse]
    appointments: List[AppointmentResponse]
    triage_sessions: List[SessionSummary]

