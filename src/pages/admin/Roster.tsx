import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    AlertTriangle,
    Lightbulb,
    TrendingUp,
    Users,
    Clock,
    UserCog,
    Stethoscope,
    HeartPulse,
    Plus,
    Trash2,
    Edit3,
    Check,
    X,
    Bell,
    Send,
    Mail,
} from 'lucide-react';

// Types
interface StaffMember {
    id: string;
    name: string;
    role: 'doctor' | 'nurse';
    department: string;
    avatar: string;
    specialization?: string;
    email?: string;
    phone?: string;
}

interface Shift {
    id: string;
    staffId: string;
    day: number; // 0-6 (Sunday-Saturday)
    startHour: number;
    endHour: number;
    type: 'morning' | 'afternoon' | 'night' | 'on-call';
}

interface AIRecommendation {
    id: string;
    type: 'warning' | 'suggestion' | 'critical' | 'insight';
    title: string;
    description: string;
    action?: string;
    actionType?: 'add-shift' | 'remove-shift' | 'swap-shift' | 'reassign';
    affectedStaffIds?: string[];
    suggestedShift?: Partial<Shift>;
}

interface Notification {
    id: string;
    staffId: string;
    message: string;
    type: 'shift-added' | 'shift-removed' | 'shift-changed';
    timestamp: Date;
    read: boolean;
}

// Mock Data
const staffMembers: StaffMember[] = [
    { id: '1', name: 'Dr. Anil Sharma', role: 'doctor', department: 'ICU', avatar: 'AS', specialization: 'Critical Care', email: 'anil.sharma@hospital.com', phone: '+91 98765 43210' },
    { id: '2', name: 'Dr. Priya Patel', role: 'doctor', department: 'Emergency', avatar: 'PP', specialization: 'Emergency Medicine', email: 'priya.patel@hospital.com', phone: '+91 98765 43211' },
    { id: '3', name: 'Dr. Rajesh Kumar', role: 'doctor', department: 'General', avatar: 'RK', specialization: 'Internal Medicine', email: 'rajesh.kumar@hospital.com', phone: '+91 98765 43212' },
    { id: '4', name: 'Dr. Neha Gupta', role: 'doctor', department: 'Pediatrics', avatar: 'NG', specialization: 'Pediatrics', email: 'neha.gupta@hospital.com', phone: '+91 98765 43213' },
    { id: '5', name: 'Nurse Sunita Devi', role: 'nurse', department: 'ICU', avatar: 'SD', email: 'sunita.devi@hospital.com', phone: '+91 98765 43214' },
    { id: '6', name: 'Nurse Amit Singh', role: 'nurse', department: 'Emergency', avatar: 'AS', email: 'amit.singh@hospital.com', phone: '+91 98765 43215' },
    { id: '7', name: 'Nurse Kavita Rao', role: 'nurse', department: 'General', avatar: 'KR', email: 'kavita.rao@hospital.com', phone: '+91 98765 43216' },
    { id: '8', name: 'Nurse Deepak Verma', role: 'nurse', department: 'ICU', avatar: 'DV', email: 'deepak.verma@hospital.com', phone: '+91 98765 43217' },
    { id: '9', name: 'Nurse Pooja Sharma', role: 'nurse', department: 'Pediatrics', avatar: 'PS', email: 'pooja.sharma@hospital.com', phone: '+91 98765 43218' },
    { id: '10', name: 'Dr. Vikram Mehta', role: 'doctor', department: 'ICU', avatar: 'VM', specialization: 'Anesthesiology', email: 'vikram.mehta@hospital.com', phone: '+91 98765 43219' },
];

