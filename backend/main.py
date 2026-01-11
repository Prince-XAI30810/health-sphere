from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from pathlib import Path

# Import models
from models import LoginRequest, LoginResponse, UserResponse

# Import routers
from api.triage import router as triage_router
from api.appointments import router as appointments_router
from api.medical_records import router as medical_records_router
from api.patient_summary import router as patient_summary_router
from api.doctor_chatbot import router as doctor_chatbot_router

app = FastAPI(title="MediVerse API", version="1.0.0")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:5173", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to creds.json
CREDS_FILE = Path(__file__).parent / "creds.json"


def load_credentials():
    """Load credentials from creds.json file"""
    try:
        with open(CREDS_FILE, 'r') as f:
            data = json.load(f)
            return data.get('users', [])
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Credentials file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid credentials file format")


@app.get("/")
async def root():
    return {"message": "MediVerse API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    Login endpoint that validates user credentials
    """
    users = load_credentials()
    
    # Find user by email and role
    user = None
    for u in users:
        if u.get('email') == login_data.email and u.get('role') == login_data.role:
            user = u
            break
    
    # Validate user exists
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or role"
        )
    
    # Validate password
    if user.get('password') != login_data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )
    
    # Return user data (excluding password)
    user_response = UserResponse(
        id=user['id'],
        name=user['name'],
        email=user['email'],
        role=user['role'],
        avatar=user.get('avatar')
    )
    
    return LoginResponse(
        success=True,
        message="Login successful",
        user=user_response
    )


# Include routers
app.include_router(triage_router)
app.include_router(appointments_router)
app.include_router(medical_records_router)
app.include_router(patient_summary_router)
app.include_router(doctor_chatbot_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
    "main:app",
    host="0.0.0.0",
    port=8001,
    reload=True
)
