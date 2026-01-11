import React from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const labResults = [
    {
        id: 1,
        test: 'Complete Blood Count (CBC)',
        date: 'Jan 8, 2026',
        doctor: 'Dr. Priya Patel',
        status: 'Normal',
        fileSize: '1.2 MB',
    },
    {
        id: 2,
        test: 'Lipid Profile',
        date: 'Dec 15, 2025',
        doctor: 'Dr. Arjun Singh',
        status: 'Borderline',
        fileSize: '850 KB',
    },
    {
        id: 3,
        test: 'Blood Glucose (Fasting)',
        date: 'Dec 15, 2025',
        doctor: 'Dr. Arjun Singh',
        status: 'Normal',
        fileSize: '620 KB',
    },
    {
        id: 4,
        test: 'Thyroid Function Test',
        date: 'Nov 20, 2025',
        doctor: 'Dr. Sarah Khan',
        status: 'Abnormal',
        fileSize: '1.5 MB',
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
        provider: 'Apollo Hospital',
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

export const HealthRecords: React.FC = () => {
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
                                <div className="flex items-center gap-4">
                                    <Badge
                                        variant={
                                            result.status === 'Normal' ? 'success' :
                                                result.status === 'Borderline' ? 'warning' : 'destructive'
                                        }
                                    >
                                        {result.status}
                                    </Badge>
                                    <Button variant="ghost" size="icon" title="Download">
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
        </DashboardLayout>
    );
};

export default HealthRecords;