const initialShifts: Shift[] = [
    // Dr. Anil Sharma
    { id: 's1', staffId: '1', day: 0, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's2', staffId: '1', day: 1, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's3', staffId: '1', day: 2, startHour: 16, endHour: 24, type: 'afternoon' },
    { id: 's4', staffId: '1', day: 4, startHour: 0, endHour: 8, type: 'night' },
    { id: 's5', staffId: '1', day: 5, startHour: 8, endHour: 16, type: 'morning' },
    // Dr. Priya Patel
    { id: 's6', staffId: '2', day: 0, startHour: 16, endHour: 24, type: 'afternoon' },
    { id: 's7', staffId: '2', day: 1, startHour: 0, endHour: 8, type: 'night' },
    { id: 's8', staffId: '2', day: 2, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's9', staffId: '2', day: 3, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's10', staffId: '2', day: 5, startHour: 16, endHour: 24, type: 'afternoon' },
    { id: 's11', staffId: '2', day: 6, startHour: 8, endHour: 20, type: 'on-call' },
    // Dr. Rajesh Kumar
    { id: 's12', staffId: '3', day: 1, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's13', staffId: '3', day: 2, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's14', staffId: '3', day: 3, startHour: 16, endHour: 24, type: 'afternoon' },
    { id: 's15', staffId: '3', day: 4, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's16', staffId: '3', day: 5, startHour: 8, endHour: 16, type: 'morning' },
    // Dr. Neha Gupta
    { id: 's17', staffId: '4', day: 0, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's18', staffId: '4', day: 1, startHour: 16, endHour: 24, type: 'afternoon' },
    { id: 's19', staffId: '4', day: 3, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's20', staffId: '4', day: 4, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's21', staffId: '4', day: 6, startHour: 8, endHour: 20, type: 'on-call' },
    // Nurse Sunita Devi
    { id: 's22', staffId: '5', day: 0, startHour: 0, endHour: 8, type: 'night' },
    { id: 's23', staffId: '5', day: 1, startHour: 0, endHour: 8, type: 'night' },
    { id: 's24', staffId: '5', day: 2, startHour: 16, endHour: 24, type: 'afternoon' },
    { id: 's25', staffId: '5', day: 3, startHour: 16, endHour: 24, type: 'afternoon' },
    { id: 's26', staffId: '5', day: 5, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's27', staffId: '5', day: 6, startHour: 8, endHour: 16, type: 'morning' },
    // Nurse Amit Singh
    { id: 's28', staffId: '6', day: 0, startHour: 16, endHour: 24, type: 'afternoon' },
    { id: 's29', staffId: '6', day: 1, startHour: 16, endHour: 24, type: 'afternoon' },
    { id: 's30', staffId: '6', day: 2, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's31', staffId: '6', day: 3, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's32', staffId: '6', day: 4, startHour: 0, endHour: 8, type: 'night' },
    { id: 's33', staffId: '6', day: 5, startHour: 0, endHour: 8, type: 'night' },
    // Nurse Kavita Rao
    { id: 's34', staffId: '7', day: 0, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's35', staffId: '7', day: 1, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's36', staffId: '7', day: 2, startHour: 0, endHour: 8, type: 'night' },
    { id: 's37', staffId: '7', day: 4, startHour: 16, endHour: 24, type: 'afternoon' },
    { id: 's38', staffId: '7', day: 5, startHour: 16, endHour: 24, type: 'afternoon' },
    { id: 's39', staffId: '7', day: 6, startHour: 8, endHour: 16, type: 'morning' },
    // Nurse Deepak Verma
    { id: 's40', staffId: '8', day: 0, startHour: 0, endHour: 8, type: 'night' },
    { id: 's41', staffId: '8', day: 2, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's42', staffId: '8', day: 3, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's43', staffId: '8', day: 4, startHour: 16, endHour: 24, type: 'afternoon' },
    { id: 's44', staffId: '8', day: 5, startHour: 16, endHour: 24, type: 'afternoon' },
    // Nurse Pooja Sharma
    { id: 's45', staffId: '9', day: 1, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's46', staffId: '9', day: 2, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's47', staffId: '9', day: 3, startHour: 0, endHour: 8, type: 'night' },
    { id: 's48', staffId: '9', day: 4, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's49', staffId: '9', day: 6, startHour: 16, endHour: 24, type: 'afternoon' },
    // Dr. Vikram Mehta
    { id: 's50', staffId: '10', day: 0, startHour: 8, endHour: 20, type: 'on-call' },
    { id: 's51', staffId: '10', day: 2, startHour: 0, endHour: 8, type: 'night' },
    { id: 's52', staffId: '10', day: 3, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's53', staffId: '10', day: 4, startHour: 8, endHour: 16, type: 'morning' },
    { id: 's54', staffId: '10', day: 5, startHour: 16, endHour: 24, type: 'afternoon' },
];

