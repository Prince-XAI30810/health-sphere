import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { AIInsightPopover } from '@/components/shared/AIInsightPopover';
import { useAuth } from '@/contexts/AuthContext';
import {
    Calendar,
    Clock,
    Video,
    User,
    Stethoscope,
    CheckCircle,
    XCircle,
    FileText,
    MapPin,
    Phone,
    ClipboardList,
    Info,
    CalendarDays,
} from 'lucide-react';

interface Appointment {
    id?: number;
    appointment_id?: string;
    doctor: string;
    doctor_name?: string;
    specialty: string;
    date: string;
    appointment_date?: string;
    time: string;
    appointment_time?: string;
    type?: 'Video Consultation' | 'In-person';
    status: 'completed' | 'cancelled' | 'upcoming' | 'scheduled';
    diagnosis?: string;
    doctorNotes?: string;
    aiSummary?: string[];
    location?: string;
    contactNumber?: string;
    preparation?: string[];
    duration?: string;
    meetingLink?: string;
    appointmentNotes?: string;
    reason?: string;
    symptoms?: string;
    pain_rating?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';

// Mock data for past appointments (can be fetched from backend later)

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

// Doctor availability slots data
interface TimeSlot {
    time: string;
    available: boolean;
}

interface DaySlots {
    date: string;
    dayName: string;
    slots: TimeSlot[];
}

interface DoctorAvailability {
    [doctorName: string]: DaySlots[];
}

const doctorAvailability: DoctorAvailability = {
    'Dr. Priya Patel': [
        {
            date: 'Jan 13, 2026',
            dayName: 'Monday',
            slots: [
                { time: '9:00 AM', available: true },
                { time: '10:00 AM', available: false },
                { time: '11:00 AM', available: true },
                { time: '2:00 PM', available: true },
                { time: '3:00 PM', available: false },
                { time: '4:00 PM', available: true },
            ]
        },
        {
            date: 'Jan 14, 2026',
            dayName: 'Tuesday',
            slots: [
                { time: '9:00 AM', available: true },
                { time: '10:00 AM', available: true },
                { time: '11:00 AM', available: false },
                { time: '2:00 PM', available: true },
                { time: '3:00 PM', available: true },
                { time: '4:00 PM', available: false },
            ]
        },
        {
            date: 'Jan 15, 2026',
            dayName: 'Wednesday',
            slots: [
                { time: '9:00 AM', available: false },
                { time: '10:00 AM', available: true },
                { time: '11:00 AM', available: true },
                { time: '2:00 PM', available: false },
                { time: '3:00 PM', available: true },
                { time: '4:00 PM', available: true },
            ]
        },
    ],
    'Dr. Arjun Singh': [
        {
            date: 'Jan 16, 2026',
            dayName: 'Thursday',
            slots: [
                { time: '9:30 AM', available: true },
                { time: '10:30 AM', available: true },
                { time: '11:30 AM', available: false },
                { time: '2:30 PM', available: true },
                { time: '3:30 PM', available: false },
            ]
        },
        {
            date: 'Jan 17, 2026',
            dayName: 'Friday',
            slots: [
                { time: '9:30 AM', available: false },
                { time: '10:30 AM', available: true },
                { time: '11:30 AM', available: true },
                { time: '2:30 PM', available: true },
                { time: '3:30 PM', available: true },
            ]
        },
        {
            date: 'Jan 20, 2026',
            dayName: 'Monday',
            slots: [
                { time: '9:30 AM', available: true },
                { time: '10:30 AM', available: false },
                { time: '11:30 AM', available: true },
                { time: '2:30 PM', available: false },
                { time: '3:30 PM', available: true },
            ]
        },
    ],
};

export const Appointments: React.FC = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);

    // Fetch appointments from backend
    useEffect(() => {
        const fetchAppointments = async () => {
            if (!user || user.role !== 'patient') {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                // Fetch upcoming appointments
                const upcomingResponse = await fetch(`${API_BASE_URL}/api/appointments/patient/${user.id}`);
                if (!upcomingResponse.ok) {
                    throw new Error('Failed to fetch appointments');
                }
                const upcomingData = await upcomingResponse.json();

                // Fetch past appointments
                let pastData = { appointments: [] };
                try {
                    const pastResponse = await fetch(`${API_BASE_URL}/api/appointments/patient/${user.id}/past`);
                    if (pastResponse.ok) {
                        pastData = await pastResponse.json();
                    }
                } catch (error) {
                    console.warn('Error fetching past appointments:', error);
                }

                // Combine all appointments
                const allAppointments = [...(upcomingData.appointments || []), ...(pastData.appointments || [])];

                // Convert backend appointments to frontend format
                const convertedAppointments: Appointment[] = allAppointments.map((apt: any) => {
                    // Determine status
                    let status: 'completed' | 'cancelled' | 'upcoming' | 'scheduled' = 'upcoming';
                    if (apt.status === 'completed') {
                        status = 'completed';
                    } else if (apt.status === 'cancelled') {
                        status = 'cancelled';
                    } else {
                        // Check if appointment date is in the past
                        const appointmentDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
                        const now = new Date();
                        if (appointmentDate < now) {
                            status = 'completed';
                        } else {
                            status = 'upcoming';
                        }
                    }

                    return {
                        id: parseInt(apt.appointment_id?.replace(/-/g, '').substring(0, 8) || '0', 16) || 0,
                        appointment_id: apt.appointment_id,
                        doctor: apt.doctor_name || 'Unknown Doctor',
                        doctor_name: apt.doctor_name,
                        specialty: apt.specialty || 'General',
                        date: apt.appointment_date || '',
                        appointment_date: apt.appointment_date,
                        time: apt.appointment_time || '',
                        appointment_time: apt.appointment_time,
                        type: 'Video Consultation' as const,
                        status: status,
                        reason: apt.reason,
                        symptoms: apt.symptoms,
                        pain_rating: apt.pain_rating,
                        duration: '30 minutes',
                        appointmentNotes: apt.reason || apt.symptoms || 'Appointment scheduled via AI Triage',
                        diagnosis: apt.diagnosis,
                        doctorNotes: apt.doctor_notes,
                        aiSummary: apt.ai_summary || (apt.ai_summary === null ? undefined : []),
                    };
                });

                // Sort by date (upcoming first, then past)
                convertedAppointments.sort((a, b) => {
                    const dateA = new Date(`${a.appointment_date || a.date}T${a.appointment_time || a.time}`);
                    const dateB = new Date(`${b.appointment_date || b.date}T${b.appointment_time || b.time}`);
                    return dateB.getTime() - dateA.getTime();
                });

                setAppointments(convertedAppointments);
            } catch (error) {
                console.error('Error fetching appointments:', error);
                setAppointments([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, [user]);

    const handleRescheduleClick = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setSelectedSlot(null);
        setRescheduleDialogOpen(true);
    };

    const handleSlotSelect = (date: string, time: string) => {
        setSelectedSlot({ date, time });
    };

    const handleConfirmReschedule = () => {
        // In a real app, this would call an API to reschedule
        alert(`Appointment rescheduled to ${selectedSlot?.date} at ${selectedSlot?.time}`);
        setRescheduleDialogOpen(false);
        setSelectedAppointment(null);
        setSelectedSlot(null);
    };

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
                    {isLoading ? (
                        <div className="card-elevated p-6 text-center">
                            <p className="text-muted-foreground">Loading appointments...</p>
                        </div>
                    ) : (
                        <div className="card-elevated divide-y divide-border">
                            {appointments.filter(apt => apt.status === 'upcoming' || apt.status === 'scheduled').length > 0 ? (
                                appointments.filter(apt => apt.status === 'upcoming' || apt.status === 'scheduled').map((apt) => (
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
                                                        <span>{apt.appointment_date || apt.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{apt.appointment_time || apt.time}</span>
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
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <Info className="w-4 h-4 mr-1" />
                                                        View Details
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80" align="end">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <User className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-sm">{apt.doctor}</h4>
                                                                <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3 text-sm">
                                                            <div className="flex items-start gap-2">
                                                                <Calendar className="w-4 h-4 text-primary mt-0.5" />
                                                                <div>
                                                                    <p className="font-medium">Date & Time</p>
                                                                    <p className="text-muted-foreground text-xs">{apt.appointment_date || apt.date} at {apt.appointment_time || apt.time}</p>
                                                                    {apt.duration && <p className="text-muted-foreground text-xs">Duration: {apt.duration}</p>}
                                                                </div>
                                                            </div>

                                                            {apt.type === 'Video Consultation' ? (
                                                                <div className="flex items-start gap-2">
                                                                    <Video className="w-4 h-4 text-primary mt-0.5" />
                                                                    <div>
                                                                        <p className="font-medium">Video Consultation</p>
                                                                        <p className="text-muted-foreground text-xs">Join link will be shared 10 mins before</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-start gap-2">
                                                                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                                                                    <div>
                                                                        <p className="font-medium">Location</p>
                                                                        <p className="text-muted-foreground text-xs">{apt.location}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {apt.contactNumber && (
                                                                <div className="flex items-start gap-2">
                                                                    <Phone className="w-4 h-4 text-primary mt-0.5" />
                                                                    <div>
                                                                        <p className="font-medium">Contact</p>
                                                                        <p className="text-muted-foreground text-xs">{apt.contactNumber}</p>
                                                                    </div>
                                                                </div>
                                                            )}



                                                            {apt.preparation && apt.preparation.length > 0 && (
                                                                <div className="flex items-start gap-2">
                                                                    <ClipboardList className="w-4 h-4 text-primary mt-0.5" />
                                                                    <div>
                                                                        <p className="font-medium">How to Prepare</p>
                                                                        <ul className="text-muted-foreground text-xs space-y-1 mt-1">
                                                                            {apt.preparation.map((item, idx) => (
                                                                                <li key={idx} className="flex gap-1">
                                                                                    <span className="text-primary">•</span>
                                                                                    <span>{item}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex gap-2 pt-2 border-t border-border">
                                                            {apt.type === 'Video Consultation' ? (
                                                                <Button size="sm" className="flex-1" asChild>
                                                                    <Link to="/patient/telehealth" state={{
                                                                        doctorName: apt.doctor,
                                                                        specialty: apt.specialty,
                                                                        appointmentDate: apt.appointment_date || apt.date,
                                                                        appointmentTime: apt.appointment_time || apt.time
                                                                    }}>
                                                                        <Video className="w-4 h-4 mr-1" />
                                                                        Join Call
                                                                    </Link>
                                                                </Button>
                                                            ) : (
                                                                <Button size="sm" className="flex-1">
                                                                    <MapPin className="w-4 h-4 mr-1" />
                                                                    Get Directions
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRescheduleClick(apt)}
                                                            >
                                                                <CalendarDays className="w-4 h-4 mr-1" />
                                                                Reschedule
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
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
                    )}
                </TabsContent>

                {/* Past Appointments */}
                <TabsContent value="past" className="space-y-4">
                    {isLoading ? (
                        <div className="card-elevated p-6 text-center">
                            <p className="text-muted-foreground">Loading appointments...</p>
                        </div>
                    ) : (
                        <div className="card-elevated divide-y divide-border">
                            {appointments.filter(apt => apt.status === 'completed' || apt.status === 'cancelled').length > 0 ? (
                                appointments.filter(apt => apt.status === 'completed' || apt.status === 'cancelled').map((apt) => (
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
                                                            <span>{apt.appointment_date || apt.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{apt.appointment_time || apt.time}</span>
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
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No past appointments</p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Reschedule Dialog */}
            <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-primary" />
                            Reschedule Appointment
                        </DialogTitle>
                        <DialogDescription>
                            Select a new date and time for your appointment with {selectedAppointment?.doctor}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAppointment && doctorAvailability[selectedAppointment.doctor] && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{selectedAppointment.doctor}</p>
                                    <p className="text-xs text-muted-foreground">{selectedAppointment.specialty}</p>
                                </div>
                                <Badge variant="outline" className="ml-auto">
                                    {selectedAppointment.type}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium text-sm text-muted-foreground">Available Slots</h4>
                                {doctorAvailability[selectedAppointment.doctor].map((day, dayIdx) => (
                                    <div key={dayIdx} className="border border-border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <span className="font-medium text-sm">{day.dayName}, {day.date}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {day.slots.map((slot, slotIdx) => (
                                                <Button
                                                    key={slotIdx}
                                                    variant={selectedSlot?.date === day.date && selectedSlot?.time === slot.time ? "default" : "outline"}
                                                    size="sm"
                                                    disabled={!slot.available}
                                                    onClick={() => handleSlotSelect(day.date, slot.time)}
                                                    className={`${!slot.available
                                                        ? 'opacity-50 cursor-not-allowed line-through'
                                                        : selectedSlot?.date === day.date && selectedSlot?.time === slot.time
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'hover:bg-primary/10 hover:border-primary'
                                                        }`}
                                                >
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {slot.time}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedSlot && (
                                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                    <p className="text-sm font-medium text-primary">
                                        ✓ Selected: {selectedSlot.date} at {selectedSlot.time}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            disabled={!selectedSlot}
                            onClick={handleConfirmReschedule}
                        >
                            Confirm Reschedule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default Appointments;

