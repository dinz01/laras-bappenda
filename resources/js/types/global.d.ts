import type { Auth } from '@/types/auth';

export type FlashMessages = {
    success?: string | null;
    error?: string | null;
    warning?: string | null;
    info?: string | null;
    status?: string | null;
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
            appTimezone: string;
            auth: Auth;
            sidebarOpen: boolean;
            flash?: FlashMessages;
            [key: string]: unknown;
        };
    }
}
