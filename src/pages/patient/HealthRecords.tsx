import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Syringe,
    Activity,
    Calendar,
    Download,
    Search,
    Filter,
    Eye,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIInsightPopover } from '@/components/shared/AIInsightPopover';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import jsPDF from 'jspdf';

interface LabResult {
    id: number;
    test: string;
    date: string;
    doctor: string;
    status: string;
    fileSize: string;
    lab?: string;
    aiInsights: string[];
    results?: Record<string, { value: string; normal: string; unit?: string }>;
}

const labResults: LabResult[] = [
    {
        id: 1,
        test: 'Complete Blood Count (CBC)',
        date: 'Jan 8, 2026',
        doctor: 'Dr. Priya Patel',
        lab: 'City Health Lab',
        status: 'Normal',
        fileSize: '1.2 MB',
        results: {
            'Hemoglobin': { value: '14.8', normal: '12.0-17.0', unit: 'g/dL' },
            'White Blood Cells': { value: '7.2', normal: '4.0-11.0', unit: '×10³/µL' },
            'Platelets': { value: '250', normal: '150-450', unit: '×10³/µL' },
            'Red Blood Cells': { value: '4.8', normal: '4.5-5.5', unit: '×10⁶/µL' },
        },
        aiInsights: [
            'All blood cell counts are within healthy ranges, indicating good overall blood health',
            'Hemoglobin levels are optimal, suggesting adequate oxygen transport throughout your body',
            'No signs of infection or anemia detected'
        ]
    },
    {
        id: 2,
        test: 'Lipid Profile',
        date: 'Dec 15, 2025',
        doctor: 'Dr. Arjun Singh',
        lab: 'City Health Lab',
        status: 'Borderline',
        fileSize: '850 KB',
        results: {
            'Total Cholesterol': { value: '210', normal: '<200', unit: 'mg/dL' },
            'LDL Cholesterol': { value: '145', normal: '<100', unit: 'mg/dL' },
            'HDL Cholesterol': { value: '48', normal: '>40', unit: 'mg/dL' },
            'Triglycerides': { value: '180', normal: '<150', unit: 'mg/dL' },
        },
        aiInsights: [
            'LDL cholesterol is slightly elevated at 145 mg/dL (optimal: <100 mg/dL)',
            'Consider dietary modifications: reduce saturated fats and increase fiber intake',
            'Regular exercise and follow-up testing in 3 months recommended'
        ]
    },
    {
        id: 3,
        test: 'Blood Glucose (Fasting)',
        date: 'Dec 15, 2025',
        doctor: 'Dr. Arjun Singh',
        lab: 'City Health Lab',
        status: 'Normal',
        fileSize: '620 KB',
        results: {
            'Fasting Glucose': { value: '92', normal: '70-100', unit: 'mg/dL' },
            'HbA1c': { value: '5.4', normal: '<5.7', unit: '%' },
        },
        aiInsights: [
            'Fasting glucose level at 92 mg/dL is within normal range (70-100 mg/dL)',
            'No indication of prediabetes or diabetes',
            'Maintain current lifestyle habits for optimal glucose control'
        ]
    },
    {
        id: 4,
        test: 'Thyroid Function Test',
        date: 'Nov 20, 2025',
        doctor: 'Dr. Sarah Khan',
        lab: 'Apollo Diagnostics',
        status: 'Abnormal',
        fileSize: '1.5 MB',
        results: {
            'TSH': { value: '6.8', normal: '0.4-4.0', unit: 'mIU/L' },
            'Free T4': { value: '0.9', normal: '0.8-1.8', unit: 'ng/dL' },
            'Free T3': { value: '2.8', normal: '2.3-4.2', unit: 'pg/mL' },
        },
        aiInsights: [
            'TSH level is elevated at 6.8 mIU/L, suggesting mild hypothyroidism',
            'Common symptoms may include fatigue, weight gain, and cold sensitivity',
            'Thyroid medication may be required - consult with your endocrinologist for treatment options'
        ]
    },
    {
        id: 5,
        test: 'Liver Function Test',
        date: 'Sep 12, 2024',
        doctor: 'Dr. Priya Patel',
        lab: 'City Health Lab',
        status: 'Normal',
        fileSize: '980 KB',
        results: {
            'ALT': { value: '28', normal: '<40', unit: 'U/L' },
            'AST': { value: '32', normal: '<40', unit: 'U/L' },
            'Bilirubin': { value: '0.8', normal: '<1.2', unit: 'mg/dL' },
        },
        aiInsights: [
            'All liver enzymes are within normal range',
            'No signs of liver dysfunction detected',
            'Continue maintaining healthy lifestyle'
        ]
    },
    {
        id: 6,
        test: 'Kidney Function Test',
        date: 'Jun 8, 2024',
        doctor: 'Dr. Arjun Singh',
        lab: 'City Health Lab',
        status: 'Normal',
        fileSize: '750 KB',
        results: {
            'Creatinine': { value: '0.9', normal: '0.6-1.2', unit: 'mg/dL' },
            'BUN': { value: '14', normal: '7-20', unit: 'mg/dL' },
            'eGFR': { value: '95', normal: '>60', unit: 'mL/min/1.73m²' },
        },
        aiInsights: [
            'Kidney function is normal',
            'All markers indicate healthy kidney function',
            'Continue adequate hydration'
        ]
    },
    {
        id: 7,
        test: 'Complete Blood Count (CBC)',
        date: 'Mar 15, 2023',
        doctor: 'Dr. Priya Patel',
        lab: 'Apollo Diagnostics',
        status: 'Normal',
        fileSize: '1.1 MB',
        results: {
            'Hemoglobin': { value: '13.2', normal: '12.0-17.0', unit: 'g/dL' },
            'White Blood Cells': { value: '6.8', normal: '4.0-11.0', unit: '×10³/µL' },
            'Platelets': { value: '245', normal: '150-450', unit: '×10³/µL' },
        },
        aiInsights: [
            'Blood counts within normal range',
            'Slight improvement in hemoglobin from previous test',
            'No abnormalities detected'
        ]
    },
    {
        id: 8,
        test: 'Lipid Profile',
        date: 'Dec 10, 2022',
        doctor: 'Dr. Arjun Singh',
        lab: 'City Health Lab',
        status: 'Borderline',
        fileSize: '820 KB',
        results: {
            'Total Cholesterol': { value: '225', normal: '<200', unit: 'mg/dL' },
            'LDL Cholesterol': { value: '158', normal: '<100', unit: 'mg/dL' },
            'HDL Cholesterol': { value: '45', normal: '>40', unit: 'mg/dL' },
        },
        aiInsights: [
            'Cholesterol levels were higher than current',
            'Improvement seen in recent tests',
            'Continue dietary modifications'
        ]
    },
    {
        id: 9,
        test: 'Blood Glucose (Fasting)',
        date: 'Aug 20, 2021',
        doctor: 'Dr. Sarah Khan',
        lab: 'Apollo Diagnostics',
        status: 'Normal',
        fileSize: '600 KB',
        results: {
            'Fasting Glucose': { value: '98', normal: '70-100', unit: 'mg/dL' },
            'HbA1c': { value: '5.6', normal: '<5.7', unit: '%' },
        },
        aiInsights: [
            'Glucose levels were slightly higher',
            'Good improvement in recent tests',
            'Maintain healthy diet and exercise'
        ]
    },
    {
        id: 10,
        test: 'Complete Blood Count (CBC)',
        date: 'May 12, 2020',
        doctor: 'Dr. Priya Patel',
        lab: 'City Health Lab',
        status: 'Normal',
        fileSize: '1.0 MB',
        results: {
            'Hemoglobin': { value: '13.0', normal: '12.0-17.0', unit: 'g/dL' },
            'White Blood Cells': { value: '7.0', normal: '4.0-11.0', unit: '×10³/µL' },
            'Platelets': { value: '240', normal: '150-450', unit: '×10³/µL' },
        },
        aiInsights: [
            'Baseline blood counts established',
            'All parameters within normal range',
            'Good overall health indicators'
        ]
    },
];

