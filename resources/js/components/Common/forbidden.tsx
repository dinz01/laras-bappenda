import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ForbiddenProps {
    title?: string;
    description?: string;
    onBack?: () => void;
    backLabel?: string;
}

export function Forbidden({
    title = 'Akses Ditolak',
    description = 'Maaf, Anda tidak memiliki izin atau hak akses yang cukup untuk melihat halaman ini.',
    onBack,
    backLabel = 'Kembali ke Dashboard',
}: ForbiddenProps) {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6 border border-border/60 rounded-xl bg-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 mb-6">
                <ShieldAlert className="h-8 w-8 text-rose-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
            {onBack && (
                <Button onClick={onBack} size="sm" className="mt-6">
                    {backLabel}
                </Button>
            )}
        </div>
    );
}
