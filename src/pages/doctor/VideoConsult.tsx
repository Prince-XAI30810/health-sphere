import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  PhoneCall,
  Sparkles,
  Send,
  Plus,
  X,
  Check,
  Clock,
  Activity,
  FileText,
  Pill,
  User,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Prescription, generatePrescriptionPDF } from '@/data/prescriptions';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface ConsultationData {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  duration: string;
  symptoms: string[];
  diagnosis: string;
  notes: string;
  medications: Medication[];
  callSummary: string;
  prescriptionSent: boolean;
  kpis: {
    consultationTime: string;
    medicationsPrescribed: number;
    followUpRequired: boolean;
  };
}

// Store consultations in localStorage (in real app, this would be API)
const saveConsultation = (consultation: ConsultationData) => {
  const consultations = JSON.parse(localStorage.getItem('doctorConsultations') || '[]');
  consultations.push(consultation);
  localStorage.setItem('doctorConsultations', JSON.stringify(consultations));
};

export const VideoConsult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const patientId = searchParams.get('patientId') || '';
  const patientName = searchParams.get('patientName') || 'Patient';
  const age = searchParams.get('age') || '';
  const gender = searchParams.get('gender') || '';
  const chiefComplaint = searchParams.get('chiefComplaint') || '';
  const triageLevel = searchParams.get('triageLevel') || 'medium';
  const phone = searchParams.get('phone') || '';
  const bloodGroup = searchParams.get('bloodGroup') || '';

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callEnded, setCallEnded] = useState(false);
  const [notes, setNotes] = useState('');
  const [aiSuggestedMeds, setAiSuggestedMeds] = useState<Medication[]>([]);
  const [prescription, setPrescription] = useState<Medication[]>([]);
  const [isGeneratingMeds, setIsGeneratingMeds] = useState(false);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [showAddMedDialog, setShowAddMedDialog] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('');
  const [newMedDuration, setNewMedDuration] = useState('');
  const [callSummary, setCallSummary] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptionSent, setPrescriptionSent] = useState(false);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall && !callEnded) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInCall, callEnded]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setIsInCall(true);
    setCallDuration(0);
    setCallEnded(false);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setCallEnded(true);
    // Generate AI suggestions after call ends
    generateAISuggestions();
  };

  const generateAISuggestions = () => {
    setIsGeneratingMeds(true);
    // Simulate AI analysis based on chief complaint
    setTimeout(() => {
      let suggested: Medication[] = [];
      
      if (chiefComplaint.toLowerCase().includes('fever') || chiefComplaint.toLowerCase().includes('headache')) {
        suggested = [
          { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Thrice daily', duration: '3 days' },
          { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once at night', duration: '5 days' },
        ];
      } else if (chiefComplaint.toLowerCase().includes('chest') || chiefComplaint.toLowerCase().includes('breath')) {
        suggested = [
          { name: 'Aspirin 75mg', dosage: '1 tablet', frequency: 'Once daily', duration: '7 days' },
          { name: 'Atorvastatin 20mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' },
        ];
      } else {
        suggested = [
          { name: 'Multivitamin', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' },
        ];
      }

      setAiSuggestedMeds(suggested);
      setCallSummary(`Consultation completed with ${patientName}. Patient presented with ${chiefComplaint}. Discussed symptoms, reviewed medical history, and provided treatment recommendations.`);
      setSymptoms(chiefComplaint.split(',').map(s => s.trim()));
      setDiagnosis('Based on symptoms and examination');
      setIsGeneratingMeds(false);
    }, 2000);
  };

  const addToPrescription = (med: Medication) => {
    if (!prescription.find((p) => p.name === med.name)) {
      setPrescription([...prescription, med]);
    }
  };

  const handleAddCustomMedication = () => {
    if (newMedName && newMedDosage && newMedFrequency && newMedDuration) {
      const newMed: Medication = {
        name: newMedName,
        dosage: newMedDosage,
        frequency: newMedFrequency,
        duration: newMedDuration,
      };
      setPrescription([...prescription, newMed]);
      setNewMedName('');
      setNewMedDosage('');
      setNewMedFrequency('');
      setNewMedDuration('');
      setShowAddMedDialog(false);
    }
  };

  const removeFromPrescription = (medName: string) => {
    setPrescription(prescription.filter((p) => p.name !== medName));
  };

  const handleSaveConsultation = () => {
    const consultation: ConsultationData = {
      id: `CONS-${Date.now()}`,
      patientId,
      patientName,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      duration: formatDuration(callDuration),
      symptoms,
      diagnosis: diagnosis || 'Pending diagnosis',
      notes,
      medications: prescription,
      callSummary,
      prescriptionSent,
      kpis: {
        consultationTime: formatDuration(callDuration),
        medicationsPrescribed: prescription.length,
        followUpRequired: prescription.length > 0,
      },
    };

    saveConsultation(consultation);
    alert('Consultation saved successfully!');
    navigate('/doctor/consultations');
  };

  const handleGeneratePrescription = () => {
    if (prescription.length === 0) {
      alert('Please add medications to prescription');
      return;
    }
    setShowPrescriptionDialog(true);
  };

  const handleSendPrescription = () => {
    // Generate and send prescription
    const prescriptionData: Prescription = {
      id: Date.now(),
      appointmentId: Date.now(),
      doctor: user?.name || 'Dr. Doctor',
      specialty: 'General Physician',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      diagnosis: diagnosis || 'General Consultation',
      medications: prescription.map(med => ({
        name: med.name.split(' ')[0],
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: `Take ${med.dosage} ${med.frequency} for ${med.duration}`,
        withFood: true,
      })),
      isActive: true,
    };

    // Generate PDF using the function from prescriptions.ts
    const pdfDataUrl = generatePrescriptionPDF(prescriptionData);
    const link = document.createElement('a');
    link.href = pdfDataUrl;
    link.download = `Prescription_${patientName}_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setPrescriptionSent(true);
    alert(`Prescription sent to ${patientName}`);
    setShowPrescriptionDialog(false);
  };

  if (!patientId) {
    return (
      <DashboardLayout title="Video Consult" subtitle="No patient selected">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please select a patient from the queue to start consultation.</p>
          <Button className="mt-4" onClick={() => navigate('/doctor/queue')}>
            Go to Patient Queue
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Video Consultation"
      subtitle={`Patient: ${patientName} • ${age}y • ${gender}`}
    >
      {!isInCall && !callEnded ? (
        /* Pre-Call Screen */
        <div className="max-w-2xl mx-auto">
          <div className="card-elevated p-8">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-hero mx-auto flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{patientName}</h2>
              <p className="text-muted-foreground">{age} years • {gender}</p>
              {bloodGroup && <Badge variant="info" className="mt-2">{bloodGroup}</Badge>}
            </div>

            <div className="bg-muted/50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-3">Chief Complaint</h3>
              <p className="text-foreground">{chiefComplaint}</p>
              {triageLevel && (
                <Badge 
                  variant={triageLevel === 'high' ? 'destructive' : triageLevel === 'medium' ? 'warning' : 'outline'}
                  className="mt-2"
                >
                  {triageLevel.toUpperCase()} Priority
                </Badge>
              )}
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <Button
                variant={isVideoOn ? 'default' : 'outline'}
                size="lg"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="w-5 h-5 mr-2" /> : <VideoOff className="w-5 h-5 mr-2" />}
                Camera {isVideoOn ? 'On' : 'Off'}
              </Button>
              <Button
                variant={isMicOn ? 'default' : 'outline'}
                size="lg"
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <Mic className="w-5 h-5 mr-2" /> : <MicOff className="w-5 h-5 mr-2" />}
                Mic {isMicOn ? 'On' : 'Off'}
              </Button>
            </div>

            <Button variant="hero" size="xl" className="w-full" onClick={handleStartCall}>
              <PhoneCall className="w-5 h-5 mr-2" />
              Start Video Call
            </Button>
          </div>
        </div>
      ) : isInCall ? (
        /* Video Call Interface */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Main Video Area */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="flex-1 bg-foreground rounded-2xl relative overflow-hidden">
              {/* Patient's Video (Main) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-32 h-32 rounded-full bg-primary/80 mx-auto flex items-center justify-center text-4xl font-bold mb-4">
                    {patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-xl font-semibold">{patientName}</h3>
                  <p className="text-white/70">{age} years • {gender}</p>
                </div>
              </div>

              {/* Doctor's Video (PiP) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-muted rounded-xl overflow-hidden shadow-xl border-2 border-background">
                <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                  {isVideoOn ? (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center text-white text-lg font-bold">
                        {user?.name?.split(' ').map(n => n[0]).join('') || 'DR'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">You</p>
                    </div>
                  ) : (
                    <VideoOff className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Call Duration */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-background/80 text-foreground backdrop-blur-sm">
                  <span className="w-2 h-2 bg-destructive rounded-full mr-2 animate-pulse"></span>
                  {formatDuration(callDuration)}
                </Badge>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 py-4">
              <Button
                variant={isMicOn ? 'outline' : 'destructive'}
                size="icon-lg"
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </Button>
              <Button
                variant={isVideoOn ? 'outline' : 'destructive'}
                size="icon-lg"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndCall}
                className="px-8"
              >
                <Phone className="w-5 h-5 mr-2 rotate-[135deg]" />
                End Call
              </Button>
            </div>
          </div>

          {/* Consultation Notes Sidebar */}
          <div className="card-elevated flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Consultation Notes</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes during consultation..."
                className="min-h-[300px] resize-none"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Post-Call Screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Call Summary & Symptoms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Call Summary */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Call Summary</h3>
              </div>
              <Textarea
                value={callSummary}
                onChange={(e) => setCallSummary(e.target.value)}
                placeholder="Call summary will be generated automatically..."
                className="min-h-[150px]"
              />
            </div>

            {/* Patient Symptoms */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold">Patient Symptoms</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {symptoms.map((symptom, idx) => (
                  <Badge key={idx} variant="outline">{symptom}</Badge>
                ))}
              </div>
              <Input
                placeholder="Add symptom..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setSymptoms([...symptoms, e.currentTarget.value]);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>

            {/* Diagnosis */}
            <div className="card-elevated p-6">
              <Label className="mb-2">Diagnosis</Label>
              <Input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis..."
              />
            </div>

            {/* KPIs */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4">Consultation KPIs</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{formatDuration(callDuration)}</p>
                  <p className="text-xs text-muted-foreground">Call Duration</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Pill className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{prescription.length}</p>
                  <p className="text-xs text-muted-foreground">Medications</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold">{prescription.length > 0 ? 'Yes' : 'No'}</p>
                  <p className="text-xs text-muted-foreground">Prescription</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - AI Suggestions & Prescription */}
          <div className="space-y-6">
            {/* AI Extracted Medications from Call */}
            {isGeneratingMeds ? (
              <div className="card-elevated p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">AI is analyzing consultation...</p>
              </div>
            ) : aiSuggestedMeds.length > 0 && (
              <div className="card-elevated p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  <h3 className="text-lg font-semibold">AI Extracted Medications from Call</h3>
                </div>
                <div className="space-y-2">
                  {aiSuggestedMeds.map((med, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <Pill className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{med.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage} • {med.frequency} • {med.duration}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToPrescription(med)}
                        disabled={!!prescription.find((p) => p.name === med.name)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prescription */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Prescription</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMedDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </div>
              {prescription.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {prescription.map((med, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                      <Check className="w-5 h-5 text-success" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{med.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage} • {med.frequency} • {med.duration}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFromPrescription(med.name)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No medications added yet
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleGeneratePrescription}
                  disabled={prescription.length === 0}
                >
                  Generate Prescription
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleSaveConsultation}
                >
                  Save Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review & Send Prescription</DialogTitle>
            <DialogDescription>
              Review the prescription before sending to {patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              {prescription.map((med, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {med.dosage} • {med.frequency} • {med.duration}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPrescriptionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendPrescription}>
                <Send className="w-4 h-4 mr-2" />
                Send to Patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Custom Medication Dialog */}
      <Dialog open={showAddMedDialog} onOpenChange={setShowAddMedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Medication</DialogTitle>
            <DialogDescription>
              Add a medication manually to the prescription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Medication Name</Label>
              <Input
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="e.g., Paracetamol 500mg"
              />
            </div>
            <div>
              <Label>Dosage</Label>
              <Input
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                placeholder="e.g., 1 tablet"
              />
            </div>
            <div>
              <Label>Frequency</Label>
              <Input
                value={newMedFrequency}
                onChange={(e) => setNewMedFrequency(e.target.value)}
                placeholder="e.g., Thrice daily"
              />
            </div>
            <div>
              <Label>Duration</Label>
              <Input
                value={newMedDuration}
                onChange={(e) => setNewMedDuration(e.target.value)}
                placeholder="e.g., 3 days"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddMedDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomMedication} disabled={!newMedName || !newMedDosage || !newMedFrequency || !newMedDuration}>
                Add Medication
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default VideoConsult;

