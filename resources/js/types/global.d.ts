import type { Auth } from '@/types/auth';

export type NotificationItem = {
    id: number;
    title: string;
    message: string;
    type: string;
    type_label: string;
    type_color: string;
    url: string | null;
    is_read: boolean;
    created_at: string | null;
};

export type SharedNotifications = {
    unread_count: number;
    latest: NotificationItem[];
};

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            notifications: SharedNotifications;
            [key: string]: unknown;
        };
    }
}
