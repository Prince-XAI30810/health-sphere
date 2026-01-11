import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Pill,
    Clock,
    Calendar,
    AlertCircle,
    ShoppingCart,
    User,
    FileText,
} from 'lucide-react';

// Medication data structure
const currentMedications = [
    {
        id: 1,
        name: 'Levothyroxine',
        dosage: '50 mcg',
        frequency: '1 time daily',
        timing: ['08:00 AM'],
        totalDoses: 30,
        remainingDoses: 8,
        prescribedBy: 'Dr. Sarah Khan',
        prescribedDate: 'Nov 20, 2025',
        startDate: 'Nov 21, 2025',
        endDate: 'Dec 21, 2025',
        instructions: 'Take on empty stomach, 30 minutes before breakfast',
        withFood: false,
        status: 'low_stock',
    },
    {
        id: 2,
        name: 'Atorvastatin',
        dosage: '20 mg',
        frequency: '1 time daily',
        timing: ['09:00 PM'],
        totalDoses: 30,
        remainingDoses: 22,
        prescribedBy: 'Dr. Arjun Singh',
        prescribedDate: 'Dec 15, 2025',
        startDate: 'Dec 16, 2025',
        endDate: 'Jan 15, 2026',
        instructions: 'Take with dinner to reduce cholesterol',
        withFood: true,
        status: 'active',
    },
    {
        id: 3,
        name: 'Amoxicillin',
        dosage: '500 mg',
        frequency: '3 times daily',
        timing: ['08:00 AM', '02:00 PM', '08:00 PM'],
        totalDoses: 21,
        remainingDoses: 9,
        prescribedBy: 'Dr. Priya Patel',
        prescribedDate: 'Jan 5, 2026',
        startDate: 'Jan 6, 2026',
        endDate: 'Jan 13, 2026',
        instructions: 'Complete full course of antibiotics',
        withFood: false,
        status: 'active',
    },
];

const pastMedications = [
    {
        id: 4,
        name: 'Ibuprofen',
        dosage: '400 mg',
        prescribedBy: 'Dr. Priya Patel',
        completedDate: 'Dec 10, 2025',
        duration: '7 days',
    },
    {
        id: 5,
        name: 'Cetirizine',
        dosage: '10 mg',
        prescribedBy: 'Dr. Arjun Singh',
        completedDate: 'Nov 15, 2025',
        duration: '14 days',
    },
];

export const Medications: React.FC = () => {
    const getStockPercentage = (remaining: number, total: number) => {
        return (remaining / total) * 100;
    };

    const getNextDoseTime = (timings: string[]) => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        for (const time of timings) {
            const [hours, minutes] = time.split(':');
            const timeInMinutes = parseInt(hours) * 60 + parseInt(minutes.split(' ')[0]);
            if (timeInMinutes > currentTime) {
                return time;
            }
        }
        return timings[0] + ' (tomorrow)';
    };

    return (
        <DashboardLayout
            title="My Medications"
            subtitle="Manage your prescriptions and dosing schedule"
        >
            <div className="space-y-8">
                {/* Active Medications */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Pill className="w-5 h-5 text-primary" />
                            Active Medications
                        </h2>
                        <Badge variant="outline">{currentMedications.length} Active</Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {currentMedications.map((med) => {
                            const stockPercentage = getStockPercentage(med.remainingDoses, med.totalDoses);
                            const isLowStock = stockPercentage < 30;

                            return (
                                <div
                                    key={med.id}
                                    className="card-elevated p-5 hover:border-primary/30 transition-colors"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-foreground">{med.name}</h3>
                                            <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                                        </div>
                                        {isLowStock && (
                                            <Badge variant="destructive" className="gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Low Stock
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Dosing Schedule */}
                                    <div className="bg-muted/30 rounded-lg p-3 mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-medium text-muted-foreground">DOSING TIMES</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {med.timing.map((time, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                    {time}
                                                </Badge>
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Next dose: <span className="font-medium text-foreground">{getNextDoseTime(med.timing)}</span>
                                        </p>
                                    </div>

                                    {/* Stock Level */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-medium text-muted-foreground">DOSES REMAINING</span>
                                            <span className="text-sm font-semibold text-foreground">
                                                {med.remainingDoses} / {med.totalDoses}
                                            </span>
                                        </div>
                                        <Progress
                                            value={stockPercentage}
                                            className="h-2"
                                        />
                                    </div>

                                    {/* Instructions */}
                                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3 mb-3">
                                        <p className="text-xs text-foreground flex items-start gap-2">
                                            <FileText className="w-3 h-3 mt-0.5 shrink-0 text-blue-600" />
                                            {med.instructions}
                                        </p>
                                    </div>

                                    {/* Prescription Info */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {med.prescribedBy}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Until {med.endDate}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {isLowStock && (
                                            <Button size="sm" className="flex-1 gap-2">
                                                <ShoppingCart className="w-4 h-4" />
                                                Order Refill
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm" className={isLowStock ? 'flex-1' : 'w-full'}>
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Past Medications */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        Past Medications
                    </h2>

                    <div className="card-elevated divide-y divide-border">
                        {pastMedications.map((med) => (
                            <div key={med.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                <div>
                                    <h4 className="font-medium text-foreground">{med.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {med.dosage} • {med.duration} • Prescribed by {med.prescribedBy}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline">Completed</Badge>
                                    <p className="text-xs text-muted-foreground mt-1">{med.completedDate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default Medications;
