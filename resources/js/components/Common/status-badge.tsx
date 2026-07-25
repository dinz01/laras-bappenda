import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type BadgeStatusVariant =
    'success' | 'warning' | 'danger' | 'info' | 'secondary';

interface StatusBadgeProps {
    variant: BadgeStatusVariant;
    children: ReactNode;
    className?: string;
}

export function StatusBadge({
    variant,
    children,
    className,
}: StatusBadgeProps) {
    const variantStyles = {
        success:
            'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-500/10',
        warning:
            'bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 border-amber-500/30 dark:text-amber-400 dark:bg-amber-500/10',
        danger: 'bg-rose-500/15 text-rose-700 hover:bg-rose-500/20 border-rose-500/30 dark:text-rose-400 dark:bg-rose-500/10',
        info: 'bg-sky-500/15 text-sky-700 hover:bg-sky-500/20 border-sky-500/30 dark:text-sky-400 dark:bg-sky-500/10',
        secondary:
            'bg-muted text-muted-foreground hover:bg-muted/80 border-border',
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                variantStyles[variant],
                className,
            )}
        >
            {children}
        </Badge>
    );
}
