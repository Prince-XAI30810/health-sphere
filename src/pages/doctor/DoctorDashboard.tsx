import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AIInsightPopover } from '@/components/shared/AIInsightPopover';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Video,
  ClipboardList,
  Clock,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Phone,
  TestTube,
  MessageSquare,
  Calendar,
  Sparkles,
  User,
  Bell,
  FileText,
  Pill,
  Syringe,
  Eye,
  Download,
  Bot,
  Send,
  X,
  Minimize2,
} from 'lucide-react';

interface QueuePatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  triageLevel: 'high' | 'medium' | 'low';
  waitTime: string;
  status: 'waiting' | 'in-progress' | 'checked-in';
  phone?: string;
  bloodGroup?: string;
  allergies?: string[];
  appointmentTime?: string;
  medicalHistory?: Array<{ date: string; diagnosis: string; doctor: string }>;
  labReports?: Array<{ 
    id: number; 
    test: string; 
    date: string; 
    doctor: string; 
    status: string;
    aiInsights?: string[];
    results?: Record<string, { value: string; normal: string; unit?: string }>;
    lab?: string;
  }>;
  prescriptions?: Array<{ 
    id: number; 
    date: string; 
    doctor: string; 
    diagnosis: string; 
    medications: string[];
    aiInsights?: string[];
    specialty?: string;
    additionalNotes?: string;
  }>;
  aiAnalysis?: {
    riskScore: number;
    suggestedTests: string[];
    priorityReason: string;
    conversationSummary: string;
    recommendations: string[];
  };
}

