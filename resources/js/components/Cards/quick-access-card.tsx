import { Link } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface QuickAccessItem {
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
}

interface QuickAccessCardProps {
    items: QuickAccessItem[];
}

export function QuickAccessCard({ items }: QuickAccessCardProps) {
    return (
        <Card className="border-border/60">
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                    {items.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="group flex flex-col items-center gap-2 rounded-lg border border-border/40 bg-muted/30 p-3 text-center transition-colors hover:border-border hover:bg-muted"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/40 bg-background transition-colors group-hover:border-border">
                                <item.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                            </div>
                            <span className="text-xs leading-tight font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
