import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
    return (
        <div
            className={cn(
                'animate-fade-in flex max-w-full flex-1 flex-col gap-6 overflow-hidden p-4 md:p-6',
                className,
            )}
        >
            {children}
        </div>
    );
}