const immunizations = [
    {
        id: 1,
        vaccine: 'Influenza (Flu Shot)',
        date: 'Oct 10, 2025',
        provider: 'City Health Clinic',
        nextDue: 'Oct 10, 2026',
    },
    {
        id: 2,
        vaccine: 'Tetanus Booster',
        date: 'Mar 12, 2024',
        provider: 'City Health Clinic',
        nextDue: 'Mar 12, 2034',
    },
    {
        id: 3,
        vaccine: 'COVID-19 Booster',
        date: 'Jan 15, 2025',
        provider: 'City Health Clinic',
        nextDue: 'Jan 15, 2026',
    },
];

const procedures = [
    {
        id: 1,
        procedure: 'Root Canal Treatment',
        date: 'Aug 5, 2025',
        doctor: 'Dr. Smile Dental',
        facility: 'Dental Care Center',
        notes: 'Successful, follow-up required',
    },
    {
        id: 2,
        procedure: 'Appendectomy',
        date: 'Jun 14, 2022',
        doctor: 'Dr. James Wilson',
        facility: 'General Hospital',
        notes: 'Laparoscopic surgery, no complications',
    },
];

// Laboratory information mapping
const getLabInfo = (labName: string) => {
    const labs: Record<string, { name: string; address: string; phone: string; email: string; license: string; director: string }> = {
        'City Health Lab': {
            name: 'City Health Diagnostic Laboratory',
            address: '123 Medical Plaza, Sector 5, New Delhi - 110001',
            phone: '+91-11-2345-6789',
            email: 'info@cityhealthlab.com',
            license: 'DL/2020/12345',
            director: 'Dr. Ramesh Kumar, MD, Pathologist'
        },
        'Apollo Diagnostics': {
            name: 'Apollo Diagnostics & Research Center',
            address: '456 Healthcare Avenue, Connaught Place, New Delhi - 110001',
            phone: '+91-11-2345-7890',
            email: 'contact@apollodiagnostics.in',
            license: 'DL/2018/98765',
            director: 'Dr. Sunita Verma, MD, DCP'
        }
    };
    return labs[labName] || {
        name: labName || 'MediVerse Diagnostic Laboratory',
        address: '789 Health Street, Medical District, New Delhi - 110001',
        phone: '+91-11-2345-0000',
        email: 'info@mediverselab.com',
        license: 'DL/2021/54321',
        director: 'Dr. Anil Sharma, MD, Pathologist'
    };
};