const patientQueue: QueuePatient[] = [
  {
    id: 'P001',
    name: 'Arun Mehta',
    age: 45,
    gender: 'Male',
    chiefComplaint: 'Chest discomfort, shortness of breath',
    triageLevel: 'high',
    waitTime: '2 min',
    status: 'waiting',
    phone: '+91 98765 43210',
    bloodGroup: 'B+',
    allergies: ['Aspirin'],
    appointmentTime: '10:30 AM',
    medicalHistory: [
      { date: 'Nov 15, 2025', diagnosis: 'Hypertension', doctor: 'Dr. Arjun Singh' },
      { date: 'Aug 20, 2025', diagnosis: 'Routine Checkup', doctor: 'Dr. Priya Patel' },
    ],
    labReports: [
      { 
        id: 1, 
        test: 'Complete Blood Count', 
        date: 'Nov 10, 2025', 
        doctor: 'Dr. Arjun Singh', 
        status: 'Normal',
        lab: 'City Health Lab',
        aiInsights: [
          'All blood cell counts are within healthy ranges',
          'Hemoglobin levels are optimal for oxygen transport',
          'No signs of infection or anemia detected'
        ],
        results: {
          'Hemoglobin': { value: '14.8', normal: '12.0-17.0', unit: 'g/dL' },
          'White Blood Cells': { value: '7.2', normal: '4.0-11.0', unit: '×10³/µL' },
          'Platelets': { value: '250', normal: '150-450', unit: '×10³/µL' },
        }
      },
      { 
        id: 2, 
        test: 'Lipid Profile', 
        date: 'Oct 5, 2025', 
        doctor: 'Dr. Arjun Singh', 
        status: 'Borderline',
        lab: 'City Health Lab',
        aiInsights: [
          'LDL cholesterol is slightly elevated at 145 mg/dL',
          'Consider dietary modifications: reduce saturated fats',
          'Regular exercise and follow-up testing recommended'
        ],
        results: {
          'Total Cholesterol': { value: '210', normal: '<200', unit: 'mg/dL' },
          'LDL Cholesterol': { value: '145', normal: '<100', unit: 'mg/dL' },
          'HDL Cholesterol': { value: '48', normal: '>40', unit: 'mg/dL' },
        }
      },
    ],
    prescriptions: [
      { 
        id: 1, 
        date: 'Nov 15, 2025', 
        doctor: 'Dr. Arjun Singh', 
        diagnosis: 'Hypertension', 
        specialty: 'Cardiologist',
        medications: ['Atorvastatin 20mg', 'Amlodipine 5mg'],
        additionalNotes: 'Follow dietary modifications. Regular exercise recommended.',
        aiInsights: [
          'Medication combination is appropriate for hypertension management',
          'Patient should monitor BP regularly at home',
          'Lifestyle modifications complement medication therapy'
        ]
      },
    ],
    aiAnalysis: {
      riskScore: 85,
      suggestedTests: ['ECG', 'Chest X-Ray', 'Troponin Test'],
      priorityReason: 'Cardiac symptoms with history of hypertension - requires immediate attention',
      conversationSummary: 'Patient reported sudden onset chest discomfort radiating to left arm, accompanied by shortness of breath and sweating. Symptoms started 20 minutes ago. Patient has history of hypertension and is on medication.',
      recommendations: [
        'Immediate ECG to rule out acute coronary syndrome',
        'Monitor vitals closely - BP, pulse, SpO2',
        'Consider cardiac enzymes if ECG is abnormal',
        'Patient should be seen within 15 minutes',
      ],
    },
  },
  {
    id: 'P002',
    name: 'Sneha Gupta',
    age: 32,
    gender: 'Female',
    chiefComplaint: 'Persistent fever, headache',
    triageLevel: 'medium',
    waitTime: '15 min',
    status: 'checked-in',
    phone: '+91 98765 43211',
    bloodGroup: 'O+',
    allergies: ['Penicillin'],
    appointmentTime: '11:00 AM',
    medicalHistory: [
      { date: 'Dec 15, 2025', diagnosis: 'Upper Respiratory Infection', doctor: 'Dr. Arjun Singh' },
      { date: 'Oct 22, 2025', diagnosis: 'Routine Checkup', doctor: 'Dr. Priya Patel' },
    ],
    labReports: [
      { 
        id: 1, 
        test: 'CBC', 
        date: 'Dec 10, 2025', 
        doctor: 'Dr. Arjun Singh', 
        status: 'Normal',
        lab: 'City Health Lab',
        aiInsights: [
          'Blood counts within normal range',
          'No signs of bacterial infection',
          'Patient responding well to treatment'
        ]
      },
      { 
        id: 2, 
        test: 'Blood Culture', 
        date: 'Dec 8, 2025', 
        doctor: 'Dr. Arjun Singh', 
        status: 'Pending',
        lab: 'City Health Lab',
        aiInsights: [
          'Culture pending - results expected in 48-72 hours',
          'Monitor patient symptoms while awaiting results',
          'Consider empirical treatment if symptoms worsen'
        ]
      },
    ],
    prescriptions: [
      { 
        id: 1, 
        date: 'Dec 15, 2025', 
        doctor: 'Dr. Arjun Singh', 
        diagnosis: 'Upper Respiratory Infection', 
        specialty: 'General Physician',
        medications: ['Paracetamol 500mg', 'Cetirizine 10mg'],
        additionalNotes: 'Rest well and stay hydrated. If symptoms persist beyond 5 days, consult again.',
        aiInsights: [
          'Standard treatment protocol for upper respiratory infection',
          'Symptomatic relief medications are appropriate',
          'Patient should complete full course as prescribed'
        ]
      },
    ],
    aiAnalysis: {
      riskScore: 45,
      suggestedTests: ['CBC', 'Blood Culture', 'CRP'],
      priorityReason: 'Fever persisting for 3 days with headache - possible infection',
      conversationSummary: 'Patient reports fever (101°F) for 3 days, severe headache, and body aches. No cough or cold symptoms. Fever responds temporarily to paracetamol but returns. Patient is otherwise healthy.',
      recommendations: [
        'Complete blood count to check for infection markers',
        'Consider viral vs bacterial infection based on CBC',
        'Monitor temperature pattern',
        'Rule out meningitis if headache is severe',
      ],
    },
  },
  {
    id: 'P003',
    name: 'Vikram Joshi',
    age: 28,
    gender: 'Male',
    chiefComplaint: 'Routine follow-up',
    triageLevel: 'low',
    waitTime: '25 min',
    status: 'waiting',
    phone: '+91 98765 43212',
    bloodGroup: 'A+',
    allergies: [],
    appointmentTime: '11:45 AM',
    medicalHistory: [
      { date: 'Sep 10, 2025', diagnosis: 'Routine Checkup', doctor: 'Dr. Priya Patel' },
    ],
    labReports: [
      { 
        id: 1, 
        test: 'Routine Blood Work', 
        date: 'Sep 5, 2025', 
        doctor: 'Dr. Priya Patel', 
        status: 'Normal',
        lab: 'City Health Lab',
        aiInsights: [
          'All routine parameters within normal limits',
          'Good overall health indicators',
          'Continue preventive care measures'
        ]
      },
    ],
    prescriptions: [],
    aiAnalysis: {
      riskScore: 15,
      suggestedTests: ['Routine Blood Work'],
      priorityReason: 'Routine follow-up - low priority, can wait',
      conversationSummary: 'Patient is here for routine 6-month follow-up. No specific complaints. Wants to discuss general health and preventive care.',
      recommendations: [
        'Routine health checkup',
        'Update vaccinations if needed',
        'General health counseling',
      ],
    },
  },
  {
    id: 'P004',
    name: 'Priya Sharma',
    age: 55,
    gender: 'Female',
    chiefComplaint: 'Blood pressure monitoring',
    triageLevel: 'medium',
    waitTime: '30 min',
    status: 'waiting',
    phone: '+91 98765 43213',
    bloodGroup: 'AB+',
    allergies: ['Sulfa drugs'],
    appointmentTime: '12:15 PM',
    medicalHistory: [
      { date: 'Dec 5, 2025', diagnosis: 'Hypertension', doctor: 'Dr. Arjun Singh' },
      { date: 'Oct 15, 2025', diagnosis: 'Diabetes Type 2', doctor: 'Dr. Priya Patel' },
    ],
    labReports: [
      { 
        id: 1, 
        test: 'BP Monitoring', 
        date: 'Dec 1, 2025', 
        doctor: 'Dr. Arjun Singh', 
        status: 'Normal',
        lab: 'City Health Lab',
        aiInsights: [
          'BP readings are stable and within target range',
          'Current medication regimen is effective',
          'Continue monitoring at home'
        ]
      },
      { 
        id: 2, 
        test: 'Blood Glucose', 
        date: 'Nov 20, 2025', 
        doctor: 'Dr. Priya Patel', 
        status: 'Normal',
        lab: 'City Health Lab',
        aiInsights: [
          'Glucose levels well controlled',
          'Diabetes management is effective',
          'Maintain current treatment plan'
        ]
      },
      { 
        id: 3, 
        test: 'HbA1c', 
        date: 'Nov 20, 2025', 
        doctor: 'Dr. Priya Patel', 
        status: 'Normal',
        lab: 'City Health Lab',
        aiInsights: [
          'HbA1c within target range',
          'Long-term glucose control is good',
          'Continue current medication and lifestyle'
        ]
      },
    ],
    prescriptions: [
      { 
        id: 1, 
        date: 'Dec 5, 2025', 
        doctor: 'Dr. Arjun Singh', 
        diagnosis: 'Hypertension', 
        specialty: 'Cardiologist',
        medications: ['Amlodipine 5mg', 'Metoprolol 25mg'],
        additionalNotes: 'Monitor BP regularly. Follow dietary restrictions.',
        aiInsights: [
          'Dual therapy appropriate for hypertension control',
          'Beta-blocker and calcium channel blocker combination is effective',
          'Monitor for side effects and adjust if needed'
        ]
      },
      { 
        id: 2, 
        date: 'Oct 15, 2025', 
        doctor: 'Dr. Priya Patel', 
        diagnosis: 'Diabetes Type 2', 
        specialty: 'General Physician',
        medications: ['Metformin 500mg', 'Glimepiride 2mg'],
        additionalNotes: 'Monitor blood glucose. Follow diabetic diet.',
        aiInsights: [
          'Metformin and sulfonylurea combination is standard for Type 2 diabetes',
          'Good glucose control achieved with current regimen',
          'Continue monitoring and lifestyle modifications'
        ]
      },
    ],
    aiAnalysis: {
      riskScore: 60,
      suggestedTests: ['BP Monitoring', 'Blood Glucose', 'HbA1c'],
      priorityReason: 'Chronic conditions requiring regular monitoring',
      conversationSummary: 'Patient on medication for hypertension and diabetes. Reports occasional dizziness. Wants to check if medications need adjustment. BP readings at home have been variable.',
      recommendations: [
        'Monitor BP multiple times during visit',
        'Check blood glucose levels',
        'Review medication compliance',
        'Consider 24-hour BP monitoring if readings are inconsistent',
      ],
    },
  },
];

