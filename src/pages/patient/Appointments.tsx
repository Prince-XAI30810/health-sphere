import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIInsightPopover } from '@/components/shared/AIInsightPopover';
import {
    Calendar,
    Clock,
    Video,
    User,
    Stethoscope,
    CheckCircle,
    XCircle,
    FileText,
} from 'lucide-react';

interface Appointment {
    id: number;
    doctor: string;
    specialty: string;
    date: string;
    time: string;
    type: 'Video Consultation' | 'In-person';
    status: 'completed' | 'cancelled' | 'upcoming';
    diagnosis?: string;
    doctorNotes?: string;
    aiSummary?: string[];
}

const upcomingAppointments: Appointment[] = [
    {
        id: 1,
        doctor: 'Dr. Priya Patel',
        specialty: 'General Physician',
        date: 'Jan 12, 2026',
        time: '3:00 PM',
        type: 'Video Consultation',
        status: 'upcoming',
    },
    {
        id: 2,
        doctor: 'Dr. Arjun Singh',
        specialty: 'Cardiologist',
        date: 'Jan 15, 2026',
        time: '10:30 AM',
        type: 'In-person',
        status: 'upcoming',
    },
];

const pastAppointments: Appointment[] = [
    {
        id: 3,
        doctor: 'Dr. Priya Patel',
        specialty: 'General Physician',
        date: 'Dec 20, 2025',
        time: '2:30 PM',
        type: 'Video Consultation',
        status: 'completed',
        diagnosis: 'Upper Respiratory Infection',
        doctorNotes: 'Patient presented with fever, cough, and mild congestion. Vitals stable. Recommended symptomatic treatment and rest.',
        aiSummary: [
            'Doctor diagnosed upper respiratory infection with stable vitals',
            'Recommended symptomatic treatment including rest and hydration',
            'No antibiotics prescribed - viral infection suspected',
            'Follow-up recommended if symptoms persist beyond 5 days',
            'Patient advised to monitor temperature and seek care if fever exceeds 101°F'
        ],
    },
    {
        id: 4,
        doctor: 'Dr. Arjun Singh',
        specialty: 'Cardiologist',
        date: 'Dec 15, 2025',
        time: '11:00 AM',
        type: 'In-person',
        status: 'completed',
        diagnosis: 'Routine Cardiac Checkup',
        doctorNotes: 'Annual cardiac evaluation. Lipid profile shows borderline LDL. Blood pressure well controlled. Recommended dietary modifications and regular exercise. Follow-up in 3 months.',
        aiSummary: [
            'Routine cardiac checkup completed with overall good cardiovascular health',
            'Borderline LDL cholesterol (145 mg/dL) - dietary modifications recommended',
            'Blood pressure well controlled at 135/88 mmHg',
            'Doctor emphasized importance of regular exercise and omega-3 intake',
            'Next follow-up scheduled for March 2026 to monitor cholesterol levels'
        ],
    },
    {
        id: 5,
        doctor: 'Dr. Sarah Khan',
        specialty: 'Endocrinologist',
        date: 'Nov 20, 2025',
        time: '4:00 PM',
        type: 'In-person',
        status: 'completed',
        diagnosis: 'Thyroid Function Evaluation',
        doctorNotes: 'TSH elevated at 6.8 mIU/L indicating mild hypothyroidism. Patient reports fatigue and weight gain. Prescribed Levothyroxine 50mcg daily. Follow-up in 6 weeks to recheck TSH levels.',
        aiSummary: [
            'Diagnosed with mild hypothyroidism based on elevated TSH (6.8 mIU/L)',
            'Doctor prescribed Levothyroxine 50mcg daily to normalize thyroid function',
            'Patient symptoms include fatigue and weight gain - common with hypothyroidism',
            'Follow-up appointment scheduled in 6 weeks to monitor medication effectiveness',
            'Doctor advised taking medication on empty stomach 30 minutes before breakfast'
        ],
    },
    {
        id: 6,
        doctor: 'Dr. Priya Patel',
        specialty: 'General Physician',
        date: 'Oct 25, 2025',
        time: '3:30 PM',
        type: 'Video Consultation',
        status: 'completed',
        diagnosis: 'Routine Health Checkup',
        doctorNotes: 'Annual health examination. All vitals within normal range. Discussed preventive care measures. Recommended flu vaccination and updated tetanus booster.',
        aiSummary: [
            'Annual health checkup completed with all vitals in normal range',
            'Doctor recommended flu vaccination and tetanus booster update',
            'Preventive care measures discussed including regular exercise and balanced diet',
            'No immediate health concerns identified during examination',
            'Next annual checkup scheduled for October 2026'
        ],
    },
    {
        id: 7,
        doctor: 'Dr. Arjun Singh',
        specialty: 'Cardiologist',
        date: 'Sep 10, 2025',
        time: '10:00 AM',
        type: 'In-person',
        status: 'completed',
        diagnosis: 'Chest Pain Evaluation',
        doctorNotes: 'Patient reported occasional chest discomfort. ECG normal, no signs of cardiac issues. Likely musculoskeletal. Recommended stress management and follow-up if symptoms worsen.',
        aiSummary: [
            'Chest pain evaluation completed - ECG showed normal results',
            'No cardiac issues detected, likely musculoskeletal in nature',
            'Doctor recommended stress management techniques and lifestyle modifications',
            'Patient advised to monitor symptoms and return if chest pain becomes frequent',
            'Reassurance provided that cardiac health appears stable'
        ],
    },
    {
        id: 8,
        doctor: 'Dr. Priya Patel',
        specialty: 'General Physician',
        date: 'Aug 15, 2025',
        time: '2:00 PM',
        type: 'Video Consultation',
        status: 'cancelled',
        diagnosis: 'Cancelled Appointment',
        doctorNotes: 'Appointment cancelled by patient due to scheduling conflict.',
    },
];

