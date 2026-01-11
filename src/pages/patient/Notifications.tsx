import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bell,
    Pill,
    Clock,
    CheckCircle,
    XCircle,
    Sparkles,
    Calendar,
} from 'lucide-react';

interface Notification {
    id: number;
    type: 'medication' | 'reminder' | 'recommendation' | 'appointment';
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    priority?: 'high' | 'medium' | 'low';
    medicationName?: string;
    medicationTime?: string;
    isCompleted?: boolean;
    completedAt?: string;
}

// Get active medications from prescriptions
const activeMedications = [
    {
        name: 'Amoxicillin',
        times: ['08:00 AM', '02:00 PM', '08:00 PM'],
        instructions: 'Take with food',
    },
    {
        name: 'Ibuprofen',
        times: ['As needed'],
        instructions: 'Take with food. Maximum 3 times per day.',
    },
];

// Generate notifications based on active medications and current time
const generateNotifications = (): Notification[] => {
    const notifications: Notification[] = [];

    // Medication reminders - Add sample medication notifications that are always visible
    notifications.push({
        id: 1,
        type: 'medication',
        title: 'Time to take Amoxicillin',
        message: 'It\'s time for your Amoxicillin medication. Take with food.',
        time: 'Just now',
        isRead: false,
        priority: 'high',
        medicationName: 'Amoxicillin',
        medicationTime: '08:00 PM',
        isCompleted: false,
    });

    notifications.push({
        id: 2,
        type: 'medication',
        title: 'Time to take Amoxicillin',
        message: 'It\'s time for your Amoxicillin medication. Take with food.',
        time: '2 hours ago',
        isRead: false,
        priority: 'high',
        medicationName: 'Amoxicillin',
        medicationTime: '02:00 PM',
        isCompleted: false,
    });

    // AI Health Recommendations (General suggestions, no logging)
    const recommendations = [
        {
            id: notifications.length + 1,
            type: 'recommendation' as const,
            title: 'Stay Hydrated',
            message: 'Dr. Priya Patel suggested drinking at least 8 glasses of water daily. Remember to stay hydrated throughout the day!',
            time: '10 minutes ago',
            isRead: false,
            priority: 'low' as const,
            isCompleted: false,
        },
        {
            id: notifications.length + 2,
            type: 'recommendation' as const,
            title: 'Daily Exercise',
            message: 'Regular exercise is important for your overall health. Dr. Arjun Singh recommended 30 minutes of daily physical activity.',
            time: '1 hour ago',
            isRead: false,
            priority: 'medium' as const,
            isCompleted: false,
        },
        {
            id: notifications.length + 3,
            type: 'recommendation' as const,
            title: 'Dietary Reminder',
            message: 'For better cholesterol control, increase omega-3 intake through fish or supplements as suggested by Dr. Arjun Singh.',
            time: '2 hours ago',
            isRead: false,
            priority: 'low' as const,
            isCompleted: false,
        },
        {
            id: notifications.length + 4,
            type: 'recommendation' as const,
            title: 'Medication Compliance',
            message: 'Remember to take Levothyroxine on empty stomach, 30 minutes before breakfast as advised by Dr. Sarah Khan.',
            time: '3 hours ago',
            isRead: true,
            priority: 'medium' as const,
            isCompleted: false,
        },
    ];

    notifications.push(...recommendations);

    // Appointment reminders
    notifications.push({
        id: notifications.length + 1,
        type: 'appointment',
        title: 'Upcoming Appointment',
        message: 'You have an appointment with Dr. Priya Patel today at 3:00 PM',
        time: '1 hour ago',
        isRead: false,
        priority: 'high',
        isCompleted: false,
    });

    return notifications.sort((a, b) => {
        // Sort by priority and read status
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority || 'low'] - priorityOrder[b.priority || 'low'];
    });
};

export const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>(generateNotifications());
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleTaskComplete = (id: number) => {
        const notification = notifications.find(n => n.id === id);
        if (!notification) return;

        const completedAt = new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        setNotifications(prev => prev.map(notif => 
            notif.id === id 
                ? { 
                    ...notif, 
                    isCompleted: true, 
                    isRead: true,
                    completedAt: completedAt,
                }
                : notif
        ));

        // Track completion for AI analysis
        const completionData = {
            notificationId: id,
            medicationName: notification.medicationName,
            medicationTime: notification.medicationTime,
            completedAt: completedAt,
            type: notification.type,
            timestamp: new Date().toISOString(),
        };

        // Store in localStorage for AI analysis (in real app, this would go to backend)
        const existingData = JSON.parse(localStorage.getItem('medicationCompletions') || '[]');
        existingData.push(completionData);
        localStorage.setItem('medicationCompletions', JSON.stringify(existingData));

        console.log('Medication completion tracked for AI analysis:', completionData);
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'medication':
                return <Pill className="w-5 h-5 text-destructive" />;
            case 'reminder':
                return <Clock className="w-5 h-5 text-warning" />;
            case 'recommendation':
                return <Sparkles className="w-5 h-5 text-violet-600" />;
            case 'appointment':
                return <Calendar className="w-5 h-5 text-primary" />;
            default:
                return <Bell className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getPriorityBadge = (priority?: Notification['priority']) => {
        switch (priority) {
            case 'high':
                return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
            case 'medium':
                return <Badge variant="warning" className="text-xs">Medium</Badge>;
            case 'low':
                return <Badge variant="outline" className="text-xs">Low</Badge>;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout
            title="Notifications"
            subtitle={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        >
            <div className="space-y-4">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">
                            {unreadCount} unread • {notifications.length} total
                        </span>
                    </div>
                    <Button variant="outline" size="sm">
                        Mark all as read
                    </Button>
                </div>

                {/* Notifications List */}
                <div className="card-elevated divide-y divide-border">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-5 hover:bg-muted/30 transition-colors ${
                                    !notification.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                                }`}
                            >
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-foreground">
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {notification.message}
                                                </p>
                                                {notification.medicationTime && (
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            Scheduled: {notification.medicationTime}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {getPriorityBadge(notification.priority)}
                                                <span className="text-xs text-muted-foreground">
                                                    {notification.time}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Action buttons for medication and recommendation notifications */}
                                        {(notification.type === 'medication' || notification.type === 'recommendation') && (
                                            <div className="mt-3">
                                                {!notification.isCompleted || notification.isCompleted === false ? (
                                                    <div className="space-y-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="default" 
                                                            className="gap-2 w-full sm:w-auto"
                                                            onClick={() => handleTaskComplete(notification.id)}
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Mark as Done
                                                        </Button>
                                                        <p className="text-xs text-muted-foreground">
                                                            This completion will be tracked for AI health analysis
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-success bg-success/10 p-3 rounded-lg">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <div className="flex-1">
                                                            <span className="text-sm font-medium">Task Completed</span>
                                                            {notification.completedAt && (
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    Completed at {notification.completedAt}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {notification.type === 'recommendation' && (
                                            <div className="mt-3 flex items-center gap-2 text-xs text-violet-600">
                                                <Sparkles className="w-3 h-3" />
                                                <span>AI-powered health recommendation</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No notifications</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Notifications;