const initialRecommendations: AIRecommendation[] = [
    {
        id: 'r1',
        type: 'critical',
        title: 'ICU Understaffed Tonight',
        description: 'Only 1 nurse scheduled for ICU night shift on Wednesday. Patient-to-nurse ratio will exceed safe limits.',
        action: 'Assign additional nurse to ICU night shift',
        actionType: 'add-shift',
        affectedStaffIds: ['8'],
        suggestedShift: { staffId: '8', day: 3, startHour: 0, endHour: 8, type: 'night' },
    },
    {
        id: 'r2',
        type: 'warning',
        title: 'Dr. Priya Patel Overtime Alert',
        description: 'Dr. Patel is scheduled for 52 hours this week, exceeding the recommended 48-hour limit.',
        action: 'Remove Sunday on-call shift',
        actionType: 'remove-shift',
        affectedStaffIds: ['2'],
    },
    {
        id: 'r3',
        type: 'suggestion',
        title: 'Optimal Shift Swap Available',
        description: 'Nurse Amit Singh and Nurse Kavita Rao can swap Thursday shifts for better work-life balance without affecting coverage.',
        action: 'Apply shift swap',
        actionType: 'swap-shift',
        affectedStaffIds: ['6', '7'],
    },
    {
        id: 'r4',
        type: 'insight',
        title: 'Emergency Dept Peak Hours',
        description: 'Historical data shows 40% higher patient volume on Saturday evenings. Current staffing is adequate but monitoring recommended.',
    },
    {
        id: 'r5',
        type: 'warning',
        title: 'Pediatrics Coverage Gap',
        description: 'No pediatric specialist scheduled for Tuesday afternoon. Dr. Neha Gupta is the only available resource.',
        action: 'Add Dr. Gupta to Tuesday afternoon',
        actionType: 'add-shift',
        affectedStaffIds: ['4'],
        suggestedShift: { staffId: '4', day: 2, startHour: 16, endHour: 24, type: 'afternoon' },
    },
];

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const departments = ['All', 'ICU', 'Emergency', 'General', 'Pediatrics'];

