import { Construction } from 'lucide-react';

interface UnderDevelopmentProps {
    featureName: string;
}

export function UnderDevelopment({ featureName }: UnderDevelopmentProps) {
    return (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center p-6 border border-dashed border-border/80 rounded-xl bg-muted/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 mb-5 animate-pulse">
                <Construction className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Menu Sedang Dikembangkan</h3>
            <p className="mt-2 max-w-xs text-xs text-muted-foreground leading-relaxed">
                Fitur <strong className="text-foreground">{featureName}</strong> sedang dalam proses pengembangan oleh tim teknis. Silakan kembali lagi nanti.
            </p>
        </div>
    );
}
