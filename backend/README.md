# MediVerse Backend API

FastAPI backend for the MediVerse healthcare application.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure `creds.json` exists in the backend directory with user credentials.

3. Run the FastAPI server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --port 8001
```

The API will be available at `http://localhost:8001`

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running
- `GET /` - Root endpoint

### Authentication
- `POST /api/auth/login` - Login endpoint

#### Login Request Body:
```json
{
  "email": "patient@mediverse.com",
  "password": "patient123",
  "role": "patient"
}
```

#### Login Response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "p1",
    "name": "Rahul Sharma",
    "email": "patient@mediverse.com",
    "role": "patient",
    "avatar": "RS"
  }
}
```

## Default Credentials

The system comes with three default users (one for each portal):

1. **Patient Portal**
   - Email: `patient@mediverse.com`
   - Password: `patient123`

2. **Doctor Portal**
   - Email: `doctor@mediverse.com`
   - Password: `doctor123`

3. **Admin Portal**
   - Email: `admin@mediverse.com`
   - Password: `admin123`

## CORS

The API is configured to accept requests from:
- `http://localhost:5173` (default Vite dev server)
- `http://localhost:3000` (alternative dev server)
- `http://localhost:8000` (custom frontend port)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:8000`