const shiftColors: Record<Shift['type'], { bg: string; border: string; text: string }> = {
    morning: { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-700' },
    afternoon: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700' },
    night: { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-700' },
    'on-call': { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-700' },
};

const shiftLabels: Record<Shift['type'], string> = {
    morning: 'Morning (8AM-4PM)',
    afternoon: 'Afternoon (4PM-12AM)',
    night: 'Night (12AM-8AM)',
    'on-call': 'On-Call',
};

const shiftPresets: Record<Shift['type'], { startHour: number; endHour: number }> = {
    morning: { startHour: 8, endHour: 16 },
    afternoon: { startHour: 16, endHour: 24 },
    night: { startHour: 0, endHour: 8 },
    'on-call': { startHour: 8, endHour: 20 },
};

export const Roster: React.FC = () => {
    const [staffFilter, setStaffFilter] = useState<'all' | 'doctor' | 'nurse'>('all');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [weekOffset, setWeekOffset] = useState(0);
    const [shifts, setShifts] = useState<Shift[]>(initialShifts);
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>(initialRecommendations);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);

    // Shift editing states
    const [shiftEditDialogOpen, setShiftEditDialogOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [selectedDay, setSelectedDay] = useState<number>(0);
    const [selectedShiftType, setSelectedShiftType] = useState<Shift['type']>('morning');
    const [sendNotification, setSendNotification] = useState(true);

    // Get current week dates
    const getWeekDates = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

        return days.map((_, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            return date;
        });
    };

    const weekDates = getWeekDates();

    // Filter staff
    const filteredStaff = staffMembers.filter((staff) => {
        const matchesRole = staffFilter === 'all' || staff.role === staffFilter;
        const matchesDept = departmentFilter === 'All' || staff.department === departmentFilter;
        return matchesRole && matchesDept;
    });

    // Get shifts for a staff member on a specific day
    const getShiftsForStaffDay = (staffId: string, day: number) => {
        return shifts.filter((shift) => shift.staffId === staffId && shift.day === day);
    };

    // Send notification to staff
    const sendStaffNotification = (staffId: string, message: string, type: Notification['type']) => {
        const staff = staffMembers.find(s => s.id === staffId);
        if (!staff) return;

        const newNotification: Notification = {
            id: `n${Date.now()}`,
            staffId,
            message,
            type,
            timestamp: new Date(),
            read: false,
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Show toast with notification sent confirmation
        toast.success('Notification Sent', {
            description: (
                <div className="flex flex-col gap-1">
                    <span className="font-medium">{staff.name}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {staff.email}
                    </span>
                    <span className="text-xs mt-1">{message}</span>
                </div>
            ),
            icon: <Bell className="w-4 h-4" />,
        });
    };

    // Handle clicking on an empty cell to add shift
    const handleAddShiftClick = (staffId: string, day: number) => {
        setEditMode('add');
        setSelectedStaffId(staffId);
        setSelectedDay(day);
        setSelectedShiftType('morning');
        setEditingShift(null);
        setSendNotification(true);
        setShiftEditDialogOpen(true);
    };

    // Handle clicking on existing shift to edit
    const handleEditShiftClick = (shift: Shift) => {
        setEditMode('edit');
        setEditingShift(shift);
        setSelectedStaffId(shift.staffId);
        setSelectedDay(shift.day);
        setSelectedShiftType(shift.type);
        setSendNotification(true);
        setShiftEditDialogOpen(true);
    };

    // Save shift (add or edit)
    const handleSaveShift = () => {
        const staff = staffMembers.find(s => s.id === selectedStaffId);
        const preset = shiftPresets[selectedShiftType];

        if (editMode === 'add') {
            const newShift: Shift = {
                id: `s${Date.now()}`,
                staffId: selectedStaffId,
                day: selectedDay,
                startHour: preset.startHour,
                endHour: preset.endHour,
                type: selectedShiftType,
            };
            setShifts(prev => [...prev, newShift]);

            if (sendNotification && staff) {
                sendStaffNotification(
                    selectedStaffId,
                    `New ${selectedShiftType} shift assigned for ${days[selectedDay]}`,
                    'shift-added'
                );
            }

            toast.success('Shift Added', {
                description: `${shiftLabels[selectedShiftType]} shift added for ${staff?.name} on ${days[selectedDay]}`,
            });
        } else if (editingShift) {
            setShifts(prev => prev.map(s =>
                s.id === editingShift.id
                    ? { ...s, type: selectedShiftType, startHour: preset.startHour, endHour: preset.endHour }
                    : s
            ));

            if (sendNotification && staff) {
                sendStaffNotification(
                    selectedStaffId,
                    `Your ${days[selectedDay]} shift has been updated to ${selectedShiftType}`,
                    'shift-changed'
                );
            }

            toast.success('Shift Updated', {
                description: `Shift updated to ${shiftLabels[selectedShiftType]} for ${staff?.name}`,
            });
        }

        setShiftEditDialogOpen(false);
    };

    // Delete shift
    const handleDeleteShift = () => {
        if (!editingShift) return;

        const staff = staffMembers.find(s => s.id === editingShift.staffId);
        setShifts(prev => prev.filter(s => s.id !== editingShift.id));

        if (sendNotification && staff) {
            sendStaffNotification(
                editingShift.staffId,
                `Your ${editingShift.type} shift on ${days[editingShift.day]} has been cancelled`,
                'shift-removed'
            );
        }

        toast.success('Shift Removed', {
            description: `${shiftLabels[editingShift.type]} shift removed for ${staff?.name}`,
        });

        setShiftEditDialogOpen(false);
    };

    // Handle AI recommendation action
    const handleApplyRecommendation = (rec: AIRecommendation) => {
        setSelectedRecommendation(rec);
        setEditDialogOpen(true);
    };

    // Apply the recommendation changes
    const confirmApplyRecommendation = () => {
        if (!selectedRecommendation) return;

        let newShifts = [...shifts];
        let toastMessage = '';
        const affectedStaff: string[] = [];

        switch (selectedRecommendation.actionType) {
            case 'add-shift':
                if (selectedRecommendation.suggestedShift) {
                    const newShift: Shift = {
                        id: `s${Date.now()}`,
                        staffId: selectedRecommendation.suggestedShift.staffId!,
                        day: selectedRecommendation.suggestedShift.day!,
                        startHour: selectedRecommendation.suggestedShift.startHour!,
                        endHour: selectedRecommendation.suggestedShift.endHour!,
                        type: selectedRecommendation.suggestedShift.type!,
                    };
                    newShifts.push(newShift);
                    const staffName = staffMembers.find(s => s.id === newShift.staffId)?.name;
                    toastMessage = `Added ${shiftLabels[newShift.type]} shift for ${staffName} on ${days[newShift.day]}`;
                    affectedStaff.push(newShift.staffId);

                    // Send notification
                    sendStaffNotification(
                        newShift.staffId,
                        `New ${newShift.type} shift assigned for ${days[newShift.day]} (AI Recommendation)`,
                        'shift-added'
                    );
                }
                break;

            case 'remove-shift':
                if (selectedRecommendation.id === 'r2') {
                    newShifts = newShifts.filter(s => !(s.staffId === '2' && s.day === 6 && s.type === 'on-call'));
                    toastMessage = 'Removed Dr. Priya Patel\'s Sunday on-call shift';
                    affectedStaff.push('2');

                    sendStaffNotification(
                        '2',
                        'Your Sunday on-call shift has been removed to prevent overtime (AI Recommendation)',
                        'shift-removed'
                    );
                }
                break;

            case 'swap-shift':
                if (selectedRecommendation.id === 'r3') {
                    newShifts = newShifts.map(s => {
                        if (s.staffId === '6' && s.day === 4) {
                            return { ...s, staffId: '7' };
                        }
                        if (s.staffId === '7' && s.day === 4) {
                            return { ...s, staffId: '6' };
                        }
                        return s;
                    });
                    toastMessage = 'Swapped Thursday shifts between Nurse Amit Singh and Nurse Kavita Rao';
                    affectedStaff.push('6', '7');

                    sendStaffNotification(
                        '6',
                        'Your Thursday shift has been swapped with Nurse Kavita Rao (AI Recommendation)',
                        'shift-changed'
                    );
                    sendStaffNotification(
                        '7',
                        'Your Thursday shift has been swapped with Nurse Amit Singh (AI Recommendation)',
                        'shift-changed'
                    );
                }
                break;
        }

        setShifts(newShifts);
        setRecommendations(recs => recs.filter(r => r.id !== selectedRecommendation.id));
        setEditDialogOpen(false);
        setSelectedRecommendation(null);

        toast.success('Roster Updated', {
            description: toastMessage,
        });
    };

    const getRecommendationIcon = (type: AIRecommendation['type']) => {
        switch (type) {
            case 'critical':
                return <AlertTriangle className="w-4 h-4 text-destructive" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-warning" />;
            case 'suggestion':
                return <Lightbulb className="w-4 h-4 text-emerald-500" />;
            case 'insight':
                return <TrendingUp className="w-4 h-4 text-blue-500" />;
        }
    };

    const getRecommendationBadge = (type: AIRecommendation['type']) => {
        switch (type) {
            case 'critical':
                return <Badge variant="destructive">Critical</Badge>;
            case 'warning':
                return <Badge variant="warning">Warning</Badge>;
            case 'suggestion':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Suggestion</Badge>;
            case 'insight':
                return <Badge variant="secondary">Insight</Badge>;
        }
    };

    const getActionIcon = (actionType?: AIRecommendation['actionType']) => {
        switch (actionType) {
            case 'add-shift':
                return <Plus className="w-3 h-3 mr-1" />;
            case 'remove-shift':
                return <Trash2 className="w-3 h-3 mr-1" />;
            case 'swap-shift':
                return <Edit3 className="w-3 h-3 mr-1" />;
            default:
                return null;
        }
    };

    const getAffectedStaffNames = (staffIds?: string[]) => {
        if (!staffIds) return '';
        return staffIds.map(id => staffMembers.find(s => s.id === id)?.name).filter(Boolean).join(', ');
    };

    return (
        <DashboardLayout
            title="Staff Roster"
            subtitle="Weekly schedule for doctors and nurses"
        >
            {/* AI Recommendation Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-500" />
                            Apply AI Recommendation
                        </DialogTitle>
                        <DialogDescription>
                            Review the proposed changes before applying them to the roster.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRecommendation && (
                        <div className="py-4">
                            <div className={`p-4 rounded-lg border ${selectedRecommendation.type === 'critical' ? 'border-destructive/50 bg-destructive/5' :
                                selectedRecommendation.type === 'warning' ? 'border-warning/50 bg-warning/5' :
                                    'border-border bg-muted/50'
                                }`}>
                                <div className="flex items-start gap-3 mb-3">
                                    {getRecommendationIcon(selectedRecommendation.type)}
                                    <div>
                                        <h4 className="font-semibold text-sm">{selectedRecommendation.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{selectedRecommendation.description}</p>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-background rounded-md border">
                                    <h5 className="text-xs font-medium text-muted-foreground mb-2">Proposed Changes:</h5>
                                    <div className="space-y-2">
                                        {selectedRecommendation.actionType === 'add-shift' && selectedRecommendation.suggestedShift && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Plus className="w-4 h-4 text-emerald-500" />
                                                <span>Add <strong>{shiftLabels[selectedRecommendation.suggestedShift.type!]}</strong> shift on <strong>{days[selectedRecommendation.suggestedShift.day!]}</strong> for <strong>{getAffectedStaffNames(selectedRecommendation.affectedStaffIds)}</strong></span>
                                            </div>
                                        )}
                                        {selectedRecommendation.actionType === 'remove-shift' && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                                <span>Remove on-call shift from <strong>{getAffectedStaffNames(selectedRecommendation.affectedStaffIds)}</strong></span>
                                            </div>
                                        )}
                                        {selectedRecommendation.actionType === 'swap-shift' && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Edit3 className="w-4 h-4 text-blue-500" />
                                                <span>Swap Thursday shifts between <strong>{getAffectedStaffNames(selectedRecommendation.affectedStaffIds)}</strong></span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Bell className="w-3 h-3" />
                                    <span>Affected staff will be notified automatically</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button onClick={confirmApplyRecommendation} className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                            <Check className="w-4 h-4 mr-2" />
                            Apply & Notify
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Shift Edit Dialog */}
            <Dialog open={shiftEditDialogOpen} onOpenChange={setShiftEditDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {editMode === 'add' ? (
                                <>
                                    <Plus className="w-5 h-5 text-emerald-500" />
                                    Add Shift
                                </>
                            ) : (
                                <>
                                    <Edit3 className="w-5 h-5 text-blue-500" />
                                    Edit Shift
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {editMode === 'add'
                                ? `Add a new shift for ${staffMembers.find(s => s.id === selectedStaffId)?.name} on ${days[selectedDay]}`
                                : `Edit shift for ${staffMembers.find(s => s.id === selectedStaffId)?.name} on ${days[selectedDay]}`
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Shift Type</Label>
                            <Select value={selectedShiftType} onValueChange={(v) => setSelectedShiftType(v as Shift['type'])}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(shiftLabels).map(([type, label]) => (
                                        <SelectItem key={type} value={type}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded ${shiftColors[type as Shift['type']].bg} ${shiftColors[type as Shift['type']].border} border`} />
                                                {label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                            <input
                                type="checkbox"
                                id="sendNotification"
                                checked={sendNotification}
                                onChange={(e) => setSendNotification(e.target.checked)}
                                className="w-4 h-4 rounded border-border"
                            />
                            <Label htmlFor="sendNotification" className="flex items-center gap-2 cursor-pointer">
                                <Bell className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">Notify staff member</span>
                            </Label>
                        </div>

                        {sendNotification && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2 px-1">
                                <Send className="w-3 h-3" />
                                Notification will be sent to {staffMembers.find(s => s.id === selectedStaffId)?.email}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        {editMode === 'edit' && (
                            <Button variant="destructive" onClick={handleDeleteShift} className="mr-auto">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setShiftEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveShift} className="bg-gradient-to-r from-primary to-blue-600">
                            <Check className="w-4 h-4 mr-2" />
                            {editMode === 'add' ? 'Add Shift' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    {/* Week Navigation */}
                    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setWeekOffset((prev) => prev - 1)}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium px-2 min-w-[180px] text-center">
                            {weekDates[0].toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} -{' '}
                            {weekDates[6].toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setWeekOffset((prev) => prev + 1)}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {weekOffset !== 0 && (
                        <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
                            Today
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Notifications Badge */}
                    {notifications.length > 0 && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="relative">
                                    <Bell className="w-4 h-4 mr-2" />
                                    Sent Notifications
                                    <Badge className="ml-2 h-5 px-1.5" variant="secondary">
                                        {notifications.length}
                                    </Badge>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="end">
                                <div className="p-3 border-b border-border">
                                    <h4 className="font-semibold text-sm">Recent Notifications</h4>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.slice(0, 5).map((notif) => {
                                        const staff = staffMembers.find(s => s.id === notif.staffId);
                                        return (
                                            <div key={notif.id} className="p-3 border-b border-border last:border-0 hover:bg-muted/50">
                                                <div className="flex items-start gap-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold ${staff?.role === 'doctor' ? 'bg-primary' : 'bg-secondary'}`}>
                                                        {staff?.avatar}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium">{staff?.name}</p>
                                                        <p className="text-xs text-muted-foreground">{notif.message}</p>
                                                        <p className="text-[10px] text-muted-foreground mt-1">
                                                            {notif.timestamp.toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}

                    {/* Staff Type Filter */}
                    <Select value={staffFilter} onValueChange={(v) => setStaffFilter(v as 'all' | 'doctor' | 'nurse')}>
                        <SelectTrigger className="w-[140px]">
                            <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Staff</SelectItem>
                            <SelectItem value="doctor">Doctors</SelectItem>
                            <SelectItem value="nurse">Nurses</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Department Filter */}
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-[150px]">
                            <HeartPulse className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                    {dept}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Gantt Chart */}
                <div className="xl:col-span-3 card-elevated overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="text-left p-3 border-b border-border font-semibold text-sm text-foreground w-[200px] sticky left-0 bg-muted/50 z-10">
                                        Staff Member
                                    </th>
                                    {days.map((day, index) => {
                                        const date = weekDates[index];
                                        const isToday = date.toDateString() === new Date().toDateString();
                                        return (
                                            <th
                                                key={day}
                                                className={`text-center p-3 border-b border-border font-medium text-sm min-w-[100px] ${isToday ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                                                    }`}
                                            >
                                                <div className="font-semibold">{day}</div>
                                                <div className="text-xs">{date.getDate()}</div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.map((staff, staffIndex) => (
                                    <tr
                                        key={staff.id}
                                        className={`hover:bg-muted/30 transition-colors ${staffIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                                            }`}
                                    >
                                        <td className="p-3 border-b border-border sticky left-0 bg-inherit z-10">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm ${staff.role === 'doctor'
                                                        ? 'bg-gradient-to-br from-primary to-blue-600'
                                                        : 'bg-gradient-to-br from-secondary to-emerald-600'
                                                        }`}
                                                >
                                                    {staff.avatar}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm text-foreground flex items-center gap-2">
                                                        {staff.name}
                                                        {staff.role === 'doctor' ? (
                                                            <Stethoscope className="w-3 h-3 text-primary" />
                                                        ) : (
                                                            <UserCog className="w-3 h-3 text-secondary" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{staff.department}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {days.map((_, dayIndex) => {
                                            const dayShifts = getShiftsForStaffDay(staff.id, dayIndex);
                                            const isToday = weekDates[dayIndex].toDateString() === new Date().toDateString();

                                            return (
                                                <td
                                                    key={dayIndex}
                                                    className={`p-2 border-b border-border text-center ${isToday ? 'bg-primary/5' : ''}`}
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        {dayShifts.length > 0 ? (
                                                            dayShifts.map((shift) => {
                                                                const colors = shiftColors[shift.type];
                                                                return (
                                                                    <button
                                                                        key={shift.id}
                                                                        onClick={() => handleEditShiftClick(shift)}
                                                                        className={`w-full px-2 py-1.5 rounded-md border ${colors.bg} ${colors.border} ${colors.text} text-xs font-medium transition-all hover:shadow-md hover:scale-105 cursor-pointer group relative`}
                                                                    >
                                                                        {shift.type === 'on-call' ? 'On-Call' : `${shift.startHour}:00-${shift.endHour}:00`}
                                                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Edit3 className="w-2 h-2" />
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAddShiftClick(staff.id, dayIndex)}
                                                                className="w-full px-2 py-1.5 rounded-md border border-dashed border-muted-foreground/30 text-muted-foreground/50 text-xs transition-all hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer group"
                                                            >
                                                                <Plus className="w-3 h-3 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-between gap-4 p-4 border-t border-border bg-muted/30">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-muted-foreground">Shift Types:</span>
                            {Object.entries(shiftColors).map(([type, colors]) => (
                                <div key={type} className="flex items-center gap-1.5">
                                    <div className={`w-3 h-3 rounded ${colors.bg} ${colors.border} border`} />
                                    <span className="text-xs text-muted-foreground capitalize">{type.replace('-', ' ')}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Edit3 className="w-3 h-3" />
                            Click cells to add/edit shifts
                        </div>
                    </div>
                </div>

                {/* AI Recommendations Panel */}
                <div className="xl:col-span-1">
                    <div className="card-elevated p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">AI Insights</h3>
                                <p className="text-xs text-muted-foreground">Click to apply changes</p>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {recommendations.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Check className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                                    <p className="text-sm font-medium">All recommendations applied!</p>
                                    <p className="text-xs">Your roster is optimized.</p>
                                </div>
                            ) : (
                                recommendations.map((rec) => (
                                    <div
                                        key={rec.id}
                                        className={`p-3 rounded-lg border transition-all hover:shadow-sm ${rec.type === 'critical'
                                            ? 'border-destructive/50 bg-destructive/5'
                                            : rec.type === 'warning'
                                                ? 'border-warning/50 bg-warning/5'
                                                : 'border-border bg-card'
                                            }`}
                                    >
                                        <div className="flex items-start gap-2 mb-2">
                                            {getRecommendationIcon(rec.type)}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-sm text-foreground">{rec.title}</span>
                                                    {getRecommendationBadge(rec.type)}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{rec.description}</p>
                                        {rec.action && rec.actionType && (
                                            <Button
                                                size="sm"
                                                variant={rec.type === 'critical' ? 'destructive' : 'outline'}
                                                className="w-full text-xs h-7"
                                                onClick={() => handleApplyRecommendation(rec)}
                                            >
                                                {getActionIcon(rec.actionType)}
                                                {rec.action}
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Summary Stats */}
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-2 rounded-lg bg-muted/50">
                                    <div className="text-lg font-bold text-primary">{staffMembers.filter(s => s.role === 'doctor').length}</div>
                                    <div className="text-xs text-muted-foreground">Doctors</div>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-muted/50">
                                    <div className="text-lg font-bold text-secondary">{staffMembers.filter(s => s.role === 'nurse').length}</div>
                                    <div className="text-xs text-muted-foreground">Nurses</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Roster;