export const Appointments: React.FC = () => {
    const getStatusIcon = (status: Appointment['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-success" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-destructive" />;
            default:
                return <Clock className="w-4 h-4 text-warning" />;
        }
    };

    const getStatusBadge = (status: Appointment['status']) => {
        switch (status) {
            case 'completed':
                return <Badge variant="success">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="info">Upcoming</Badge>;
        }
    };

    return (
        <DashboardLayout
            title="Appointments"
            subtitle="Manage your upcoming and past appointments"
        >
            <Tabs defaultValue="upcoming" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past Appointments</TabsTrigger>
                </TabsList>

                {/* Upcoming Appointments */}
                <TabsContent value="upcoming" className="space-y-4">
                    <div className="card-elevated divide-y divide-border">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex gap-4 items-center flex-1">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-foreground">{apt.doctor}</h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {apt.specialty}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{apt.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{apt.time}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {apt.type === 'Video Consultation' ? (
                                                        <Video className="w-4 h-4" />
                                                    ) : (
                                                        <Stethoscope className="w-4 h-4" />
                                                    )}
                                                    <span>{apt.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(apt.status)}
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No upcoming appointments</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Past Appointments */}
                <TabsContent value="past" className="space-y-4">
                    <div className="card-elevated divide-y divide-border">
                        {pastAppointments.map((apt) => (
                            <div
                                key={apt.id}
                                className="p-6 hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex gap-4 items-start flex-1">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                            <User className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-foreground">{apt.doctor}</h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {apt.specialty}
                                                </Badge>
                                                {getStatusIcon(apt.status)}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{apt.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{apt.time}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {apt.type === 'Video Consultation' ? (
                                                        <Video className="w-4 h-4" />
                                                    ) : (
                                                        <Stethoscope className="w-4 h-4" />
                                                    )}
                                                    <span>{apt.type}</span>
                                                </div>
                                            </div>
                                            {apt.diagnosis && (
                                                <div className="mb-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText className="w-4 h-4 text-primary" />
                                                        <span className="text-sm font-medium text-foreground">Diagnosis:</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground ml-6">{apt.diagnosis}</p>
                                                </div>
                                            )}
                                            {apt.doctorNotes && (
                                                <div className="bg-muted/50 p-3 rounded-lg mb-3">
                                                    <p className="text-sm text-foreground">
                                                        <span className="font-medium">Doctor's Notes: </span>
                                                        {apt.doctorNotes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(apt.status)}
                                        {apt.aiSummary && apt.status === 'completed' && (
                                            <AIInsightPopover
                                                insights={apt.aiSummary}
                                                triggerText="AI Summary"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
};

export default Appointments;

