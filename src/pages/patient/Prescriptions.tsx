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
import {
    prescriptions,
    Prescription,
    generatePrescriptionPDF,
} from '@/data/prescriptions';

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

