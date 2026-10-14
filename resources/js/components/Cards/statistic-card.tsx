import type { ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticCardProps {
    title: string;
    value: string | number;
    icon?: ComponentType<{ className?: string }>;
    description?: string;
}

export function StatisticCard({
    title,
    value,
    icon: Icon,
    description,
}: StatisticCardProps) {
    return (
        <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-1.5">
                <CardTitle
                    className="truncate text-xs font-semibold text-muted-foreground"
                    title={title}
                >
                    {title}
                </CardTitle>
                {Icon && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-3.5 w-3.5 text-foreground" />
                    </div>
                )}
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold tracking-tight text-foreground">
                    {value}
                </p>
                {description && (
                    <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