interface ChatMessage {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [selectedLabReport, setSelectedLabReport] = useState<any>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with information about patients in the queue. Ask me anything!',
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getTriageBadge = (level: QueuePatient['triageLevel']) => {
    switch (level) {
      case 'high':
        return <Badge variant="triage-high">HIGH</Badge>;
      case 'medium':
        return <Badge variant="triage-medium">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="triage-low">LOW</Badge>;
    }
  };

  const getStatusBadge = (status: QueuePatient['status']) => {
    switch (status) {
      case 'in-progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'checked-in':
        return <Badge variant="success">Checked In</Badge>;
      default:
        return <Badge variant="outline">Waiting</Badge>;
    }
  };

  const handlePatientClick = (patient: QueuePatient) => {
    setSelectedPatient(patient);
    setIsSidebarOpen(true);
  };

  const handleAcceptAppointment = () => {
    if (selectedPatient) {
      // Send notification to patient
      alert(`Appointment accepted for ${selectedPatient.name}. Notification sent to patient.`);
      // Here you would typically make an API call to accept the appointment and send notification
    }
  };

  const handleAssignTests = () => {
    if (selectedPatient) {
      setSelectedTests([]);
      setIsTestDialogOpen(true);
    }
  };

  const handleTestSelection = (test: string, checked: boolean) => {
    if (checked) {
      setSelectedTests([...selectedTests, test]);
    } else {
      setSelectedTests(selectedTests.filter((t) => t !== test));
    }
  };

