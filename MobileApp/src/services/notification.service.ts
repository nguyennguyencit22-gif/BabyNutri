import { apiGet, apiPut } from './api';

export type NotificationItem = {
    id: number;
    title: string;
    message: string;
    isRead: boolean;
    type?: string;
    refId?: number | null;
    createdAt: string;
};

export async function fetchNotifications(): Promise<NotificationItem[]> {
    try {
        const res = await apiGet<{ notifications: NotificationItem[] }>('/notifications');
        return res.notifications || [];
    } catch {
        return [];
    }
}

export async function fetchUnreadNotificationCount(): Promise<number> {
    try {
        const res = await apiGet<{ unreadCount: number }>('/notifications/unread-count');
        return res.unreadCount || 0;
    } catch {
        return 0;
    }
}

export async function markAllNotificationsRead(): Promise<void> {
    try {
        await apiPut('/notifications/read-all');
    } catch {
        // Ignore
    }
}
