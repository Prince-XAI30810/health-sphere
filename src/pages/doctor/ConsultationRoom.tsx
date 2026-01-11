import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Video,
  FileText,
  Pill,
  Activity,
  AlertTriangle,
  Sparkles,
  Send,
  Plus,
  Check,
  X,
  User,
  Calendar,
  Phone,
  Heart,
  Thermometer,
  Droplets,
} from 'lucide-react';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  inStock: boolean;
}

const patientData = {
  name: 'Sneha Gupta',
  age: 32,
  gender: 'Female',
  phone: '+91 98765 43210',
  bloodGroup: 'O+',
  allergies: ['Penicillin', 'Sulfa drugs'],
  conditions: ['Mild Hypertension'],
  vitals: {
    bp: '135/88',
    pulse: '78',
    temp: '100.2',
    spo2: '98',
  },
  history: [
    { date: 'Dec 15, 2025', diagnosis: 'Upper Respiratory Infection', doctor: 'Dr. Arjun Singh' },
    { date: 'Oct 22, 2025', diagnosis: 'Routine Checkup', doctor: 'Dr. Priya Patel' },
  ],
};

const suggestedMeds: Medication[] = [
  { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Thrice daily', duration: '3 days', inStock: true },
  { name: 'Azithromycin 500mg', dosage: '1 tablet', frequency: 'Once daily', duration: '3 days', inStock: true },
  { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once at night', duration: '5 days', inStock: false },
];

export const ConsultationRoom: React.FC = () => {
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Medication[]>([]);

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setNotes(`Chief Complaint: Patient presents with fever (100.2°F), headache, and body aches for 2 days.

Assessment: 
- Likely viral upper respiratory infection
- Mild elevation in BP noted (135/88) - to be monitored
- No signs of lower respiratory involvement

Plan:
1. Symptomatic treatment with antipyretics
2. Adequate hydration and rest
3. Follow-up in 3 days if symptoms persist
4. Return immediately if shortness of breath or high fever

Allergies Noted: Penicillin, Sulfa drugs - AVOIDED`);
      setIsGenerating(false);
    }, 2000);
  };

  const addToPrescription = (med: Medication) => {
    if (!prescriptions.find((p) => p.name === med.name)) {
      setPrescriptions([...prescriptions, med]);
    }
  };

  const removeFromPrescription = (medName: string) => {
    setPrescriptions(prescriptions.filter((p) => p.name !== medName));
  };

  return (
    <DashboardLayout
      title="Consultation Room"
      subtitle="Patient: Sneha Gupta • Chief Complaint: Persistent fever, headache"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Patient Info */}
        <div className="space-y-6">
          {/* Patient Card */}
          <div className="card-elevated p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center text-white text-xl font-bold">
                SG
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-foreground">{patientData.name}</h2>
                  <Badge variant="info">{patientData.bloodGroup}</Badge>
                </div>
                <p className="text-muted-foreground">
                  {patientData.age} years • {patientData.gender}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {patientData.phone}
                </div>
              </div>
              <Button variant="outline-primary">
                <Video className="w-4 h-4 mr-2" />
                Switch to Video
              </Button>
            </div>

            {/* Allergies Alert */}
            {patientData.allergies.length > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="font-semibold text-destructive">Known Allergies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patientData.allergies.map((allergy) => (
                    <Badge key={allergy} variant="error">{allergy}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Vitals */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-muted/50 rounded-xl text-center">
                <Activity className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">BP</p>
                <p className="font-bold text-foreground">{patientData.vitals.bp}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl text-center">
                <Heart className="w-5 h-5 text-destructive mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Pulse</p>
                <p className="font-bold text-foreground">{patientData.vitals.pulse}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl text-center">
                <Thermometer className="w-5 h-5 text-warning mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Temp</p>
                <p className="font-bold text-foreground">{patientData.vitals.temp}°F</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl text-center">
                <Droplets className="w-5 h-5 text-secondary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">SpO2</p>
                <p className="font-bold text-foreground">{patientData.vitals.spo2}%</p>
              </div>
            </div>
          </div>

          {/* History & Conditions */}
          <div className="card-elevated p-6">
            <Tabs defaultValue="history">
              <TabsList className="mb-4">
                <TabsTrigger value="history">Visit History</TabsTrigger>
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
              </TabsList>
              <TabsContent value="history" className="space-y-3">
                {patientData.history.map((visit, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{visit.diagnosis}</p>
                      <p className="text-sm text-muted-foreground">{visit.doctor}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{visit.date}</span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="conditions">
                <div className="space-y-2">
                  {patientData.conditions.map((condition) => (
                    <div key={condition} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Activity className="w-5 h-5 text-warning" />
                      <span className="font-medium text-foreground">{condition}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - Notes & Prescription */}
        <div className="space-y-6">
          {/* Consultation Notes */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Consultation Notes</h3>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate Summary
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter consultation notes, diagnosis, and treatment plan..."
              className="min-h-[200px] resize-none"
            />
          </div>

          {/* Prescription */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Prescription</h3>

            {/* Added Medications */}
            {prescriptions.length > 0 && (
              <div className="space-y-2 mb-4">
                {prescriptions.map((med) => (
                  <div key={med.name} className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
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
            )}

            {/* Suggested Medications */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Suggested Medications</Label>
              {suggestedMeds.map((med) => (
                <div
                  key={med.name}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    prescriptions.find((p) => p.name === med.name)
                      ? 'border-success/30 bg-success/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <Pill className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{med.name}</p>
                      <Badge variant={med.inStock ? 'success' : 'error'}>
                        {med.inStock ? 'In Stock' : 'Low Stock'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {med.dosage} • {med.frequency} • {med.duration}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToPrescription(med)}
                    disabled={!!prescriptions.find((p) => p.name === med.name)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              Save Draft
            </Button>
            <Button variant="hero" className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Complete & Generate Discharge
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConsultationRoom;
