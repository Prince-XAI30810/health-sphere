# 🏥 HealthSphere - AI-Powered Healthcare Ecosystem

<div align="center">

![HealthSphere Banner](https://img.shields.io/badge/HealthSphere-AI%20Healthcare-0EA5E9?style=for-the-badge&logo=health&logoColor=white)

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

**A comprehensive healthcare management platform featuring AI-powered triage, telehealth consultations, and hospital operations management.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Usage](#-usage) • [API Documentation](#-api-documentation)

</div>

---

## ✨ Features

### 🧑‍⚕️ Patient Portal
- **AI Triage Agent** - Intelligent symptom assessment with natural language processing
- **Smart Appointment Booking** - AI-recommended specialist matching based on symptoms
- **Health Records** - Comprehensive view of medical history, lab results, and conditions
- **Prescription Management** - Track medications with AI-powered compliance insights
- **Medicine Intake Analysis** - AI-driven medication pattern analysis and suggestions
- **Telehealth Integration** - Video consultation capabilities with doctors
- **Notifications** - Real-time appointment reminders and health alerts

### 👨‍⚕️ Doctor Portal
- **Patient Queue Management** - Priority-based queue with triage levels (Red/Yellow/Green)
- **Video Consultations** - Live video calls with camera streaming and recording
- **AI-Powered Call Transcription** - Azure Speech-to-Text transcription during consultations
- **Smart Consultation Notes** - Automatic KPI extraction (diagnosis, symptoms, prescriptions)
- **AI Chatbot** - LLM-powered assistant for medical queries with patient context
- **Prescription Writing** - Digital prescriptions with pharmacy stock integration
- **Discharge Summary Generator** - AI-generated discharge documentation

### 🏢 Admin Portal
- **Analytics Dashboard** - Bed occupancy, wait times, and revenue metrics
- **Bed Management (ADT)** - Visual ward grid with drag-and-drop patient transfers
- **Inventory Management** - AI-driven stock monitoring with reorder recommendations
- **Staff Roster Planning** - Shift scheduling with calendar view
- **Lab & Imaging Tracking** - Kanban board for test status management
- **Billing & Insurance** - Claims processing and invoice management

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI Components |
| **Radix UI** | Accessible Primitives |
| **React Router** | Navigation |
| **React Query** | Data Fetching |
| **Recharts** | Analytics Charts |
| **Lucide React** | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | REST API Framework |
| **Python 3.x** | Backend Language |
| **Pydantic** | Data Validation |
| **Uvicorn** | ASGI Server |
| **Azure OpenAI** | LLM Integration |
| **Azure Speech Services** | Speech-to-Text |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.x ([Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- **Python** >= 3.9
- **npm** or **bun**

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/health-sphere.git
cd health-sphere

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8001
```

The API will be available at `http://localhost:8001`

### Environment Configuration

Create a `creds.json` file in the `backend` directory with your Azure credentials:

```json
{
  "azure_openai_endpoint": "YOUR_AZURE_OPENAI_ENDPOINT",
  "azure_openai_key": "YOUR_AZURE_OPENAI_KEY",
  "azure_speech_key": "YOUR_AZURE_SPEECH_KEY",
  "azure_speech_region": "YOUR_AZURE_REGION"
}
```

---

## 📖 Usage

### User Roles

HealthSphere supports three distinct user roles:

| Role | Access | Features |
|------|--------|----------|
| **Patient** | `/patient/*` | Triage, appointments, health records, prescriptions |
| **Doctor** | `/doctor/*` | Patient queue, consultations, prescriptions, chatbot |
| **Admin** | `/admin/*` | Analytics, inventory, bed management, billing |

### Login

The login page features a role-based authentication system. Select your role to access the appropriate portal.

### AI Triage Flow

1. Patient describes symptoms in natural language
2. AI analyzes symptoms and determines severity level
3. System recommends appropriate specialist
4. Appointment is automatically scheduled with matched doctor

---

## 📚 API Documentation

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User authentication |
| `GET` | `/api/patient/dashboard` | Patient dashboard data |
| `POST` | `/api/triage/chat` | AI triage conversation |
| `GET` | `/api/doctor/queue` | Doctor's patient queue |
| `POST` | `/api/doctor/consultation` | Save consultation |
| `GET` | `/api/admin/inventory` | Inventory items |

### Triage Agent API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/triage/start` | Start new triage session |
| `POST` | `/api/triage/chat` | Continue triage conversation |
| `POST` | `/api/triage/book-appointment` | Book with recommended doctor |

For detailed API documentation, run the backend and visit:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

---

## 📁 Project Structure

```
health-sphere/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   │   ├── patient/        # Patient portal pages
│   │   ├── doctor/         # Doctor portal pages
│   │   └── admin/          # Admin portal pages
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── data/               # Mock data
│   └── lib/                # Utilities
├── backend/                # FastAPI backend
│   ├── api/                # API routes
│   ├── adapters/           # External service adapters
│   ├── services/           # Business logic
│   ├── data/               # JSON data storage
│   └── conversations/      # Triage conversation logs
├── public/                 # Static assets
└── package.json            # Frontend dependencies
```

---

## 🎨 Design System

| Element | Value |
|---------|-------|
| **Primary Color** | `#0EA5E9` (Sky Blue) |
| **Secondary Color** | `#10B981` (Emerald Green) |
| **Neutral Color** | `#64748B` (Slate) |
| **Background** | `#F8FAFC` (Light Gray) |
| **Border Radius** | `rounded-lg` |
| **Typography** | Inter / System UI |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for **Tech-AI-Thon** hackathon
- UI components powered by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- AI capabilities powered by Azure OpenAI

---

<div align="center">

**[⬆ Back to Top](#-healthsphere---ai-powered-healthcare-ecosystem)**

Made with ❤️ for better healthcare

</div>
