import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
    rows?: number;
}

export function SkeletonCard({ rows = 1 }: SkeletonCardProps) {
    return (
        <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} className="mt-4 h-7 w-20" />
            ))}
        </div>
    );
}
