import { ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/Common/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type RecentActivityRow = {
    id: number;
    date: string;
    activity: string;
    user: string;
    status: string;
};

interface RecentActivityCardProps {
    rows?: RecentActivityRow[];
    isLoading?: boolean;
}

export function RecentActivityCard({ rows = [], isLoading = false }: RecentActivityCardProps) {
    return (
        <Card className="border-border/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 flex-1" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : rows.length === 0 ? (
                    <EmptyState
                        icon={ClipboardList}
                        title="Belum ada aktivitas"
                        description="Aktivitas sistem akan tercatat dan ditampilkan di sini secara otomatis."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/60">
                                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                                        Tanggal
                                    </th>
                                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                                        Aktivitas
                                    </th>
                                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                                        Pengguna
                                    </th>
                                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id} className="border-b border-border/40 last:border-0">
                                        <td className="py-2.5 text-xs text-muted-foreground">
                                            {row.date}
                                        </td>
                                        <td className="py-2.5 text-xs">{row.activity}</td>
                                        <td className="py-2.5 text-xs text-muted-foreground">
                                            {row.user}
                                        </td>
                                        <td className="py-2.5 text-xs">
                                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
