import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentCardProps {
    title: string;
    description?: string;
    children: ReactNode;
}

export function ContentCard({ title, description, children }: ContentCardProps) {
    return (
        <Card className="border-border/60">
            <CardHeader className="space-y-1.5">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                {description && <CardDescription className="text-xs">{description}</CardDescription>}
            </CardHeader>
            <CardContent className="pt-0">{children}</CardContent>
        </Card>
    );
}
