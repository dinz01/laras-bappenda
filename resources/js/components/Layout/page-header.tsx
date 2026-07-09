import type { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { BreadcrumbItem } from '@/types';

interface PageHeaderProps {
    title: string;
    description: string;
    breadcrumb: BreadcrumbItem[];
    actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumb, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 border-b border-border/60 pb-5">
            <Breadcrumbs breadcrumbs={breadcrumb} />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                {actions && <div className="flex items-center gap-2 self-start sm:self-center">{actions}</div>}
            </div>
        </div>
    );
}
