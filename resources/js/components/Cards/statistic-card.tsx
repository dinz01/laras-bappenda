import type { ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticCardProps {
    title: string;
    value: string | number;
    icon: ComponentType<{ className?: string }>;
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-foreground" />
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
