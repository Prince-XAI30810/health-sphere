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
import { Notification, generateNotifications, getUnreadCount } from '@/data/notifications';

export const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>(generateNotifications());
    const unreadCount = getUnreadCount(notifications);

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
                                className={`p-5 hover:bg-muted/30 transition-colors ${!notification.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''
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

