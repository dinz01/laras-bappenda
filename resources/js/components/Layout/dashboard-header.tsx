import type { User } from '@/types';

interface DashboardHeaderProps {
    user: User;
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        return 'Selamat Pagi';
    } else if (hour >= 12 && hour < 15) {
        return 'Selamat Siang';
    } else if (hour >= 15 && hour < 19) {
        return 'Selamat Sore';
    } else {
        return 'Selamat Malam';
    }
}

function getFormattedDate(): string {
    return new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const greeting = getGreeting();
    const today = getFormattedDate();

    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <p className="text-xs text-muted-foreground">{greeting},</p>
                <h1 className="text-xl font-semibold tracking-tight">{user.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Selamat datang kembali di Sistem LARAS — Layanan Arsip Digital.
                </p>
            </div>
            <div className="mt-2 shrink-0 text-left sm:mt-0 sm:text-right">
                <p className="text-xs text-muted-foreground">{today}</p>
            </div>
        </div>
    );
}
