import { prescriptions, Medication, getActivePrescriptions } from './prescriptions';

// Types for Medicine Wallet
export interface MedicineSchedule {
    id: string;
    prescriptionId: number;
    medication: Medication;
    doctor: string;
    scheduledTimes: string[]; // e.g., ['08:00', '14:00', '20:00']
    startDate: string;
    endDate: string;
    daysRemaining: number;
}

export interface MedicineIntakeRecord {
    id: string;
    scheduleId: string;
    medicineName: string;
    dosage: string;
    scheduledTime: string;
    actualTime: string;
    date: string;
    status: 'taken' | 'missed' | 'skipped';
}

export interface TodayScheduleItem {
    scheduleId: string;
    medicineName: string;
    dosage: string;
    time: string;
    status: 'pending' | 'taken' | 'missed';
    intakeId?: string;
}

// Helper to parse frequency to scheduled times
const parseFrequencyToTimes = (frequency: string): string[] => {
    const freq = frequency.toLowerCase();
    if (freq.includes('3 times')) return ['08:00', '14:00', '20:00'];
    if (freq.includes('2 times')) return ['08:00', '20:00'];
    if (freq.includes('once') || freq.includes('1 time')) {
        if (freq.includes('night') || freq.includes('bedtime')) return ['22:00'];
        if (freq.includes('morning') || freq.includes('breakfast')) return ['08:00'];
        return ['09:00'];
    }
    if (freq.includes('as needed')) return ['08:00', '14:00', '20:00'];
    return ['09:00'];
};

// Helper to parse duration to days
const parseDurationToDays = (duration: string): number => {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 7;
};

// Generate medicine schedules from active prescriptions
export const getMedicineSchedules = (): MedicineSchedule[] => {
    const activePrescriptions = getActivePrescriptions();
    const schedules: MedicineSchedule[] = [];

    activePrescriptions.forEach(prescription => {
        prescription.medications.forEach((medication, idx) => {
            const durationDays = parseDurationToDays(medication.duration);
            const startDate = new Date(prescription.date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + durationDays);

            const today = new Date();
            const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

            schedules.push({
                id: `${prescription.id}-${idx}`,
                prescriptionId: prescription.id,
                medication,
                doctor: prescription.doctor,
                scheduledTimes: parseFrequencyToTimes(medication.frequency),
                startDate: prescription.date,
                endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                daysRemaining,
            });
        });
    });

    return schedules;
};

// In-memory storage for intake records (simulating a database)
let intakeRecords: MedicineIntakeRecord[] = [
    // Sample past records
    {
        id: 'intake-1',
        scheduleId: '2-0',
        medicineName: 'Atorvastatin',
        dosage: '20 mg',
        scheduledTime: '20:00',
        actualTime: '20:15',
        date: '2026-01-10',
        status: 'taken',
    },
    {
        id: 'intake-2',
        scheduleId: '6-0',
        medicineName: 'Amoxicillin',
        dosage: '500 mg',
        scheduledTime: '08:00',
        actualTime: '08:30',
        date: '2026-01-10',
        status: 'taken',
    },
    {
        id: 'intake-3',
        scheduleId: '6-0',
        medicineName: 'Amoxicillin',
        dosage: '500 mg',
        scheduledTime: '14:00',
        actualTime: '14:10',
        date: '2026-01-10',
        status: 'taken',
    },
    {
        id: 'intake-4',
        scheduleId: '6-0',
        medicineName: 'Amoxicillin',
        dosage: '500 mg',
        scheduledTime: '20:00',
        actualTime: '',
        date: '2026-01-10',
        status: 'missed',
    },
    {
        id: 'intake-5',
        scheduleId: '2-0',
        medicineName: 'Atorvastatin',
        dosage: '20 mg',
        scheduledTime: '20:00',
        actualTime: '20:05',
        date: '2026-01-09',
        status: 'taken',
    },
];

// Record a new medicine intake
export const recordMedicineIntake = (
    scheduleId: string,
    medicineName: string,
    dosage: string,
    scheduledTime: string
): MedicineIntakeRecord => {
    const now = new Date();
    const record: MedicineIntakeRecord = {
        id: `intake-${Date.now()}`,
        scheduleId,
        medicineName,
        dosage,
        scheduledTime,
        actualTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        date: now.toISOString().split('T')[0],
        status: 'taken',
    };

    intakeRecords = [record, ...intakeRecords];
    return record;
};

// Get intake history
export const getIntakeHistory = (): MedicineIntakeRecord[] => {
    return intakeRecords.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.actualTime || a.scheduledTime}`);
        const dateB = new Date(`${b.date} ${b.actualTime || b.scheduledTime}`);
        return dateB.getTime() - dateA.getTime();
    });
};

// Get today's schedule with status
export const getTodaySchedule = (): TodayScheduleItem[] => {
    const schedules = getMedicineSchedules();
    const today = new Date().toISOString().split('T')[0];
    const todayIntakes = intakeRecords.filter(r => r.date === today);
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const items: TodayScheduleItem[] = [];

    schedules.forEach(schedule => {
        schedule.scheduledTimes.forEach(time => {
            const [hour, minute] = time.split(':').map(Number);
            const scheduledMinutes = hour * 60 + minute;

            // Check if already taken
            const intake = todayIntakes.find(
                r => r.scheduleId === schedule.id && r.scheduledTime === time
            );

            let status: 'pending' | 'taken' | 'missed' = 'pending';
            if (intake) {
                status = intake.status === 'taken' ? 'taken' : 'missed';
            } else if (scheduledMinutes < currentTime - 60) {
                // Missed if more than 1 hour past scheduled time
                status = 'missed';
            }

            items.push({
                scheduleId: schedule.id,
                medicineName: schedule.medication.name,
                dosage: schedule.medication.dosage,
                time,
                status,
                intakeId: intake?.id,
            });
        });
    });

    return items.sort((a, b) => a.time.localeCompare(b.time));
};

// Calculate compliance stats
export const getComplianceStats = () => {
    const last7Days = intakeRecords.filter(r => {
        const recordDate = new Date(r.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return recordDate >= weekAgo;
    });

    const taken = last7Days.filter(r => r.status === 'taken').length;
    const total = last7Days.length;
    const complianceRate = total > 0 ? Math.round((taken / total) * 100) : 100;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        const dayRecords = intakeRecords.filter(r => r.date === dateStr);

        if (dayRecords.length === 0 && i > 0) break;
        if (dayRecords.some(r => r.status === 'missed')) break;
        if (dayRecords.length > 0) streak++;
    }

    const todaySchedule = getTodaySchedule();
    const todayTaken = todaySchedule.filter(s => s.status === 'taken').length;
    const todayTotal = todaySchedule.length;

    return {
        complianceRate,
        streak,
        todayProgress: { taken: todayTaken, total: todayTotal },
        totalRecords: intakeRecords.length,
    };
};
