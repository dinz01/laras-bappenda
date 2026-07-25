import { Construction } from 'lucide-react';

interface UnderDevelopmentProps {
    featureName: string;
}

export function UnderDevelopment({ featureName }: UnderDevelopmentProps) {
    return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-6 text-center">
            <div className="mb-5 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-amber-500/10">
                <Construction className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
                Menu Sedang Dikembangkan
            </h3>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
                Fitur <strong className="text-foreground">{featureName}</strong>{' '}
                sedang dalam proses pengembangan oleh tim teknis. Silakan
                kembali lagi nanti.
            </p>
        </div>
    );
}
