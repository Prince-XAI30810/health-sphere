# Triage Agent System

## Overview
The Triage Agent is a React-based conversational AI agent that collects patient information through a structured question-answer flow and recommends appropriate doctors based on symptoms.

## Architecture

### Components

1. **Triage Agent Service** (`services/triage_agent.py`)
   - Implements React pattern (sequential question-answer flow)
   - Uses Azure OpenAI with JSON mode for structured responses
   - Manages conversation state and collected information
   - Recommends doctors based on symptoms

2. **API Endpoints** (`api/triage.py`)
   - `POST /api/triage/start` - Start a new triage session
   - `POST /api/triage/message` - Send a message to the agent
   - `GET /api/triage/conversation/{session_id}` - Get conversation history

3. **Data Files**
   - `doctor_data.json` - Contains doctor information with specialties and available slots
   - `conversations/` - Directory storing conversation history by session ID

### Flow

1. **Session Initialization**
   - User starts a new assessment
   - Backend creates a session ID and initial greeting message
   - Session is stored in `conversations/{session_id}.json`

2. **Question-Answer Flow**
   The agent asks three questions sequentially:
   - **Issue**: "What health issue or symptom are you experiencing?"
   - **Severity**: "How severe is this issue? (mild/moderate/severe/critical)"
   - **Duration**: "How long have you been experiencing this?"

3. **Doctor Recommendation**
   - Once all three pieces of information are collected
   - Agent analyzes symptoms and recommends appropriate doctor specialty
   - Doctor details and available appointment slots are displayed

4. **Conversation Storage**
   - All messages are saved with timestamps
   - Collected information is tracked and updated
   - Conversations can be retrieved by session ID

## LLM Integration

- **Model**: Azure OpenAI (GPT-4o-mini)
- **Response Format**: JSON mode for structured responses
- **Prompt Engineering**: System prompt guides the agent through the question sequence
- **State Management**: Current collected info is included in system prompt for context

## Frontend Integration

The frontend (`health-sphere/src/pages/patient/AITriage.tsx`) has been updated to:
- Initialize session on component mount
- Send messages to backend API
- Display bot responses with triage levels
- Show doctor recommendation cards with appointment scheduling
- Handle errors gracefully

## API Usage Examples

### Start Session
```bash
POST http://localhost:8001/api/triage/start
Content-Type: application/json

{}
```

Response:
```json
{
  "success": true,
  "session_id": "uuid-here",
  "initial_message": "Hello! I'm MediVerse's AI Health Assistant...",
  "message": "Session started successfully"
}
```

### Send Message
```bash
POST http://localhost:8001/api/triage/message
Content-Type: application/json

{
  "session_id": "uuid-here",
  "message": "I have a headache"
}
```

Response:
```json
{
  "success": true,
  "response": {
    "type": "question",
    "message": "How severe is this headache?",
    "question_type": "severity",
    "collected_info": {
      "issue": "headache",
      "severity": null,
      "duration": null
    },
    "is_complete": false
  },
  "collected_info": {
    "issue": "headache",
    "severity": null,
    "duration": null
  }
}
```

### Get Conversation
```bash
GET http://localhost:8001/api/triage/conversation/{session_id}
```

## Doctor Data Structure

Doctors are stored in `doctor_data.json` with:
- Basic info (name, specialty, qualifications, experience, rating)
- Available appointment slots (date, time, availability)
- Contact information

## Error Handling

- Invalid session IDs return 404
- LLM parsing errors are caught and return user-friendly messages
- Network errors are handled gracefully in frontend
- All errors are logged for debugging

## Future Enhancements

- Support for multiple languages
- Integration with actual appointment booking system
- More sophisticated doctor matching algorithms
- Conversation history retrieval for users
- Support for follow-up questions