// Generate PDF Report - Returns PDF data URL for viewing
const generatePDFReport = (report: LabResult, userName: string, returnDataUrl: boolean = false): string | void => {
    const labInfo = getLabInfo(report.lab || '');
    const doc = new jsPDF();
    
    // Colors
    const primaryColor = [33, 150, 243]; // Blue
    const darkGray = [51, 51, 51];
    const lightGray = [128, 128, 128];
    
    let yPos = 20;
    
    // Header with Laboratory Logo Area
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 35, 'F');
    
    // Laboratory Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(labInfo.name, 105, 15, { align: 'center' });
    
    // Laboratory Tagline
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Accredited by NABL | ISO 15189:2012 Certified', 105, 22, { align: 'center' });
    
    // Report Title
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(report.test.toUpperCase(), 105, 45, { align: 'center' });
    
    yPos = 55;
    
    // Patient Information Section
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(10, yPos, 200, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('PATIENT INFORMATION', 10, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    
    const patientInfo = [
        ['Patient Name:', userName || 'Patient'],
        ['Test Date:', report.date],
        ['Ordering Physician:', report.doctor],
        ['Report Status:', report.status],
        ['Report ID:', `LAB-${report.id.toString().padStart(6, '0')}`],
    ];
    
    patientInfo.forEach(([label, value]) => {
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.text(label, 10, yPos);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text(value, 60, yPos);
        yPos += 6;
    });
    
    yPos += 5;
    
    // Test Results Section
    if (report.results) {
        doc.setDrawColor(200, 200, 200);
        doc.line(10, yPos, 200, yPos);
        yPos += 8;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text('TEST RESULTS', 10, yPos);
        yPos += 8;
        
        // Table Header
        doc.setFillColor(240, 240, 240);
        doc.rect(10, yPos - 5, 190, 8, 'F');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text('Test Parameter', 12, yPos);
        doc.text('Result', 80, yPos);
        doc.text('Normal Range', 120, yPos);
        doc.text('Unit', 170, yPos);
        
        yPos += 8;
        doc.setDrawColor(220, 220, 220);
        doc.line(10, yPos - 2, 200, yPos - 2);
        
        // Table Rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        Object.entries(report.results).forEach(([key, value]) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            doc.text(key, 12, yPos);
            
            // Check if value is normal
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
    
    yPos += 10;
    
    // Footer Section
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.setDrawColor(200, 200, 200);
    doc.line(10, yPos, 200, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    
    // Laboratory Information
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('LABORATORY INFORMATION', 10, yPos);
    yPos += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(labInfo.address, 10, yPos);
    yPos += 5;
    doc.text(`Phone: ${labInfo.phone} | Email: ${labInfo.email}`, 10, yPos);
    yPos += 5;
    doc.text(`License No: ${labInfo.license}`, 10, yPos);
    yPos += 5;
    doc.text(`Lab Director: ${labInfo.director}`, 10, yPos);
    
    yPos += 10;
    
    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setFont('helvetica', 'italic');
    const disclaimer = 'This is an official laboratory report. Results should be interpreted by a qualified physician. ' +
        'This report is confidential and intended solely for the patient and their healthcare provider.';
    doc.text(disclaimer, 10, yPos, { maxWidth: 190, align: 'justify' });
    
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Generated: ${new Date().toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`, 10, yPos);
    
    // Return data URL for viewing or save PDF
    if (returnDataUrl) {
        return doc.output('dataurlstring');
    } else {
        const fileName = `${report.test.replace(/[^a-z0-9]/gi, '_')}_${report.date.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        doc.save(fileName);
    }
};

// PDF Report Viewer Component
const ReportViewer: React.FC<{ report: LabResult | null; onClose: () => void }> = ({ report, onClose }) => {
    const { user } = useAuth();
    const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

    useEffect(() => {
        if (report) {
            const dataUrl = generatePDFReport(report, user?.name || 'Patient', true) as string;
            setPdfDataUrl(dataUrl);
        } else {
            setPdfDataUrl(null);
        }
    }, [report, user?.name]);

    if (!report) return null;

    const handleDownloadPDF = () => {
        generatePDFReport(report, user?.name || 'Patient', false);
    };

    return (
        <Dialog open={!!report} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[95vh] p-0">
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
            </DialogContent>
        </Dialog>
    );
};

export const HealthRecords: React.FC = () => {
    const [selectedReport, setSelectedReport] = useState<LabResult | null>(null);
    const { user } = useAuth();

    return (
        <DashboardLayout
            title="Health Records"
            subtitle="Access and manage your medical history, test results, and reports"
        >
            <div className="space-y-8">
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search records..."
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                        <Button size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Download All
                        </Button>
                    </div>
                </div>

                {/* Labs Section */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold">Lab Results & Reports</h2>
                    </div>
                    <div className="card-elevated divide-y divide-border">
                        {labResults.map((result) => (
                            <div key={result.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                <div className="flex gap-4 items-center">
                                    <div className="bg-muted p-3 rounded-lg">
                                        <FileText className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-foreground">{result.test}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {result.date} • {result.doctor}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <AIInsightPopover
                                        insights={result.aiInsights}
                                        triggerText="AI"
                                    />
                                    <Badge
                                        variant={
                                            result.status === 'Normal' ? 'success' :
                                                result.status === 'Borderline' ? 'warning' : 'destructive'
                                        }
                                    >
                                        {result.status}
                                    </Badge>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setSelectedReport(result)}
                                        className="gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        title="Download PDF"
                                        onClick={() => {
                                            generatePDFReport(result, user?.name || 'Patient');
                                        }}
                                    >
                                        <Download className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Immunizations Section */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                            <Syringe className="w-5 h-5 text-secondary" />
                        </div>
                        <h2 className="text-xl font-semibold">Immunization History</h2>
                    </div>
                    <div className="card-elevated p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Vaccine</th>
                                        <th className="px-6 py-4">Date Administered</th>
                                        <th className="px-6 py-4">Provider</th>
                                        <th className="px-6 py-4">Next Due</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {immunizations.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/30">
                                            <td className="px-6 py-4 font-medium">{item.vaccine}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{item.date}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{item.provider}</td>
                                            <td className="px-6 py-4 text-primary font-medium">{item.nextDue}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Procedures Section */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-success/10 rounded-lg">
                            <Activity className="w-5 h-5 text-success" />
                        </div>
                        <h2 className="text-xl font-semibold">Past Procedures</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {procedures.map((proc) => (
                            <div key={proc.id} className="card-elevated p-4 hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg">{proc.procedure}</h3>
                                    <Badge variant="outline">{proc.date}</Badge>
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                                    <p>Performed by: <span className="text-foreground">{proc.doctor}</span></p>
                                    <p>At: <span className="text-foreground">{proc.facility}</span></p>
                                </div>
                                <div className="bg-muted/50 p-2 rounded-md text-xs italic text-muted-foreground">
                                    Note: {proc.notes}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            
            {/* Report Viewer Dialog */}
            <ReportViewer 
                report={selectedReport} 
                onClose={() => setSelectedReport(null)} 
            />
        </DashboardLayout>
    );
};

export default HealthRecords;
