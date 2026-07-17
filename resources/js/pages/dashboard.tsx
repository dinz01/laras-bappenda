import { Head, usePage } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    BookOpen,
    FileStack,
    FileText,
    LayoutDashboard,
    TrendingUp,
    Trash2,
    Users,
    Activity,
    FolderOpen,
} from 'lucide-react';
import { QuickAccessCard } from '@/components/Cards/quick-access-card';
import { RecentActivityCard } from '@/components/Cards/recent-activity-card';
import { StatisticCard } from '@/components/Cards/statistic-card';
import { SystemInformationCard } from '@/components/Cards/system-information-card';
import { DashboardHeader } from '@/components/Layout/dashboard-header';
import { dashboard } from '@/routes';

type DashboardProps = {
    statistics: {
        totalArsip: string;
        arsipAktif: string;
        recordCenter: string;
        permohonanAktif: string;
        arsipRetensi: string;
        aktivitasBulanIni: string;
    };
};

const quickAccessItems = [
    { label: 'Repositori Arsip', href: '#', icon: Archive },
    { label: 'Record Center', href: '#', icon: FileStack },
    { label: 'Retensi', href: '#', icon: BookOpen },
    { label: 'Pemusnahan', href: '#', icon: Trash2 },
    { label: 'Permohonan', href: '#', icon: ArchiveRestore },
    { label: 'Master Data', href: '#', icon: FileText },
    { label: 'Pengguna', href: '#', icon: Users },
];

const systemInfo = [
    { label: 'Nama Sistem', value: 'LARAS' },
    { label: 'Versi', value: 'v0.1.0' },
    { label: 'Environment', value: 'Development' },
    { label: 'Framework', value: 'Laravel 13' },
    { label: 'Frontend', value: 'React + Inertia' },
    { label: 'Database', value: 'MySQL' },
];

export default function Dashboard({ statistics }: DashboardProps) {
    const { auth } = usePage().props;

    const statsList = [
        { title: 'Total Arsip', value: statistics.totalArsip, icon: Archive },
        { title: 'Arsip Aktif', value: statistics.arsipAktif, icon: FolderOpen },
        { title: 'Record Center', value: statistics.recordCenter, icon: FileStack },
        { title: 'Permohonan Aktif', value: statistics.permohonanAktif, icon: ArchiveRestore },
        { title: 'Arsip Retensi', value: statistics.arsipRetensi, icon: BookOpen },
        { title: 'Aktivitas Bulan Ini', value: statistics.aktivitasBulanIni, icon: TrendingUp },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <DashboardHeader user={auth.user} />

                {/* Statistik */}
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">Statistik</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {statsList.map((stat) => (
                            <StatisticCard
                                key={stat.title}
                                title={stat.title}
                                value={stat.value}
                                icon={stat.icon}
                            />
                        ))}
                    </div>
                </section>

                {/* Quick Access */}
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">Akses Cepat</h2>
                    </div>
                    <QuickAccessCard items={quickAccessItems} />
                </section>

                {/* Aktivitas + Informasi Sistem */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <RecentActivityCard rows={[]} isLoading={false} />
                    </div>
                    <div>
                        <SystemInformationCard items={systemInfo} />
                    </div>
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
