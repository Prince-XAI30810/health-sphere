import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    FileText,
    Calendar,
    User,
    Pill,
    Eye,
    X,
    CheckCircle,
    Clock,
} from 'lucide-react';
import jsPDF from 'jspdf';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    withFood: boolean;
}

interface Prescription {
    id: number;
    appointmentId: number;
    doctor: string;
    specialty: string;
    date: string;
    diagnosis: string;
    medications: Medication[];
    additionalNotes?: string;
    isActive: boolean;
}

const prescriptions: Prescription[] = [
    {
        id: 1,
        appointmentId: 3,
        doctor: 'Dr. Priya Patel',
        specialty: 'General Physician',
        date: 'Dec 20, 2025',
        diagnosis: 'Upper Respiratory Infection',
        medications: [
            {
                name: 'Paracetamol',
                dosage: '500 mg',
                frequency: '3 times daily',
                duration: '5 days',
                instructions: 'Take after meals to reduce fever and body aches',
                withFood: true,
            },
            {
                name: 'Cetirizine',
                dosage: '10 mg',
                frequency: 'Once at night',
                duration: '5 days',
                instructions: 'Take before bedtime to relieve congestion',
                withFood: false,
            },
        ],
        additionalNotes: 'Rest well and stay hydrated. If symptoms persist beyond 5 days, consult again.',
        isActive: false,
    },
    {
        id: 2,
        appointmentId: 4,
        doctor: 'Dr. Arjun Singh',
        specialty: 'Cardiologist',
        date: 'Dec 15, 2025',
        diagnosis: 'Routine Cardiac Checkup',
        medications: [
            {
                name: 'Atorvastatin',
                dosage: '20 mg',
                frequency: '1 time daily',
                duration: '30 days',
                instructions: 'Take with dinner to reduce cholesterol levels',
                withFood: true,
            },
        ],
        additionalNotes: 'Follow dietary modifications. Increase omega-3 intake. Regular exercise recommended.',
        isActive: false,
    },
    {
        id: 3,
        appointmentId: 5,
        doctor: 'Dr. Sarah Khan',
        specialty: 'Endocrinologist',
        date: 'Nov 20, 2025',
        diagnosis: 'Thyroid Function Evaluation',
        medications: [
            {
                name: 'Levothyroxine',
                dosage: '50 mcg',
                frequency: '1 time daily',
                duration: '42 days',
                instructions: 'Take on empty stomach, 30 minutes before breakfast',
                withFood: false,
            },
        ],
        additionalNotes: 'Follow-up in 6 weeks to recheck TSH levels. Do not skip doses.',
        isActive: false,
    },
    {
        id: 4,
        appointmentId: 6,
        doctor: 'Dr. Priya Patel',
        specialty: 'General Physician',
        date: 'Oct 25, 2025',
        diagnosis: 'Routine Health Checkup',
        medications: [],
        additionalNotes: 'No medications prescribed. Maintain healthy lifestyle.',
        isActive: false,
    },
    {
        id: 5,
        appointmentId: 7,
        doctor: 'Dr. Arjun Singh',
        specialty: 'Cardiologist',
        date: 'Sep 10, 2025',
        diagnosis: 'Chest Pain Evaluation',
        medications: [
            {
                name: 'Ibuprofen',
                dosage: '400 mg',
                frequency: '2 times daily',
                duration: '7 days',
                instructions: 'Take with food to reduce stomach irritation',
                withFood: true,
            },
        ],
        additionalNotes: 'Monitor symptoms. Return if chest pain becomes frequent.',
        isActive: false,
    },
    {
        id: 6,
        appointmentId: 3,
        doctor: 'Dr. Priya Patel',
        specialty: 'General Physician',
        date: 'Jan 5, 2026',
        diagnosis: 'Bacterial Infection',
        medications: [
            {
                name: 'Amoxicillin',
                dosage: '500 mg',
                frequency: '3 times daily',
                duration: '7 days',
                instructions: 'Complete full course of antibiotics. Take with food.',
                withFood: true,
            },
            {
                name: 'Ibuprofen',
                dosage: '400 mg',
                frequency: 'As needed for pain',
                duration: '5 days',
                instructions: 'Take with food. Maximum 3 times per day.',
                withFood: true,
            },
        ],
        additionalNotes: 'Complete the full course of antibiotics. Do not stop even if feeling better.',
        isActive: true, // Only this one is active
    },
];

