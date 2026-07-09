import type { ComponentType } from 'react';
import { EmptyState } from '@/components/Common/empty-state';

interface EmptyTableProps {
    title: string;
    description: string;
    icon?: ComponentType<{ className?: string }>;
}

export function EmptyTable({ title, description, icon }: EmptyTableProps) {
    return (
        <div className="py-12">
            <EmptyState title={title} description={description} icon={icon} />
        </div>
    );
}
