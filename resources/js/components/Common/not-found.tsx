import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotFoundProps {
    title?: string;
    description?: string;
    onBack?: () => void;
    backLabel?: string;
}

export function NotFound({
    title = 'Halaman Tidak Ditemukan',
    description = 'Maaf, halaman atau data yang Anda cari tidak dapat ditemukan atau telah dihapus.',
    onBack,
    backLabel = 'Kembali',
}: NotFoundProps) {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6 border border-border/60 rounded-xl bg-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 mb-6">
                <FileQuestion className="h-8 w-8 text-muted-foreground" />
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