  const handleConfirmTestAssignment = () => {
    if (selectedPatient && selectedTests.length > 0) {
      alert(`Lab tests assigned for ${selectedPatient.name}: ${selectedTests.join(', ')}`);
      setIsTestDialogOpen(false);
      setSelectedTests([]);
    }
  };

  const handleVideoCall = () => {
    if (selectedPatient) {
      // Navigate to video consult page with patient context
      const params = new URLSearchParams({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        age: selectedPatient.age.toString(),
        gender: selectedPatient.gender,
        chiefComplaint: selectedPatient.chiefComplaint,
        triageLevel: selectedPatient.triageLevel,
      });
      if (selectedPatient.phone) params.append('phone', selectedPatient.phone);
      if (selectedPatient.bloodGroup) params.append('bloodGroup', selectedPatient.bloodGroup);
      navigate(`/doctor/video?${params.toString()}`);
    }
  };

  // AI Chatbot function to answer questions about patients
  const handleChatbotQuery = async (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Patient search by name
    if (lowerQuery.includes('patient') || lowerQuery.includes('who')) {
      const nameMatch = patientQueue.find(p => 
        lowerQuery.includes(p.name.toLowerCase().split(' ')[0]) ||
        lowerQuery.includes(p.name.toLowerCase())
      );
      if (nameMatch) {
        return `Patient ${nameMatch.name} (${nameMatch.age}y, ${nameMatch.gender}) - Chief Complaint: ${nameMatch.chiefComplaint}. Triage Level: ${nameMatch.triageLevel.toUpperCase()}. Wait Time: ${nameMatch.waitTime}. Status: ${nameMatch.status}.`;
      }
    }

    // High priority patients
    if (lowerQuery.includes('urgent') || lowerQuery.includes('high priority') || lowerQuery.includes('priority')) {
      const highPriority = patientQueue.filter(p => p.triageLevel === 'high');
      if (highPriority.length > 0) {
        const names = highPriority.map(p => p.name).join(', ');
        return `There are ${highPriority.length} high priority patient(s): ${names}. They require immediate attention.`;
      }
      return 'No high priority patients in the queue currently.';
    }

    // Total patients
    if (lowerQuery.includes('total') || lowerQuery.includes('how many') || lowerQuery.includes('count')) {
      return `There are ${patientQueue.length} patients in the queue. ${patientQueue.filter(p => p.triageLevel === 'high').length} high priority, ${patientQueue.filter(p => p.triageLevel === 'medium').length} medium priority, and ${patientQueue.filter(p => p.triageLevel === 'low').length} low priority.`;
    }

    // Patient symptoms/complaints
    if (lowerQuery.includes('symptom') || lowerQuery.includes('complaint')) {
      const symptomMatch = patientQueue.find(p => 
        lowerQuery.includes(p.chiefComplaint.toLowerCase().split(',')[0].split(' ')[0])
      );
      if (symptomMatch) {
        return `${symptomMatch.name} has the following chief complaint: ${symptomMatch.chiefComplaint}.`;
      }
    }

    // Wait times
    if (lowerQuery.includes('wait') || lowerQuery.includes('waiting')) {
      const avgWait = patientQueue.reduce((acc, p) => {
        const mins = parseInt(p.waitTime.replace(' min', '').replace(' hr', ''));
        return acc + mins;
      }, 0) / patientQueue.length;
      return `Average wait time is approximately ${Math.round(avgWait)} minutes.`;
    }

    // General help
    if (lowerQuery.includes('help') || lowerQuery.includes('what can you')) {
      return `I can help you with:
- Patient information (ask about any patient by name)
- Priority patients (ask about urgent/high priority patients)
- Queue statistics (total patients, wait times)
- Patient symptoms and complaints
- General questions about the patient queue

Try asking: "Who is the highest priority patient?" or "How many patients are waiting?"`;
    }

    // Default response
    return `I can help you with information about patients in the queue. Try asking about:
- Specific patients by name
- High priority or urgent patients
- Total number of patients
- Patient symptoms or complaints
- Wait times

For example: "Who is the highest priority patient?" or "Tell me about Arun Mehta"`;
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(async () => {
      const response = await handleChatbotQuery(currentInput);
      const assistantMessage: ChatMessage = {
        id: chatMessages.length + 2,
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  // Available lab tests
  const availableTests = [
    'Complete Blood Count (CBC)',
    'Lipid Profile',
    'Blood Glucose (Fasting)',
    'HbA1c',
    'Thyroid Function Test (TSH, T3, T4)',
    'Liver Function Test',
    'Kidney Function Test',
    'ECG',
    'Chest X-Ray',
    'Troponin Test',
    'CRP (C-Reactive Protein)',
    'Blood Culture',
    'Urine Analysis',
    'Vitamin D',
    'Vitamin B12',
  ];

  const highPriorityCount = patientQueue.filter((p) => p.triageLevel === 'high').length;
  const avgWaitTime = Math.round(
    patientQueue.reduce((acc, p) => {
      const minutes = parseInt(p.waitTime.replace(' min', '').replace(' hr', ''));
      return acc + minutes;
    }, 0) / patientQueue.length
  );

  return (
    <DashboardLayout
      title="Patient Queue"
      subtitle="Click on a patient card to view details"
    >
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/doctor/video">
          <div className="card-elevated p-6 hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Start Video Consult</h3>
                <p className="text-sm text-muted-foreground">{patientQueue.length} patients waiting</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/doctor/prescriptions">
          <div className="card-elevated p-6 hover:border-secondary/30 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Write Prescription</h3>
                <p className="text-sm text-muted-foreground">Quick e-prescription</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/doctor/consultations">
          <div className="card-elevated p-6 hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Consultation Room</h3>
                <p className="text-sm text-muted-foreground">Full patient view</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Priority Patients"
          value={highPriorityCount}
          change="Require immediate attention"
          changeType="negative"
          icon={AlertCircle}
          iconColor="text-destructive"
        />
        <StatCard
          title="Total in Queue"
          value={patientQueue.length}
          change={`${patientQueue.filter((p) => p.status === 'waiting').length} waiting`}
          changeType="neutral"
          icon={Users}
          iconColor="text-primary"
        />
        <StatCard
          title="Avg. Consult Time"
          value={`${avgWaitTime} min`}
          change="-5 min improvement"
          changeType="positive"
          icon={Clock}
          iconColor="text-warning"
        />
        <StatCard
          title="Consultations Done"
          value="12"
          change="+3 from yesterday"
          changeType="positive"
          icon={CheckCircle}
          iconColor="text-success"
        />
      </div>

      {/* Patient Queue - Card Based */}
      <div className="card-elevated">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patientQueue.map((patient) => (
            <div
              key={patient.id}
              onClick={() => handlePatientClick(patient)}
              className={`p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                patient.triageLevel === 'high'
                  ? 'border-destructive bg-destructive/5 hover:border-destructive/80'
                  : patient.triageLevel === 'medium'
                  ? 'border-warning bg-warning/5 hover:border-warning/80'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{patient.name}</h4>
                    {getTriageBadge(patient.triageLevel)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {patient.age}y • {patient.gender}
                  </p>
                </div>
                {getStatusBadge(patient.status)}
              </div>
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground mb-1">Chief Complaint:</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{patient.chiefComplaint}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {patient.waitTime}
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Detail Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedPatient && (
            <div className="space-y-6">
              {/* Header */}
              <SheetHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-2xl font-bold mb-2">{selectedPatient.name}</SheetTitle>
                    <SheetDescription className="text-base">
                      Patient Profile & AI Analysis
                    </SheetDescription>
                  </div>
                  <div className="flex gap-2">
                    {getTriageBadge(selectedPatient.triageLevel)}
                    {getStatusBadge(selectedPatient.status)}
                  </div>
                </div>
              </SheetHeader>

              {/* Patient Profile Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Patient Profile</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Age</p>
                    <p className="font-medium">{selectedPatient.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Gender</p>
                    <p className="font-medium">{selectedPatient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Appointment Time</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedPatient.appointmentTime || 'Not scheduled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Blood Group</p>
                    <p className="font-medium">{selectedPatient.bloodGroup}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Chief Complaint</p>
                    <p className="font-medium">{selectedPatient.chiefComplaint}</p>
                  </div>
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground mb-2">Allergies</p>
                      <div className="flex gap-2 flex-wrap">
                        {selectedPatient.allergies.map((allergy, idx) => (
                          <Badge key={idx} variant="destructive">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Analysis Section */}
              {selectedPatient.aiAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">AI Analysis</h3>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Risk Score</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedPatient.aiAnalysis.riskScore}/100
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${selectedPatient.aiAnalysis.riskScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground mb-3">
                      <span className="font-medium">Priority Reason:</span>{' '}
                      {selectedPatient.aiAnalysis.priorityReason}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold">Triage Conversation Summary</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedPatient.aiAnalysis.conversationSummary}
                    </p>
                  </div>
                </div>
              )}

              {/* Medical Records Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  <h3 className="text-lg font-semibold">Medical Records</h3>
                </div>
                
                {/* Lab Test Reports */}
                {selectedPatient.labReports && selectedPatient.labReports.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Lab Test Reports</h4>
                    {selectedPatient.labReports.map((report) => (
                      <div key={report.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <Syringe className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{report.test}</p>
                              <p className="text-sm text-muted-foreground">{report.doctor} • {report.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {report.aiInsights && report.aiInsights.length > 0 && (
                              <AIInsightPopover
                                insights={report.aiInsights}
                                triggerText="AI"
                              />
                            )}
                            <Badge variant={report.status === 'Normal' ? 'success' : report.status === 'Pending' ? 'warning' : 'destructive'}>
                              {report.status}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLabReport(report)}
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Prescriptions */}
                {selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Prescriptions</h4>
                    {selectedPatient.prescriptions.map((prescription) => (
                      <div key={prescription.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4 flex-1">
                            <Pill className="w-5 h-5 text-secondary" />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{prescription.diagnosis}</p>
                              <p className="text-sm text-muted-foreground">{prescription.doctor} • {prescription.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {prescription.aiInsights && prescription.aiInsights.length > 0 && (
                              <AIInsightPopover
                                insights={prescription.aiInsights}
                                triggerText="AI"
                              />
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPrescription(prescription)}
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </div>
                        </div>
                        <div className="ml-9 mt-2">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Medications:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {prescription.medications.map((med, idx) => (
                              <li key={idx} className="text-sm text-foreground">{med}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(!selectedPatient.labReports || selectedPatient.labReports.length === 0) &&
                 (!selectedPatient.prescriptions || selectedPatient.prescriptions.length === 0) && (
                  <p className="text-muted-foreground text-center py-4 border rounded-lg">
                    No medical records available
                  </p>
                )}
              </div>

              {/* Actions Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex items-center justify-center gap-2"
                    onClick={handleAssignTests}
                  >
                    <TestTube className="w-5 h-5" />
                    <span>Assign Lab Tests</span>
                  </Button>
                  <Button
                    variant="default"
                    className="w-full h-auto py-4 flex items-center justify-center gap-2 bg-primary"
                    onClick={handleVideoCall}
                  >
                    <Video className="w-5 h-5" />
                    <span>Start Consultation</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Lab Test Assignment Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Lab Tests</DialogTitle>
            <DialogDescription>
              Select tests to assign for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Test Selection */}
            <div className="space-y-3">
              <h4 className="font-semibold">Available Tests</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                {availableTests.map((test) => (
                  <div key={test} className="flex items-center space-x-2">
                    <Checkbox
                      id={test}
                      checked={selectedTests.includes(test)}
                      onCheckedChange={(checked) => handleTestSelection(test, checked as boolean)}
                    />
                    <Label
                      htmlFor={test}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {test}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Tests Summary */}
            {selectedTests.length > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Selected Tests ({selectedTests.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTests.map((test) => (
                    <Badge key={test} variant="default">
                      {test}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmTestAssignment}
                disabled={selectedTests.length === 0}
              >
                Assign Tests
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lab Report PDF Viewer */}
      <Dialog open={!!selectedLabReport} onOpenChange={() => setSelectedLabReport(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0">
          <LabReportViewer 
            report={selectedLabReport} 
            patientName={selectedPatient?.name || 'Patient'}
            onClose={() => setSelectedLabReport(null)} 
          />
        </DialogContent>
      </Dialog>

      {/* Prescription PDF Viewer */}
      <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0">
          <PrescriptionViewer 
            prescription={selectedPrescription} 
            patientName={selectedPatient?.name || 'Patient'}
            onClose={() => setSelectedPrescription(null)} 
          />
        </DialogContent>
      </Dialog>

      {/* Chatbot Floating Button */}
      {!isChatbotOpen && (
        <Button
          onClick={() => {
            setIsChatbotOpen(true);
            setIsChatbotMinimized(false);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 bg-gradient-hero hover:bg-gradient-hero/90"
          size="icon"
        >
          <Bot className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Chatbot Panel */}
      {isChatbotOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-background border border-border rounded-2xl shadow-2xl z-50 flex flex-col transition-all ${
          isChatbotMinimized ? 'h-16' : 'h-[600px]'
        }`}>
          {/* Chatbot Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-hero rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Assistant</h3>
                <p className="text-xs text-white/80">Ask about any patient</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/20"
                onClick={() => setIsChatbotMinimized(!isChatbotMinimized)}
              >
                {isChatbotMinimized ? <MessageSquare className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/20"
                onClick={() => setIsChatbotOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          {!isChatbotMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {message.type === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                      <div
                        className={`inline-block p-3 rounded-xl text-sm ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        {message.content}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-muted rounded-xl p-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChatMessage} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about any patient..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!chatInput.trim() || isTyping}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

// Lab Report PDF Viewer Component
const LabReportViewer: React.FC<{ report: any; patientName: string; onClose: () => void }> = ({ report, patientName, onClose }) => {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (report) {
      const dataUrl = generateLabReportPDF(report, patientName, true) as string;
      setPdfDataUrl(dataUrl);
    } else {
      setPdfDataUrl(null);
    }
  }, [report, patientName]);

  if (!report) return null;

  const handleDownloadPDF = () => {
    generateLabReportPDF(report, patientName, false);
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle>{report.test} Report</DialogTitle>
            <DialogDescription className="mt-1">
              Report dated {report.date} • {report.lab || 'Laboratory'}
            </DialogDescription>
          </div>
          <Button onClick={handleDownloadPDF} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogHeader>
      
      <div className="relative w-full h-[calc(95vh-120px)] bg-muted/20">
        {pdfDataUrl ? (
          <iframe
            src={pdfDataUrl}
            className="w-full h-full border-0"
            title={`${report.test} PDF Report`}
            style={{ minHeight: '600px' }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Prescription PDF Viewer Component
const PrescriptionViewer: React.FC<{ prescription: any; patientName: string; onClose: () => void }> = ({ prescription, patientName, onClose }) => {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (prescription) {
      const dataUrl = generatePrescriptionPDF(prescription, patientName, true) as string;
      setPdfDataUrl(dataUrl);
    } else {
      setPdfDataUrl(null);
    }
  }, [prescription, patientName]);

  if (!prescription) return null;

  const handleDownloadPDF = () => {
    generatePrescriptionPDF(prescription, patientName, false);
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle>Prescription - {prescription.diagnosis}</DialogTitle>
            <DialogDescription className="mt-1">
              Prescribed on {prescription.date} • {prescription.doctor}
            </DialogDescription>
          </div>
          <Button onClick={handleDownloadPDF} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogHeader>
      
      <div className="relative w-full h-[calc(95vh-120px)] bg-muted/20">
        {pdfDataUrl ? (
          <iframe
            src={pdfDataUrl}
            className="w-full h-full border-0"
            title={`Prescription PDF`}
            style={{ minHeight: '600px' }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Generate Lab Report PDF
const generateLabReportPDF = (report: any, patientName: string, returnDataUrl: boolean = false): string | void => {
  const doc = new jsPDF();
  const primaryColor = [33, 150, 243];
  const darkGray = [51, 51, 51];
  const lightGray = [128, 128, 128];
  let yPos = 20;

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(report.lab || 'MediVerse Laboratory', 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Accredited by NABL | ISO 15189:2012 Certified', 105, 22, { align: 'center' });

  // Report Title
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(report.test.toUpperCase(), 105, 45, { align: 'center' });

  yPos = 55;
  doc.setDrawColor(200, 200, 200);
  doc.line(10, yPos, 200, yPos);
  yPos += 8;

  // Patient Information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT INFORMATION', 10, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);

  const patientInfo = [
    ['Patient Name:', patientName],
    ['Test Date:', report.date],
    ['Ordering Physician:', report.doctor],
    ['Report Status:', report.status],
  ];

  patientInfo.forEach(([label, value]) => {
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(label, 10, yPos);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(value, 60, yPos);
    yPos += 6;
  });

  yPos += 5;

  // Test Results
  if (report.results) {
    doc.setDrawColor(200, 200, 200);
    doc.line(10, yPos, 200, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TEST RESULTS', 10, yPos);
    yPos += 8;

    doc.setFillColor(240, 240, 240);
    doc.rect(10, yPos - 5, 190, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Test Parameter', 12, yPos);
    doc.text('Result', 80, yPos);
    doc.text('Normal Range', 120, yPos);
    doc.text('Unit', 170, yPos);
    
    yPos += 8;
    doc.setDrawColor(220, 220, 220);
    doc.line(10, yPos - 2, 200, yPos - 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    Object.entries(report.results).forEach(([key, value]: [string, any]) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(key, 12, yPos);
      
      const isNormal = report.status === 'Normal';
      doc.setTextColor(isNormal ? 34 : 255, isNormal ? 139 : 152, isNormal ? 34 : 0);
      doc.setFont('helvetica', 'bold');
      doc.text(value.value, 80, yPos);
      doc.setFont('helvetica', 'normal');
      
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(value.normal, 120, yPos);
      doc.text(value.unit || '-', 170, yPos);
      
      yPos += 7;
      doc.setDrawColor(240, 240, 240);
      doc.line(10, yPos - 2, 200, yPos - 2);
    });
  }

  if (returnDataUrl) {
    return doc.output('dataurlstring');
  } else {
    const fileName = `${report.test.replace(/[^a-z0-9]/gi, '_')}_${report.date.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(fileName);
  }
};

// Generate Prescription PDF
const generatePrescriptionPDF = (prescription: any, patientName: string, returnDataUrl: boolean = false): string | void => {
  const doc = new jsPDF();
  const primaryColor = [20, 120, 120];
  const darkGray = [51, 51, 51];
  const lightGray = [128, 128, 128];
  let yPos = 20;

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MediVerse Healthcare', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('E-Prescription', 105, 22, { align: 'center' });

  yPos = 45;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('PRESCRIPTION', 10, yPos);

  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(10, yPos, 200, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const details = [
    ['Date:', prescription.date],
    ['Doctor:', prescription.doctor],
    ['Specialty:', prescription.specialty || 'General'],
    ['Diagnosis:', prescription.diagnosis],
    ['Patient:', patientName],
  ];

  details.forEach(([label, value]) => {
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(label, 10, yPos);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(value, 50, yPos);
    yPos += 6;
  });

  yPos += 5;

  // Medications
  if (prescription.medications && prescription.medications.length > 0) {
    doc.setDrawColor(200, 200, 200);
    doc.line(10, yPos, 200, yPos);
    yPos += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('MEDICATIONS', 10, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    prescription.medications.forEach((med: string, index: number) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`${index + 1}. ${med}`, 15, yPos);
      yPos += 7;
    });
  }

  yPos += 5;

  // Additional Notes
  if (prescription.additionalNotes) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(10, yPos, 200, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('ADDITIONAL NOTES', 10, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const notes = doc.splitTextToSize(prescription.additionalNotes, 180);
    doc.text(notes, 10, yPos);
    yPos += notes.length * 5 + 5;
  }

  // Footer
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(10, yPos, 200, yPos);
  yPos += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('This is an electronic prescription. Please consult with your pharmacist for any questions.', 10, yPos, { maxWidth: 190, align: 'justify' });
  yPos += 8;
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 10, yPos);

  if (returnDataUrl) {
    return doc.output('dataurlstring');
  } else {
    const fileName = `Prescription_${prescription.date.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(fileName);
  }
};

export default DoctorDashboard;
