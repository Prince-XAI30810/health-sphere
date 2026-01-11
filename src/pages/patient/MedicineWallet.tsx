import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Pill,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Calendar,
    User,
    ChevronLeft,
    ChevronRight,
    Plus,
    AlertTriangle,
} from 'lucide-react';
import {
    getMedicineSchedules,
    getIntakeHistory,
    recordMedicineIntake,
    MedicineSchedule as MedicineScheduleData,
    MedicineIntakeRecord,
} from '@/data/medicineWallet';

// Helper to generate dates for the Gantt chart
const generateDateRange = (startDate: Date, days: number): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        dates.push(date);
    }
    return dates;
};

// Format date for display
const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format date for comparison
const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Get day name
const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Format time for display
const formatTime = (time: string): string => {
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

// Format time short (for Gantt cells)
const formatTimeShort = (time: string): string => {
    const [hour] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'P' : 'A';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${ampm}`;
};

interface DayIntakeStatus {
    date: string;
    medicineName: string;
    dosage: string;
    scheduledTimes: { time: string; status: 'taken' | 'missed' | 'pending' | 'upcoming'; actualTime?: string }[];
    missedCount: number;
    extraDosesRequired: number;
}

const MedicineSchedule: React.FC = () => {
    const [schedules, setSchedules] = useState<MedicineScheduleData[]>([]);
    const [intakeHistory, setIntakeHistory] = useState<MedicineIntakeRecord[]>([]);
    const [selectedDay, setSelectedDay] = useState<{ date: Date; schedule: MedicineScheduleData } | null>(null);
    const [weekOffset, setWeekOffset] = useState(0);

    const loadData = () => {
        setSchedules(getMedicineSchedules());
        setIntakeHistory(getIntakeHistory());
    };

    useEffect(() => {
        loadData();
    }, []);

    // Calculate total missed doses for a medicine
    const getMissedDosesCount = (schedule: MedicineScheduleData): number => {
        const today = new Date();
        const todayKey = formatDateKey(today);

        const missedRecords = intakeHistory.filter(
            r => r.scheduleId === schedule.id && r.status === 'missed'
        );

        return missedRecords.length;
    };

    // Calculate extra days needed to compensate for missed doses
    const getExtraDaysRequired = (schedule: MedicineScheduleData): number => {
        const missedCount = getMissedDosesCount(schedule);
        const dosesPerDay = schedule.scheduledTimes.length;
        return Math.ceil(missedCount / dosesPerDay);
    };

    // Calculate the date range for the Gantt chart (2 weeks view)
    const dateRange = useMemo(() => {
        const today = new Date();
        today.setDate(today.getDate() + weekOffset * 7);
        // Start from the beginning of the week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return generateDateRange(startOfWeek, 14); // 2 weeks
    }, [weekOffset]);

    // Get intake status for a specific medicine and date
    const getIntakeStatusForDay = (schedule: MedicineScheduleData, date: Date): 'taken' | 'missed' | 'pending' | 'upcoming' | 'partial' | 'not-scheduled' | 'extended' => {
        const dateKey = formatDateKey(date);
        const today = new Date();
        const todayKey = formatDateKey(today);

        // Check if date is within medicine schedule
        const startDate = new Date(schedule.startDate);
        const endDate = new Date(schedule.endDate);
        const extraDays = getExtraDaysRequired(schedule);
        const extendedEndDate = new Date(endDate);
        extendedEndDate.setDate(extendedEndDate.getDate() + extraDays);

        if (date < startDate) {
            return 'not-scheduled';
        }

        // Check if it's in the extended period
        if (date > endDate && date <= extendedEndDate) {
            if (dateKey > todayKey) {
                return 'extended';
            }
        }

        if (date > extendedEndDate) {
            return 'not-scheduled';
        }

        if (dateKey > todayKey) {
            return 'upcoming';
        }

        // Get all intakes for this medicine on this date
        const dayIntakes = intakeHistory.filter(
            r => r.scheduleId === schedule.id && r.date === dateKey
        );

        const totalDoses = schedule.scheduledTimes.length;
        const takenCount = dayIntakes.filter(r => r.status === 'taken').length;
        const missedCount = dayIntakes.filter(r => r.status === 'missed').length;

        if (dateKey === todayKey) {
            // For today, check current time
            const currentHour = today.getHours();
            const currentMinute = today.getMinutes();
            const currentTime = currentHour * 60 + currentMinute;

            const passedDoses = schedule.scheduledTimes.filter(time => {
                const [h, m] = time.split(':').map(Number);
                return h * 60 + m < currentTime - 60; // 1 hour grace period
            }).length;

            if (takenCount === totalDoses) return 'taken';
            if (passedDoses > takenCount) return 'partial';
            return 'pending';
        }

        // For past days
        if (takenCount === totalDoses) return 'taken';
        if (takenCount > 0 && takenCount < totalDoses) return 'partial';
        if (missedCount > 0 || takenCount === 0) return 'missed';

        return 'pending';
    };

    // Get detailed intake status for the popup
    const getDayDetailedStatus = (schedule: MedicineScheduleData, date: Date): DayIntakeStatus => {
        const dateKey = formatDateKey(date);
        const today = new Date();
        const todayKey = formatDateKey(today);
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;

        const dayIntakes = intakeHistory.filter(
            r => r.scheduleId === schedule.id && r.date === dateKey
        );

        const scheduledTimes = schedule.scheduledTimes.map(time => {
            const intake = dayIntakes.find(r => r.scheduledTime === time);
            const [h, m] = time.split(':').map(Number);
            const scheduledMinutes = h * 60 + m;

            let status: 'taken' | 'missed' | 'pending' | 'upcoming';

            if (intake) {
                status = intake.status === 'taken' ? 'taken' : 'missed';
            } else if (dateKey > todayKey) {
                status = 'upcoming';
            } else if (dateKey === todayKey) {
                if (scheduledMinutes > currentTime) {
                    status = 'upcoming';
                } else if (scheduledMinutes < currentTime - 60) {
                    status = 'missed';
                } else {
                    status = 'pending';
                }
            } else {
                status = 'missed';
            }

            return {
                time,
                status,
                actualTime: intake?.actualTime,
            };
        });

        const missedCount = getMissedDosesCount(schedule);
        const extraDosesRequired = getExtraDaysRequired(schedule);

        return {
            date: dateKey,
            medicineName: schedule.medication.name,
            dosage: schedule.medication.dosage,
            scheduledTimes,
            missedCount,
            extraDosesRequired,
        };
    };

    // Handle marking medicine as taken from the popup
    const handleMarkAsTaken = (scheduleId: string, medicineName: string, dosage: string, time: string) => {
        recordMedicineIntake(scheduleId, medicineName, dosage, time);
        loadData();
    };

    // Get status color for Gantt chart cell
    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'taken':
                return 'bg-emerald-500 hover:bg-emerald-600';
            case 'missed':
                return 'bg-red-500 hover:bg-red-600';
            case 'partial':
                return 'bg-amber-500 hover:bg-amber-600';
            case 'pending':
                return 'bg-blue-500 hover:bg-blue-600';
            case 'upcoming':
                return 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500';
            case 'extended':
                return 'bg-purple-500 hover:bg-purple-600 ring-2 ring-purple-300 ring-offset-1';
            default:
                return 'bg-transparent';
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'taken':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'missed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'upcoming':
                return <Calendar className="w-5 h-5 text-slate-400" />;
            default:
                return null;
        }
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return formatDateKey(date) === formatDateKey(today);
    };

    return (
        <DashboardLayout
            title="Medicine Schedule"
            subtitle="Track your prescribed medicines and medication timings"
        >
            <div className="space-y-6">
                {/* Legend */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-emerald-500"></div>
                                    <span className="text-sm text-muted-foreground">All Taken</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-amber-500"></div>
                                    <span className="text-sm text-muted-foreground">Partial</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-red-500"></div>
                                    <span className="text-sm text-muted-foreground">Missed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                                    <span className="text-sm text-muted-foreground">Pending</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-600"></div>
                                    <span className="text-sm text-muted-foreground">Upcoming</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-purple-500 ring-2 ring-purple-300"></div>
                                    <span className="text-sm text-muted-foreground">Extended (Missed Compensation)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setWeekOffset(prev => prev - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setWeekOffset(0)}
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setWeekOffset(prev => prev + 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Gantt Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Medicine Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {schedules.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Pill className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg">No active prescriptions</p>
                                <p className="text-sm mt-1">Your prescribed medicines will appear here</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <div className="min-w-[900px]">
                                    {/* Header Row with Dates */}
                                    <div className="flex border-b border-border">
                                        <div className="w-56 flex-shrink-0 p-3 font-medium text-muted-foreground">
                                            Medicine / Time
                                        </div>
                                        <div className="flex-1 flex">
                                            {dateRange.map((date, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex-1 p-2 text-center text-xs border-l border-border ${isToday(date) ? 'bg-primary/10' : ''
                                                        }`}
                                                >
                                                    <div className={`font-medium ${isToday(date) ? 'text-primary' : 'text-muted-foreground'}`}>
                                                        {getDayName(date)}
                                                    </div>
                                                    <div className={`text-xs ${isToday(date) ? 'text-primary font-bold' : ''}`}>
                                                        {formatDate(date)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Medicine Rows */}
                                    {schedules.map((schedule) => {
                                        const missedCount = getMissedDosesCount(schedule);
                                        const extraDays = getExtraDaysRequired(schedule);

                                        return (
                                            <div key={schedule.id} className="border-b border-border">
                                                {/* Medicine Header */}
                                                <div className="flex bg-muted/20">
                                                    <div className="w-56 flex-shrink-0 p-3">
                                                        <div className="font-medium text-foreground truncate flex items-center gap-2">
                                                            <Pill className="w-4 h-4 text-primary" />
                                                            {schedule.medication.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {schedule.medication.dosage} • {schedule.medication.frequency}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                            <User className="w-3 h-3" />
                                                            {schedule.doctor}
                                                        </div>
                                                        {missedCount > 0 && (
                                                            <div className="mt-2 flex items-center gap-1 text-xs">
                                                                <Badge variant="destructive" className="gap-1">
                                                                    <AlertTriangle className="w-3 h-3" />
                                                                    {missedCount} missed
                                                                </Badge>
                                                                <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                                                    <Plus className="w-3 h-3" />
                                                                    {extraDays} extra day(s)
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex">
                                                        {dateRange.map((date, idx) => {
                                                            const status = getIntakeStatusForDay(schedule, date);
                                                            const isScheduled = status !== 'not-scheduled';

                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={`flex-1 p-1 border-l border-border flex items-center justify-center ${isToday(date) ? 'bg-primary/5' : ''
                                                                        }`}
                                                                >
                                                                    {isScheduled && (
                                                                        <button
                                                                            onClick={() => setSelectedDay({ date, schedule })}
                                                                            className={`w-8 h-8 rounded-lg transition-all transform hover:scale-110 cursor-pointer ${getStatusColor(status)}`}
                                                                            title={`${formatDate(date)} - Click to view details`}
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Time Rows for each scheduled time */}
                                                {schedule.scheduledTimes.map((time, timeIdx) => (
                                                    <div key={timeIdx} className="flex hover:bg-muted/30 transition-colors">
                                                        <div className="w-56 flex-shrink-0 p-2 pl-8 text-sm text-muted-foreground flex items-center gap-2">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {formatTime(time)}
                                                        </div>
                                                        <div className="flex-1 flex">
                                                            {dateRange.map((date, idx) => {
                                                                const dateKey = formatDateKey(date);
                                                                const today = new Date();
                                                                const todayKey = formatDateKey(today);
                                                                const startDate = new Date(schedule.startDate);
                                                                const endDate = new Date(schedule.endDate);
                                                                const extraDays = getExtraDaysRequired(schedule);
                                                                const extendedEndDate = new Date(endDate);
                                                                extendedEndDate.setDate(extendedEndDate.getDate() + extraDays);

                                                                // Check if time slot is scheduled
                                                                if (date < startDate || date > extendedEndDate) {
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={`flex-1 p-1 border-l border-border ${isToday(date) ? 'bg-primary/5' : ''}`}
                                                                        />
                                                                    );
                                                                }

                                                                // Get status for this specific time slot
                                                                const intake = intakeHistory.find(
                                                                    r => r.scheduleId === schedule.id &&
                                                                        r.date === dateKey &&
                                                                        r.scheduledTime === time
                                                                );

                                                                const [h, m] = time.split(':').map(Number);
                                                                const scheduledMinutes = h * 60 + m;
                                                                const currentHour = today.getHours();
                                                                const currentMinute = today.getMinutes();
                                                                const currentTime = currentHour * 60 + currentMinute;

                                                                let timeStatus: 'taken' | 'missed' | 'pending' | 'upcoming' | 'extended';
                                                                const isExtended = date > endDate && date <= extendedEndDate;

                                                                if (intake) {
                                                                    timeStatus = intake.status === 'taken' ? 'taken' : 'missed';
                                                                } else if (dateKey > todayKey) {
                                                                    timeStatus = isExtended ? 'extended' : 'upcoming';
                                                                } else if (dateKey === todayKey) {
                                                                    if (scheduledMinutes > currentTime) {
                                                                        timeStatus = 'upcoming';
                                                                    } else if (scheduledMinutes < currentTime - 60) {
                                                                        timeStatus = 'missed';
                                                                    } else {
                                                                        timeStatus = 'pending';
                                                                    }
                                                                } else {
                                                                    timeStatus = 'missed';
                                                                }

                                                                const getTimeStatusColor = (status: string): string => {
                                                                    switch (status) {
                                                                        case 'taken':
                                                                            return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
                                                                        case 'missed':
                                                                            return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                                                                        case 'pending':
                                                                            return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
                                                                        case 'extended':
                                                                            return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300';
                                                                        default:
                                                                            return 'bg-slate-100 dark:bg-slate-800 text-slate-500';
                                                                    }
                                                                };

                                                                const getTimeStatusIcon = (status: string) => {
                                                                    switch (status) {
                                                                        case 'taken':
                                                                            return <CheckCircle2 className="w-3 h-3" />;
                                                                        case 'missed':
                                                                            return <XCircle className="w-3 h-3" />;
                                                                        case 'pending':
                                                                            return <Clock className="w-3 h-3" />;
                                                                        case 'extended':
                                                                            return <Plus className="w-3 h-3" />;
                                                                        default:
                                                                            return null;
                                                                    }
                                                                };

                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        className={`flex-1 p-0.5 border-l border-border flex items-center justify-center ${isToday(date) ? 'bg-primary/5' : ''
                                                                            }`}
                                                                    >
                                                                        <div
                                                                            className={`w-full h-6 rounded text-[10px] font-medium flex items-center justify-center gap-0.5 cursor-pointer transition-all hover:scale-105 ${getTimeStatusColor(timeStatus)}`}
                                                                            onClick={() => setSelectedDay({ date, schedule })}
                                                                            title={`${formatTime(time)} - ${timeStatus}`}
                                                                        >
                                                                            {getTimeStatusIcon(timeStatus)}
                                                                            <span>{formatTimeShort(time)}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-muted/30">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <h4 className="font-medium text-foreground">Missed Medicine Compensation</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    When you miss doses, the schedule automatically extends to compensate.
                                    Purple cells indicate extra days added to make up for missed medicines.
                                    Click on any cell to view details and mark medicines as taken.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Day Detail Dialog */}
            <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Pill className="w-5 h-5 text-primary" />
                                {selectedDay?.schedule.medication.name}
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedDay && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Date</span>
                                <span className="font-medium">
                                    {selectedDay.date.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Dosage</span>
                                <Badge variant="outline">{selectedDay.schedule.medication.dosage}</Badge>
                            </div>

                            {(() => {
                                const detailedStatus = getDayDetailedStatus(selectedDay.schedule, selectedDay.date);
                                return detailedStatus.missedCount > 0 ? (
                                    <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {detailedStatus.missedCount} doses missed overall
                                            </span>
                                        </div>
                                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                            Schedule extended by {detailedStatus.extraDosesRequired} day(s) to compensate
                                        </p>
                                    </div>
                                ) : null;
                            })()}

                            <div className="border-t pt-4">
                                <h4 className="text-sm font-medium mb-3">Scheduled Doses</h4>
                                <div className="space-y-3">
                                    {getDayDetailedStatus(selectedDay.schedule, selectedDay.date).scheduledTimes.map((dose, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center justify-between p-3 rounded-lg border ${dose.status === 'taken'
                                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                                : dose.status === 'missed'
                                                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                                    : dose.status === 'pending'
                                                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                                                        : 'bg-muted/30 border-border'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(dose.status)}
                                                <div>
                                                    <div className="font-medium">{formatTime(dose.time)}</div>
                                                    {dose.actualTime && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Taken at {formatTime(dose.actualTime)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {dose.status === 'taken' && (
                                                    <Badge variant="success">Taken</Badge>
                                                )}
                                                {dose.status === 'missed' && (
                                                    <Badge variant="destructive">Missed</Badge>
                                                )}
                                                {dose.status === 'pending' && (
                                                    <>
                                                        <Badge variant="warning">Pending</Badge>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                handleMarkAsTaken(
                                                                    selectedDay.schedule.id,
                                                                    selectedDay.schedule.medication.name,
                                                                    selectedDay.schedule.medication.dosage,
                                                                    dose.time
                                                                );
                                                            }}
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                                            Take
                                                        </Button>
                                                    </>
                                                )}
                                                {dose.status === 'upcoming' && (
                                                    <Badge variant="secondary">Upcoming</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedDay.schedule.medication.instructions && (
                                <div className="border-t pt-4">
                                    <div className="p-3 bg-muted/50 rounded-lg text-sm">
                                        <AlertCircle className="w-4 h-4 inline mr-2 text-primary" />
                                        {selectedDay.schedule.medication.instructions}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default MedicineSchedule;
