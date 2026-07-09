import { Head } from '@inertiajs/react';
import { Archive, Clock, FileStack, TrendingUp } from 'lucide-react';
import { dashboard } from '@/routes';

const placeholderCards = [
    {
        title: 'Total Arsip',
        icon: Archive,
        description: 'Segera hadir',
    },
    {
        title: 'Arsip Masuk',
        icon: FileStack,
        description: 'Segera hadir',
    },
    {
        title: 'Permohonan Aktif',
        icon: Clock,
        description: 'Segera hadir',
    },
    {
        title: 'Aktivitas Bulan Ini',
        icon: TrendingUp,
        description: 'Segera hadir',
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Selamat datang di Sistem LARAS — Layanan Arsip Digital.
                    </p>
                </div>

                {/* Placeholder Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {placeholderCards.map((card) => (
                        <div
                            key={card.title}
                            className="rounded-xl border border-border/60 bg-card p-5"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </p>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                    <card.icon className="size-4 text-foreground" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-end justify-between">
                                <div className="h-7 w-20 animate-pulse rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Coming Soon Area */}
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Archive className="size-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold">Segera Hadir</h3>
                    <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                        Ringkasan statistik arsip, aktivitas terkini, dan grafik akan ditampilkan di sini.
                    </p>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
