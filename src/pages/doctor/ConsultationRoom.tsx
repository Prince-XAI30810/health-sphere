import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Calendar,
  Clock,
  Pill,
  User,
  FileText,
  Activity,
  TrendingUp,
  CheckCircle,
  Eye,
  Sparkles,
  Edit,
  Send,
  Plus,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AIInsightPopover } from '@/components/shared/AIInsightPopover';
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

export const ConsultationRoom: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationData | null>(null);
  const [isEditingPrescription, setIsEditingPrescription] = useState(false);
  const [editedMedications, setEditedMedications] = useState<Medication[]>([]);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [showAddMedDialog, setShowAddMedDialog] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('');
  const [newMedDuration, setNewMedDuration] = useState('');

  useEffect(() => {
    // Load consultations from localStorage
    const saved = JSON.parse(localStorage.getItem('doctorConsultations') || '[]');
    // Add prescriptionSent field for backward compatibility
    const consultationsWithSent = saved.map((c: ConsultationData) => ({
      ...c,
      prescriptionSent: c.prescriptionSent !== undefined ? c.prescriptionSent : false,
    }));
    setConsultations(consultationsWithSent);
  }, []);

  useEffect(() => {
    if (selectedConsultation) {
      setEditedMedications([...selectedConsultation.medications]);
    }
  }, [selectedConsultation]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const updateConsultation = (updatedConsultation: ConsultationData) => {
    const updated = consultations.map(c => 
      c.id === updatedConsultation.id ? updatedConsultation : c
    );
    setConsultations(updated);
    localStorage.setItem('doctorConsultations', JSON.stringify(updated));
    setSelectedConsultation(updatedConsultation);
  };

  const handleEditPrescription = () => {
    setIsEditingPrescription(true);
  };

  const handleSavePrescription = () => {
    if (selectedConsultation) {
      const updated = {
        ...selectedConsultation,
        medications: editedMedications,
      };
      updateConsultation(updated);
      setIsEditingPrescription(false);
    }
  };

  const handleAddMedication = () => {
    if (newMedName && newMedDosage && newMedFrequency && newMedDuration) {
      const newMed: Medication = {
        name: newMedName,
        dosage: newMedDosage,
        frequency: newMedFrequency,
        duration: newMedDuration,
      };
      setEditedMedications([...editedMedications, newMed]);
      setNewMedName('');
      setNewMedDosage('');
      setNewMedFrequency('');
      setNewMedDuration('');
      setShowAddMedDialog(false);
    }
  };

  const handleRemoveMedication = (medName: string) => {
    setEditedMedications(editedMedications.filter(m => m.name !== medName));
  };

  const handleSendPrescription = () => {
    if (!selectedConsultation || editedMedications.length === 0) {
      alert('Please add medications to prescription');
      return;
    }

    const prescriptionData: Prescription = {
      id: Date.now(),
      appointmentId: Date.now(),
      doctor: user?.name || 'Dr. Doctor',
      specialty: 'General Physician',
      date: selectedConsultation.date,
      diagnosis: selectedConsultation.diagnosis,
      medications: editedMedications.map(med => ({
        name: med.name.split(' ')[0],
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: `Take ${med.dosage} ${med.frequency} for ${med.duration}`,
        withFood: true,
      })),
      isActive: true,
    };

    // Generate PDF
    const pdfDataUrl = generatePrescriptionPDF(prescriptionData);
    const link = document.createElement('a');
    link.href = pdfDataUrl;
    link.download = `Prescription_${selectedConsultation.patientName}_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update consultation
    const updated = {
      ...selectedConsultation,
      medications: editedMedications,
      prescriptionSent: true,
    };
    updateConsultation(updated);
    setIsEditingPrescription(false);
    setShowPrescriptionDialog(false);

    alert(`Prescription sent to ${selectedConsultation.patientName}`);
  };

  return (
    <DashboardLayout
      title="Consultations"
      subtitle="View all your completed consultations"
    >
      {consultations.length === 0 ? (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Consultations Yet</h3>
          <p className="text-muted-foreground mb-6">
            Start a video consultation from the patient queue to see consultations here.
          </p>
          <Button onClick={() => navigate('/doctor/queue')}>
            Go to Patient Queue
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultations.map((consultation) => (
            <div
              key={consultation.id}
              className="card-elevated p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedConsultation(consultation)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center text-white font-bold">
                    {getInitials(consultation.patientName)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{consultation.patientName}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {consultation.date}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Diagnosis</p>
                  <p className="text-sm font-medium text-foreground">{consultation.diagnosis}</p>
                </div>

                {consultation.symptoms.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Symptoms</p>
                    <div className="flex flex-wrap gap-1">
                      {consultation.symptoms.slice(0, 3).map((symptom, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                      {consultation.symptoms.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{consultation.symptoms.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <div className="text-center">
                    <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-xs font-medium">{consultation.duration}</p>
                  </div>
                  <div className="text-center">
                    <Pill className="w-4 h-4 text-secondary mx-auto mb-1" />
                    <p className="text-xs font-medium">{consultation.medications.length}</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-4 h-4 text-success mx-auto mb-1" />
                    <p className="text-xs font-medium">Done</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consultation Detail Dialog */}
      <Dialog open={!!selectedConsultation} onOpenChange={() => setSelectedConsultation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedConsultation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center text-white font-bold">
                    {getInitials(selectedConsultation.patientName)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedConsultation.patientName}</h2>
                    <p className="text-sm text-muted-foreground font-normal">
                      Consultation on {selectedConsultation.date}
                    </p>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Complete consultation details and summary
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* KPIs */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedConsultation.duration}</p>
                    <p className="text-xs text-muted-foreground">Call Duration</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <Pill className="w-6 h-6 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedConsultation.medications.length}</p>
                    <p className="text-xs text-muted-foreground">Medications</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {selectedConsultation.kpis.followUpRequired ? 'Yes' : 'No'}
                    </p>
                    <p className="text-xs text-muted-foreground">Follow-up</p>
                  </div>
                </div>

                {/* Call Summary */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Call Summary</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedConsultation.callSummary}
                  </p>
                </div>

                {/* Symptoms */}
                {selectedConsultation.symptoms.length > 0 && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-5 h-5 text-warning" />
                      <h3 className="font-semibold">Patient Symptoms</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedConsultation.symptoms.map((symptom, idx) => (
                        <Badge key={idx} variant="outline">{symptom}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diagnosis */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h3 className="font-semibold">Diagnosis</h3>
                  </div>
                  <p className="text-sm text-foreground">{selectedConsultation.diagnosis}</p>
                </div>

                {/* Notes */}
                {selectedConsultation.notes && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Consultation Notes</h3>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedConsultation.notes}
                    </p>
                  </div>
                )}

                {/* Medications */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-secondary" />
                      <h3 className="font-semibold">Prescribed Medications</h3>
                    </div>
                    {!selectedConsultation.prescriptionSent && (
                      <div className="flex gap-2">
                        {!isEditingPrescription ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditPrescription}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSavePrescription}
                          >
                            Save
                          </Button>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setShowPrescriptionDialog(true)}
                          disabled={selectedConsultation.medications.length === 0}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Prescription
                        </Button>
                      </div>
                    )}
                    {selectedConsultation.prescriptionSent && (
                      <Badge variant="success">Prescription Sent</Badge>
                    )}
                  </div>
                  {isEditingPrescription ? (
                    <div className="space-y-2">
                      {editedMedications.map((med, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{med.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemoveMedication(med.name)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowAddMedDialog(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medication
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedConsultation.medications.length > 0 ? (
                        selectedConsultation.medications.map((med, idx) => (
                          <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                            <p className="font-medium text-foreground">{med.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No medications prescribed
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Prescription Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review & Send Prescription</DialogTitle>
            <DialogDescription>
              Review the prescription before sending to {selectedConsultation?.patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              {editedMedications.map((med, idx) => (
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

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedDialog} onOpenChange={setShowAddMedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
            <DialogDescription>
              Add a medication to the prescription
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
              <Button onClick={handleAddMedication} disabled={!newMedName || !newMedDosage || !newMedFrequency || !newMedDuration}>
                Add Medication
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ConsultationRoom;
