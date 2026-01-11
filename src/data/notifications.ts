// Shared notification data for use across components
import { Pill, Clock, Sparkles, Calendar, Bell, MessageSquare, AlertCircle } from 'lucide-react';

export interface Notification {
    id: number;
    type: 'medication' | 'reminder' | 'recommendation' | 'appointment' | 'message' | 'alert';
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

// Generate notifications based on active medications and current time
export const generateNotifications = (): Notification[] => {
    const notifications: Notification[] = [];

    // Medication reminders
    notifications.push({
        id: 1,
        type: 'medication',
        title: 'Time to take Amoxicillin',
        message: "It's time for your Amoxicillin medication. Take with food.",
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
        message: "It's time for your Amoxicillin medication. Take with food.",
        time: '2 hours ago',
        isRead: false,
        priority: 'high',
        medicationName: 'Amoxicillin',
        medicationTime: '02:00 PM',
        isCompleted: false,
    });

    // AI Health Recommendations
    const recommendations: Notification[] = [
        {
            id: 3,
            type: 'recommendation',
            title: 'Stay Hydrated',
            message: 'Dr. Priya Patel suggested drinking at least 8 glasses of water daily. Remember to stay hydrated throughout the day!',
            time: '10 minutes ago',
            isRead: false,
            priority: 'low',
            isCompleted: false,
        },
        {
            id: 4,
            type: 'recommendation',
            title: 'Daily Exercise',
            message: 'Regular exercise is important for your overall health. Dr. Arjun Singh recommended 30 minutes of daily physical activity.',
            time: '1 hour ago',
            isRead: false,
            priority: 'medium',
            isCompleted: false,
        },
        {
            id: 5,
            type: 'recommendation',
            title: 'Dietary Reminder',
            message: 'For better cholesterol control, increase omega-3 intake through fish or supplements as suggested by Dr. Arjun Singh.',
            time: '2 hours ago',
            isRead: false,
            priority: 'low',
            isCompleted: false,
        },
        {
            id: 6,
            type: 'recommendation',
            title: 'Medication Compliance',
            message: 'Remember to take Levothyroxine on empty stomach, 30 minutes before breakfast as advised by Dr. Sarah Khan.',
            time: '3 hours ago',
            isRead: true,
            priority: 'medium',
            isCompleted: false,
        },
    ];

    notifications.push(...recommendations);

    // Appointment reminders
    notifications.push({
        id: 7,
        type: 'appointment',
        title: 'Upcoming Appointment',
        message: 'Reminder: Video consultation with Dr. Priya Patel tomorrow at 3:00 PM',
        time: '10 min ago',
        isRead: false,
        priority: 'high',
        isCompleted: false,
    });

    // New message notification
    notifications.push({
        id: 8,
        type: 'message',
        title: 'New Message',
        message: 'Dr. Arjun Singh sent you a message regarding your test results',
        time: '3 hours ago',
        isRead: false,
        priority: 'medium',
        isCompleted: false,
    });

    return notifications.sort((a, b) => {
        // Sort by priority and read status
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority || 'low'] - priorityOrder[b.priority || 'low'];
    });
};

// Get the initial notifications
export const notificationsData = generateNotifications();

// Get unread count
export const getUnreadCount = (notifications: Notification[]) => {
    return notifications.filter(n => !n.isRead).length;
};
