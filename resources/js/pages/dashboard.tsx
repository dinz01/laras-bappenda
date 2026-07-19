import { Head, Link, usePage } from '@inertiajs/react';
import {
    Archive,
    FileStack,
    FileText,
    LayoutDashboard,
    TrendingUp,
    Trash2,
    Users,
    Activity,
    FolderOpen,
    Shield,
    History,
    Calendar,
    Clock,
    AlertCircle,
    Building2,
    Tags,
    ChevronRight,
    Bell,
} from 'lucide-react';
import { QuickAccessCard } from '@/components/Cards/quick-access-card';
import { StatisticCard } from '@/components/Cards/statistic-card';
import { SystemInformationCard } from '@/components/Cards/system-information-card';
import { EmptyState } from '@/components/Common/empty-state';
import { DashboardHeader } from '@/components/Layout/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { dashboard } from '@/routes';

type DashboardProps = {
    statistics: {
        totalArsip: string;
        arsipAktif: string;
        arsipInaktif: string;
        arsipPermanen: string;
        aktivitasBulanIni: string;
    };
    tahapStatistics: Record<string, number>;
    arsipPerTahun: Array<{ tahun: number; total: number }>;
    topUnit: Array<{ nama: string; kode: string; total: number }>;
    topKlasifikasi: Array<{ nama: string; kode: string; total: number }>;
    recentActivities: Array<{
        id: number;
        arsip_id: number;
        nomor_arsip: string;
        judul: string;
        aktivitas: string;
        user: string;
        tanggal: string;
    }>;
    mendekatiRetensi: Array<{
        nomor_arsip: string;
        judul: string;
        tahun_retensi_aktif: number;
        tanggal_arsip: string;
    }>;
    recycleBinCount?: number;
};

const quickAccessItems = [
    { label: 'Repositori Arsip', href: '/arsip', icon: Archive },
    { label: 'Record Center', href: '/record-center', icon: FileStack },
    { label: 'Pemusnahan', href: '/pemusnahan', icon: Trash2 },
    { label: 'Master Data', href: '/admin/klasifikasi-arsip', icon: FileText },
    { label: 'Pengguna', href: '/admin/users', icon: Users },
];

const systemInfo = [
    { label: 'Nama Sistem', value: 'LARAS' },
    { label: 'Versi', value: 'v1.0.0' },
    { label: 'Environment', value: 'Development' },
    { label: 'Framework', value: 'Laravel 13' },
    { label: 'Frontend', value: 'React 19 + Inertia v3' },
    { label: 'Database', value: 'MySQL' },
];

function getTahapLabel(tahap: string): string {
    switch (tahap) {
        case 'draft': return 'Draft';
        case 'review': return 'Review';
        case 'approved': return 'Disetujui';
        case 'active': return 'Arsip Aktif';
        case 'retention': return 'Retensi';
        case 'record_center': return 'Record Center';
        case 'destruction': return 'Pemusnahan';
        default: return tahap;
    }
}

function getTahapColor(tahap: string): string {
    switch (tahap) {
        case 'draft': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        case 'review': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        case 'approved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'retention': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'record_center': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
        case 'destruction': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        default: return 'bg-muted text-muted-foreground';
    }
}