// Generate PDF Prescription
const generatePrescriptionPDF = (prescription: Prescription): string => {
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
    doc.text('MediVerse Healthcare', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('E-Prescription', 105, 22, { align: 'center' });
    
    yPos = 45;
    
    // Prescription Details
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
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
        ['Specialty:', prescription.specialty],
        ['Diagnosis:', prescription.diagnosis],
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
    if (prescription.medications.length > 0) {
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
        
        prescription.medications.forEach((med, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text(`${index + 1}. ${med.name} - ${med.dosage}`, 15, yPos);
            yPos += 5;
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            doc.text(`   Frequency: ${med.frequency}`, 15, yPos);
            yPos += 4;
            doc.text(`   Duration: ${med.duration}`, 15, yPos);
            yPos += 4;
            doc.text(`   Instructions: ${med.instructions}`, 15, yPos);
            yPos += 4;
            doc.text(`   Take ${med.withFood ? 'with' : 'without'} food`, 15, yPos);
            yPos += 8;
        });
    } else {
        doc.setFontSize(10);
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.text('No medications prescribed', 10, yPos);
        yPos += 8;
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
    
    return doc.output('dataurlstring');
};

// Prescription Viewer Component
const PrescriptionViewer: React.FC<{ prescription: Prescription | null; onClose: () => void }> = ({ prescription, onClose }) => {
    const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

    useEffect(() => {
        if (prescription) {
            const dataUrl = generatePrescriptionPDF(prescription);
            setPdfDataUrl(dataUrl);
        } else {
            setPdfDataUrl(null);
        }
    }, [prescription]);

    if (!prescription) return null;

    const handleDownloadPDF = () => {
        if (!pdfDataUrl) return;
        // Create a temporary link to download
        const link = document.createElement('a');
        link.href = pdfDataUrl;
        link.download = `Prescription_${prescription.date.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={!!prescription} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[95vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle>Prescription - {prescription.doctor}</DialogTitle>
                            <DialogDescription className="mt-1">
                                {prescription.date} • {prescription.specialty}
                            </DialogDescription>
                        </div>
                        <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    </div>
                </DialogHeader>
                
                <div className="relative w-full h-[calc(95vh-120px)] bg-muted/20">
                    {pdfDataUrl ? (
                        <iframe
                            src={pdfDataUrl}
                            className="w-full h-full border-0"
                            title="Prescription PDF"
                            style={{ minHeight: '600px' }}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading prescription...</p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const Prescriptions: React.FC = () => {
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const activePrescription = prescriptions.find(p => p.isActive);
    const pastPrescriptions = prescriptions.filter(p => !p.isActive);

    return (
        <DashboardLayout
            title="Prescriptions"
            subtitle="View your prescriptions from consultations"
        >
            <div className="space-y-8">
                {/* Active Prescription */}
                {activePrescription && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="w-5 h-5 text-success" />
                            <h2 className="text-xl font-semibold">Active Prescription</h2>
                            <Badge variant="success">Active</Badge>
                        </div>
                        <div className="card-elevated p-6 border-2 border-success/20">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-1">
                                        {activePrescription.doctor}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {activePrescription.specialty} • {activePrescription.date}
                                    </p>
                                    <Badge variant="outline">{activePrescription.diagnosis}</Badge>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedPrescription(activePrescription)}
                                    className="gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Prescription
                                </Button>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-foreground mb-2">Medications:</p>
                                <div className="space-y-2">
                                    {activePrescription.medications.map((med, idx) => (
                                        <div key={idx} className="bg-muted/30 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Pill className="w-4 h-4 text-primary" />
                                                <span className="font-medium">{med.name}</span>
                                                <span className="text-sm text-muted-foreground">- {med.dosage}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground ml-6">
                                                {med.frequency} • {med.duration}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Past Prescriptions */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        Past Prescriptions
                    </h2>
                    <div className="card-elevated divide-y divide-border">
                        {pastPrescriptions.map((prescription) => (
                            <div
                                key={prescription.id}
                                className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex gap-4 items-center flex-1">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-semibold text-foreground">{prescription.doctor}</h3>
                                            <Badge variant="outline" className="text-xs">
                                                {prescription.specialty}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{prescription.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Pill className="w-4 h-4" />
                                                <span>{prescription.medications.length} medication(s)</span>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {prescription.diagnosis}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
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
                        ))}
                    </div>
                </section>
            </div>

            {/* Prescription Viewer Dialog */}
            <PrescriptionViewer
                prescription={selectedPrescription}
                onClose={() => setSelectedPrescription(null)}
            />
        </DashboardLayout>
    );
};

export default Prescriptions;

