import { Spinner } from '@/components/ui/spinner';

interface LoadingOverlayProps {
    show: boolean;
}

export function LoadingOverlay({ show }: LoadingOverlayProps) {
    if (!show) {
        return null;
    }

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 shadow-lg">
                <Spinner className="h-6 w-6 text-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Memuat data...</span>
            </div>
        </div>
    );
}
