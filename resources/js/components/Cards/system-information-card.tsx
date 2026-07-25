import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemInfoItem {
    label: string;
    value: string;
}

interface SystemInformationCardProps {
    items: SystemInfoItem[];
}

export function SystemInformationCard({ items }: SystemInformationCardProps) {
    return (
        <Card className="border-border/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                    Informasi Sistem
                </CardTitle>
            </CardHeader>
            <CardContent>
                <dl className="divide-y divide-border/60">
                    {items.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center justify-between py-2"
                        >
                            <dt className="text-xs text-muted-foreground">
                                {item.label}
                            </dt>
                            <dd className="text-xs font-medium text-foreground">
                                {item.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </CardContent>
        </Card>
    );
}
