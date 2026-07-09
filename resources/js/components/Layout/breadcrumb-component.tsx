import { Breadcrumbs } from '@/components/breadcrumbs';
import type { BreadcrumbItem } from '@/types';

interface BreadcrumbComponentProps {
    items: BreadcrumbItem[];
}

export function BreadcrumbComponent({ items }: BreadcrumbComponentProps) {
    return <Breadcrumbs breadcrumbs={items} />;
}
