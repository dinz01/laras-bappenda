import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { EmptyState } from '@/components/Common/empty-state';
import { DashboardHeader } from '@/components/Layout/dashboard-header';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

type DashboardProps = {
    statistics: {
        totalArsip: string;
        arsipAktif: string;
        arsipInaktif: string;
        menungguReview: string;
        perluRevisi: string;
        menungguTte: string;
        pemusnahan: string;
    };
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
        tanggal_inaktif: string;
        tanggal_inaktif_full: string;
        sisa_waktu: string;
        is_expired: boolean;
    }>;
};

function numberFormat(val: number): string {
    return new Intl.NumberFormat('id-ID').format(val);
}

const YEARS_PER_PAGE = 5;

export default function Dashboard({
    statistics,
    arsipPerTahun = [],
    topUnit = [],
    topKlasifikasi = [],
    recentActivities = [],
    mendekatiRetensi = [],
}: DashboardProps) {
    const { auth } = usePage().props;

    const statsList = [
        {
            title: 'Total Arsip',
            value: statistics.totalArsip,
            desc: 'Seluruh arsip terdaftar',
            card: 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40',
            value_: 'text-slate-700 dark:text-slate-300',
        },
        {
            title: 'Arsip Aktif',
            value: statistics.arsipAktif,
            desc: 'Status aktif',
            card: 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30',
            value_: 'text-green-700 dark:text-green-400',
        },
        {
            title: 'Arsip Inaktif',
            value: statistics.arsipInaktif,
            desc: 'Status inaktif',
            card: 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/40',
            value_: 'text-gray-600 dark:text-gray-300',
        },
        {
            title: 'Menunggu Review',
            value: statistics.menungguReview,
            desc: 'Tahap verifikasi',
            card: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30',
            value_: 'text-blue-700 dark:text-blue-400',
        },
        {
            title: 'Perlu Revisi',
            value: statistics.perluRevisi,
            desc: 'Dikembalikan ke pengolah',
            card: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
            value_: 'text-amber-700 dark:text-amber-400',
        },
        {
            title: 'Menunggu TTE',
            value: statistics.menungguTte,
            desc: 'Menunggu tanda tangan',
            card: 'border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30',
            value_: 'text-indigo-700 dark:text-indigo-400',
        },
        {
            title: 'Pemusnahan',
            value: statistics.pemusnahan,
            desc: 'Dalam usul musnah',
            card: 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30',
            value_: 'text-rose-700 dark:text-rose-400',
        },
    ];

    // --- Grafik pertumbuhan arsip: dibatasi 5 tahun per tampilan, dengan navigasi ---
    const sortedTahun = useMemo(
        () => [...arsipPerTahun].sort((a, b) => a.tahun - b.tahun),
        [arsipPerTahun],
    );
    const totalPages = Math.max(
        1,
        Math.ceil(sortedTahun.length / YEARS_PER_PAGE),
    );
    const [page, setPage] = useState(totalPages - 1);

    const startIdx = page * YEARS_PER_PAGE;
    const visibleTahun = sortedTahun.slice(startIdx, startIdx + YEARS_PER_PAGE);

    const canGoOlder = page > 0;
    const canGoNewer = page < totalPages - 1;

    // Sinkronisasi tinggi card Arsip Mendekati Retensi persis dengan card Aktivitas Terbaru di sebelah kirinya.
    // Hanya aktif pada layar lg ke atas (grid 3-kolom); pada mobile/tablet, height dibiarkan auto.
    const leftCardRef = useRef<HTMLDivElement>(null);
    const [leftCardHeight, setLeftCardHeight] = useState<number | null>(null);

    // Lazy initializer: baca mediaQuery langsung saat pertama render (aman, tidak di dalam effect)
    const [isLg, setIsLg] = useState<boolean>(
        () =>
            typeof window !== 'undefined' &&
            window.matchMedia('(min-width: 1024px)').matches,
    );

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const handler = (e: MediaQueryListEvent) => setIsLg(e.matches);

        mq.addEventListener('change', handler);

        return () => mq.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        if (!leftCardRef.current || !isLg) {
            setLeftCardHeight(null);

            return;
        }

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.height > 0) {
                    setLeftCardHeight(entry.target.clientHeight);
                }
            }
        });
        observer.observe(leftCardRef.current);

        return () => observer.disconnect();
    }, [recentActivities, isLg]);

    const maxRaw = Math.max(...visibleTahun.map((t) => t.total), 10);
    const yMax = Math.ceil(maxRaw / 50) * 50 || 100;
    const yTicks = [
        yMax,
        Math.round((yMax * 3) / 4),
        Math.round((yMax * 2) / 4),
        Math.round(yMax / 4),
        0,
    ];

    const maxUnit = Math.max(...topUnit.map((u) => u.total), 1);
    const maxKlasifikasi = Math.max(...topKlasifikasi.map((k) => k.total), 1);

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex max-w-full flex-1 flex-col gap-6 overflow-hidden p-4 md:p-6">
                {/* Header */}
                <DashboardHeader user={auth.user} />

                {/* Statistik Utama */}
                <section>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
                        {statsList.map((stat) => (
                            <Card
                                key={stat.title}
                                className={`py-0 shadow-none ${stat.card}`}
                            >
                                <CardContent className="px-3 py-2.5">
                                    <p className="truncate text-[11px] font-medium text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <p
                                        className={`mt-0.5 text-xl leading-none font-bold ${stat.value_}`}
                                    >
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 truncate text-[10px] text-muted-foreground/80">
                                        {stat.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Grafik Pertumbuhan Arsip per Tahun */}
                <Card className="border-border/60">
                    <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    Grafik Pertumbuhan Arsip per Tahun
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Jumlah arsip yang didaftarkan setiap
                                    tahunnya
                                </CardDescription>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        canGoOlder && setPage((p) => p - 1)
                                    }
                                    disabled={!canGoOlder}
                                    aria-label="Tahun sebelumnya"
                                    className="flex h-6 w-6 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <span className="text-[11px] font-medium text-muted-foreground">
                                    {visibleTahun.length > 0
                                        ? `${visibleTahun[0].tahun} — ${visibleTahun[visibleTahun.length - 1].tahun}`
                                        : '—'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        canGoNewer && setPage((p) => p + 1)
                                    }
                                    disabled={!canGoNewer}
                                    aria-label="Tahun berikutnya"
                                    className="flex h-6 w-6 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {visibleTahun.length === 0 ? (
                            <div className="flex h-40 items-center justify-center sm:h-52 md:h-64">
                                <p className="text-xs text-muted-foreground">
                                    Belum ada data pertumbuhan arsip.
                                </p>
                            </div>
                        ) : (
                            <div className="flex w-full">
                                {/* Sumbu Y — tinggi sama persis dengan area plot */}
                                <div className="flex h-40 w-8 flex-col justify-between pr-1 text-right text-[10px] font-medium text-muted-foreground select-none sm:h-52 sm:w-10 sm:pr-2 sm:text-[11px] md:h-64 md:w-12">
                                    {yTicks.map((tick, i) => (
                                        <span key={i} className="leading-none">
                                            {numberFormat(tick)}
                                        </span>
                                    ))}
                                </div>

                                {/* Area plot + sumbu X (label tahun ditaruh di baris terpisah di bawah plot) */}
                                <div className="flex flex-1 flex-col">
                                    <div className="relative h-40 w-full sm:h-52 md:h-64">
                                        {/* Gridlines */}
                                        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                                            {yTicks.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-full border-b border-dashed border-border/50"
                                                />
                                            ))}
                                        </div>

                                        {/* Bars — items-end + tinggi 100% memastikan dasar bar pas di garis 0 */}
                                        <div className="relative z-10 flex h-full w-full items-end justify-around gap-4 px-4">
                                            {visibleTahun.map((item) => {
                                                const heightPercent = Math.min(
                                                    Math.max(
                                                        (item.total / yMax) *
                                                            100,
                                                        4,
                                                    ),
                                                    100,
                                                );

                                                return (
                                                    <div
                                                        key={item.tahun}
                                                        className="group relative flex h-full w-full max-w-[160px] flex-col items-center justify-end"
                                                    >
                                                        <div className="absolute -top-3 z-20 hidden flex-col items-center group-hover:flex">
                                                            <div className="rounded-md bg-foreground px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-background shadow-md">
                                                                Tahun{' '}
                                                                {item.tahun}:{' '}
                                                                {numberFormat(
                                                                    item.total,
                                                                )}{' '}
                                                                Arsip
                                                            </div>
                                                            <div className="-mt-1 h-2 w-2 rotate-45 bg-foreground" />
                                                        </div>

                                                        <span className="mb-1.5 text-xs font-bold text-foreground">
                                                            {numberFormat(
                                                                item.total,
                                                            )}
                                                        </span>

                                                        <div
                                                            style={{
                                                                height: `${heightPercent}%`,
                                                            }}
                                                            className="w-full max-w-[84px] rounded-t-lg bg-[#16834B] shadow-sm ring-1 ring-black/5 transition-all duration-300 ease-out hover:bg-[#126B3D]"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Sumbu X — sengaja dipisah dari area plot agar posisinya lebih rendah dari label angka 0 */}
                                    <div className="mt-3 flex w-full items-start justify-around gap-4 px-4">
                                        {visibleTahun.map((item) => (
                                            <span
                                                key={item.tahun}
                                                className="w-full max-w-[160px] text-center text-xs font-semibold text-foreground"
                                            >
                                                {item.tahun}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Distribusi Unit Organisasi & Klasifikasi Arsip */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                Top 10 Unit Organisasi
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Distribusi dokumen arsip terbanyak per unit
                                kerja
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topUnit.length === 0 ? (
                                <p className="py-8 text-center text-xs text-muted-foreground">
                                    Belum ada data unit organisasi.
                                </p>
                            ) : (
                                <div className="space-y-3.5">
                                    {topUnit.map((unit, idx) => {
                                        const widthPercent =
                                            (unit.total / maxUnit) * 100;

                                        return (
                                            <div
                                                key={idx}
                                                className="space-y-1.5"
                                            >
                                                <div className="flex items-center justify-between text-xs">
                                                    <span
                                                        className="max-w-[80%] truncate font-medium text-foreground"
                                                        title={unit.nama}
                                                    >
                                                        {unit.nama}
                                                    </span>
                                                    <span className="font-semibold text-foreground">
                                                        {numberFormat(
                                                            unit.total,
                                                        )}{' '}
                                                        <span className="text-[10px] font-normal text-muted-foreground">
                                                            arsip
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        style={{
                                                            width: `${widthPercent}%`,
                                                        }}
                                                        className="h-full rounded-full bg-[#3FA76A] transition-all duration-300"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                Top 10 Klasifikasi Arsip
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Distribusi dokumen arsip terbanyak berdasarkan
                                kode klasifikasi
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topKlasifikasi.length === 0 ? (
                                <p className="py-8 text-center text-xs text-muted-foreground">
                                    Belum ada data klasifikasi.
                                </p>
                            ) : (
                                <div className="space-y-3.5">
                                    {topKlasifikasi.map((klasifikasi) => {
                                        const widthPercent =
                                            (klasifikasi.total /
                                                maxKlasifikasi) *
                                            100;

                                        return (
                                            <div
                                                key={klasifikasi.kode}
                                                className="space-y-1.5"
                                            >
                                                <div className="flex items-center justify-between text-xs">
                                                    <span
                                                        className="max-w-[80%] truncate font-medium text-foreground"
                                                        title={`${klasifikasi.nama} (${klasifikasi.kode})`}
                                                    >
                                                        {klasifikasi.nama}{' '}
                                                        <span className="text-muted-foreground">
                                                            ({klasifikasi.kode})
                                                        </span>
                                                    </span>
                                                    <span className="font-semibold text-foreground">
                                                        {numberFormat(
                                                            klasifikasi.total,
                                                        )}{' '}
                                                        <span className="text-[10px] font-normal text-muted-foreground">
                                                            arsip
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        style={{
                                                            width: `${widthPercent}%`,
                                                        }}
                                                        className="h-full rounded-full bg-[#3FA76A] transition-all duration-300"
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

                {/* Grid Bagian Bawah: Aktivitas Terbaru & Arsip Mendekati Retensi */}
                <div className="grid items-start gap-6 lg:grid-cols-3">
                    {/* Aktivitas Terbaru — vertikal ke bawah (sebagai acuan tinggi) */}
                    <Card
                        ref={leftCardRef}
                        className="flex flex-col border-border/60 lg:col-span-2"
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                Aktivitas Terbaru
                            </CardTitle>
                            <CardDescription className="text-xs">
                                10 riwayat pembuatan dan perubahan tahap arsip
                                terakhir
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentActivities.length === 0 ? (
                                <EmptyState
                                    icon={History}
                                    title="Belum ada aktivitas"
                                    description="Aktivitas pembuatan dan perubahan tahap arsip akan terekam di sini."
                                />
                            ) : (
                                <div className="space-y-4 border-l border-border/60 py-1 pl-4">
                                    {recentActivities.map((act) => (
                                        <div
                                            key={act.id}
                                            className="group relative text-xs"
                                        >
                                            <div className="absolute top-1.5 -left-[21px] h-2.5 w-2.5 rounded-full border-2 border-background bg-muted-foreground transition-colors group-hover:bg-[#3FA76A]" />

                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="font-semibold text-foreground">
                                                        {act.judul}{' '}
                                                        <span className="text-[10px] text-muted-foreground">
                                                            ({act.nomor_arsip})
                                                        </span>
                                                    </span>
                                                    <span className="shrink-0 text-[10px] whitespace-nowrap text-muted-foreground">
                                                        {act.tanggal}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <span className="font-medium text-foreground">
                                                        {act.aktivitas}
                                                    </span>
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

                    {/* Arsip Mendekati Retensi: tingginya dipotong persis sejajar dengan card Aktivitas Terbaru di kirinya,
                        dan konten di dalamnya dapat discroll vertikal */}
                    <Card
                        style={
                            leftCardHeight
                                ? { height: `${leftCardHeight}px` }
                                : undefined
                        }
                        className="flex flex-col overflow-hidden border-border/60"
                    >
                        <CardHeader className="shrink-0 pb-3">
                            <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
                                Arsip Mendekati Retensi
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Tanggal dan estimasi arsip beralih ke inaktif
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0 pb-3">
                            {mendekatiRetensi.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                                    <AlertCircle className="mb-1.5 h-6 w-6 text-muted-foreground/45" />
                                    <p className="text-[11px] font-semibold text-muted-foreground">
                                        Tidak ada arsip mendekati retensi
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/40">
                                    {mendekatiRetensi.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0"
                                        >
                                            {/* Judul + badge sisa waktu sejajar di baris atas */}
                                            <div className="flex items-start justify-between gap-2">
                                                <p
                                                    className="truncate text-xs font-medium text-foreground"
                                                    title={item.judul}
                                                >
                                                    {item.judul}
                                                </p>
                                                <span
                                                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
                                                        item.is_expired
                                                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                    }`}
                                                >
                                                    {item.sisa_waktu}
                                                </span>
                                            </div>

                                            {/* Nomor arsip lalu keterangan inaktif di bawahnya */}
                                            <span className="font-mono text-[11px] text-muted-foreground">
                                                {item.nomor_arsip}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                Inaktif:{' '}
                                                <strong className="text-foreground">
                                                    {item.tanggal_inaktif}
                                                </strong>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
