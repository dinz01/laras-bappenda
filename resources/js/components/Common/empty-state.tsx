import type { ComponentType } from 'react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: ComponentType<{ className?: string }>;
}

export function EmptyState({ title, description, icon: Icon }: EmptyStateProps) {
    return (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center animate-fade-in">
            {Icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
            )}
            <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    );
}