export default function Dashboard({
    statistics,
    tahapStatistics,
    arsipPerTahun = [],
    topUnit = [],
    topKlasifikasi = [],
    recentActivities = [],
    mendekatiRetensi = [],
    recycleBinCount = 0,
}: DashboardProps) {
    const { auth, notifications: sharedNotifications } = usePage().props;
    const userRoles = (auth?.user as { roles?: string[] } | null)?.roles ?? [];
    const isSuperAdmin = userRoles.includes('Super Administrator');

    const statsList = [
        { title: 'Total Arsip', value: statistics.totalArsip, icon: Archive, desc: 'Seluruh arsip terdaftar' },
        { title: 'Arsip Aktif', value: statistics.arsipAktif, icon: FolderOpen, desc: 'Arsip dengan status aktif' },
        { title: 'Arsip Inaktif', value: statistics.arsipInaktif, icon: FileStack, desc: 'Arsip dengan status inaktif' },
        { title: 'Arsip Permanen', value: statistics.arsipPermanen, icon: Shield, desc: 'Arsip yang dipermanenkan' },
        { title: 'Aktivitas Bulan Ini', value: statistics.aktivitasBulanIni, icon: TrendingUp, desc: 'Arsip dibuat bulan ini' },
    ];

    // Find max value in charts for percentage scaling
    const maxArsipTahun = Math.max(...arsipPerTahun.map((t) => t.total), 1);
    const maxUnit = Math.max(...topUnit.map((u) => u.total), 1);
    const maxKlasifikasi = Math.max(...topKlasifikasi.map((k) => k.total), 1);

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-full overflow-hidden">
                {/* Header */}
                <DashboardHeader user={auth.user} />

                {/* Statistik Utama */}
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">Statistik Utama</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {statsList.map((stat) => (
                            <StatisticCard
                                key={stat.title}
                                title={stat.title}
                                value={stat.value}
                                icon={stat.icon}
                                description={stat.desc}
                            />
                        ))}
                    </div>
                </section>

                {/* Grid Tengah: Tahap Arsip & Grafik Batang */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Widget Tahap Arsip */}
                    <Card className="border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Tahap Arsip
                            </CardTitle>
                            <CardDescription className="text-xs">Jumlah dokumen pada tiap tahap siklus hidup</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="divide-y divide-border/40">
                                {Object.entries(tahapStatistics).map(([tahap, count]) => (
                                    <div key={tahap} className="flex items-center justify-between py-2.5">
                                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getTahapColor(tahap)}`}>
                                            {getTahapLabel(tahap)}
                                        </span>
                                        <span className="text-sm font-bold text-foreground">
                                            {numberFormat(count)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Grafik Arsip per Tahun */}
                    <Card className="lg:col-span-2 border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                Grafik Pertumbuhan Arsip per Tahun
                            </CardTitle>
                            <CardDescription className="text-xs">Jumlah arsip yang didaftarkan setiap tahunnya</CardDescription>
                        </CardHeader>
                        <CardContent className="h-72 flex flex-col justify-end pt-4">
                            {arsipPerTahun.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-xs text-muted-foreground">Belum ada data pertumbuhan arsip.</p>
                                </div>
                            ) : (
                                <div className="h-full w-full flex items-end justify-around gap-2 px-2 pb-2">
                                    {arsipPerTahun.map((item) => {
                                        const heightPercent = (item.total / maxArsipTahun) * 80; // scale max to 80% of container height

                                        return (
                                            <div key={item.tahun} className="flex flex-col items-center flex-1 max-w-[60px] group relative">
                                                {/* Tooltip on hover */}
                                                <div className="absolute bottom-[calc(100%+8px)] hidden group-hover:flex flex-col items-center z-10">
                                                    <div className="bg-foreground text-background text-[10px] py-1 px-2 rounded font-semibold whitespace-nowrap shadow">
                                                        {numberFormat(item.total)} Arsip
                                                    </div>
                                                    <div className="w-2 h-2 bg-foreground rotate-45 -mt-1" />
                                                </div>
                                                
                                                {/* Bar */}
                                                <div 
                                                    style={{ height: `${Math.max(heightPercent, 8)}%` }} 
                                                    className="w-full bg-primary/20 hover:bg-primary/45 border-t-2 border-primary rounded-t-sm transition-all duration-200"
                                                />
                                                <span className="text-[10px] font-medium text-muted-foreground mt-2 truncate w-full text-center">
                                                    {item.tahun}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Grid Distribusi: Unit Organisasi & Klasifikasi */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Top 10 Unit Organisasi */}
                    <Card className="border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                Top 10 Unit Organisasi
                            </CardTitle>
                            <CardDescription className="text-xs">Distribusi dokumen arsip terbanyak per unit kerja</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {topUnit.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-8">Belum ada data unit organisasi.</p>
                            ) : (
                                <div className="space-y-3.5">
                                    {topUnit.map((unit) => {
                                        const widthPercent = (unit.total / maxUnit) * 100;

                                        return (
                                            <div key={unit.kode} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-foreground truncate max-w-[80%]">
                                                        {unit.nama} <span className="text-muted-foreground">({unit.kode})</span>
                                                    </span>
                                                    <span className="font-semibold">{numberFormat(unit.total)}</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                    <div 
                                                        style={{ width: `${widthPercent}%` }} 
                                                        className="h-full bg-primary/60 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top 10 Klasifikasi */}
                    <Card className="border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Tags className="h-4 w-4 text-muted-foreground" />
                                Top 10 Klasifikasi Arsip
                            </CardTitle>
                            <CardDescription className="text-xs">Distribusi dokumen arsip terbanyak berdasarkan kode klasifikasi</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {topKlasifikasi.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-8">Belum ada data klasifikasi.</p>
                            ) : (
                                <div className="space-y-3.5">
                                    {topKlasifikasi.map((klasifikasi) => {
                                        const widthPercent = (klasifikasi.total / maxKlasifikasi) * 100;

                                        return (
                                            <div key={klasifikasi.kode} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-foreground truncate max-w-[80%]">
                                                        {klasifikasi.nama} <span className="text-muted-foreground">({klasifikasi.kode})</span>
                                                    </span>
                                                    <span className="font-semibold">{numberFormat(klasifikasi.total)}</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                    <div 
                                                        style={{ width: `${widthPercent}%` }} 
                                                        className="h-full bg-info/60 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Access */}
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">Akses Cepat</h2>
                    </div>
                    <QuickAccessCard items={quickAccessItems} />
                </section>

                {/* Grid Bawah: Aktivitas Terbaru & Informasi Sistem / Retensi */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Aktivitas Terbaru */}
                    <Card className="lg:col-span-2 border-border/60">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <History className="h-4 w-4 text-muted-foreground" />
                                    Aktivitas Terbaru
                                </CardTitle>
                                <CardDescription className="text-xs">10 riwayat pembuatan dan perubahan tahap arsip terakhir</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentActivities.length === 0 ? (
                                <EmptyState
                                    icon={History}
                                    title="Belum ada aktivitas"
                                    description="Aktivitas pembuatan dan perubahan tahap arsip akan terekam di sini."
                                />
                            ) : (
                                <div className="relative pl-4 border-l border-border/60 space-y-4 py-2">
                                    {recentActivities.map((act) => (
                                        <div key={act.id} className="relative text-xs group">
                                            {/* Bullet */}
                                            <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-muted-foreground group-hover:bg-primary transition-colors" />
                                            
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between gap-4">
                                                    <Link 
                                                        href={`/arsip/${act.arsip_id}`}
                                                        className="font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                                                    >
                                                        {act.judul} <span className="text-[10px] text-muted-foreground">({act.nomor_arsip})</span>
                                                    </Link>
                                                    <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                                                        {act.tanggal}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <span className="font-medium text-foreground">{act.aktivitas}</span>
                                                    <span>·</span>
                                                    <span>oleh {act.user}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Widget Retensi / Informasi Sistem */}
                    <div className="space-y-6">
                        {/* Notifikasi Belum Dibaca */}
                        <Card className="border-blue-500/20 bg-blue-500/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-500">
                                    <Bell className="h-4 w-4" />
                                    Notifikasi Belum Dibaca
                                </CardTitle>
                                <CardDescription className="text-xs text-blue-600/80">
                                    Jumlah pemberitahuan baru yang belum Anda baca.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-blue-600">
                                        {sharedNotifications?.unread_count ?? 0}
                                    </span>
                                    <span className="text-xs text-muted-foreground">pemberitahuan</span>
                                </div>
                                <Link
                                    href="/notifications"
                                    className="mt-3.5 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline gap-0.5"
                                >
                                    Lihat Notifikasi
                                    <ChevronRight className="h-3 w-3" />
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Arsip Menunggu Penghapusan (Super Admin Only) */}
                        {isSuperAdmin && (
                            <Card className="border-rose-500/20 bg-rose-500/5">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-500">
                                        <Trash2 className="h-4 w-4" />
                                        Arsip Menunggu Penghapusan
                                    </CardTitle>
                                    <CardDescription className="text-xs text-rose-600/80">
                                        Jumlah arsip di recycle bin yang akan dimusnahkan permanen dalam 24 jam.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-extrabold text-rose-600">{recycleBinCount}</span>
                                        <span className="text-xs text-muted-foreground">dokumen arsip</span>
                                    </div>
                                    {recycleBinCount > 0 && (
                                        <Link
                                            href="/admin/recycle-bin"
                                            className="mt-3.5 inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline gap-0.5"
                                        >
                                            Kelola Recycle Bin
                                            <ChevronRight className="h-3 w-3" />
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Arsip Mendekati Retensi */}
                        <Card className="border-border/60">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    Arsip Mendekati Retensi
                                </CardTitle>
                                <CardDescription className="text-xs">Daftar arsip aktif yang mendekati batas waktu penyimpanan</CardDescription>
                            </CardHeader>
                            <CardContent className="max-h-72 overflow-y-auto">
                                {mendekatiRetensi.length === 0 ? (
                                    <div className="py-8 flex flex-col items-center justify-center text-center">
                                        <AlertCircle className="h-8 w-8 text-muted-foreground/45 mb-2" />
                                        <p className="text-xs font-semibold text-muted-foreground">Tidak ada arsip</p>
                                        <p className="text-[10px] text-muted-foreground">Tidak ada arsip yang mendekati retensi aktif.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {mendekatiRetensi.map((item, idx) => (
                                            <div key={idx} className="flex flex-col gap-1 border-b border-border/40 pb-2 last:border-0 last:pb-0">
                                                <p className="text-xs font-medium text-foreground truncate">{item.judul}</p>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                    <span>{item.nomor_arsip}</span>
                                                    <span className="bg-amber-500/10 text-amber-500 font-semibold px-1.5 py-0.5 rounded">
                                                        Retensi: {item.tahun_retensi_aktif} Thn
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Info Sistem */}
                        <SystemInformationCard items={systemInfo} />
                    </div>
                </div>
            </div>
        </>
    );
}

function numberFormat(val: number): string {
    return new Intl.NumberFormat('id-ID').format(val);
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
