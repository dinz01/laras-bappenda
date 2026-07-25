import type { ReactNode } from 'react';

interface PageContainerProps {
    children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
    return (
        <div className="animate-fade-in mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
            {children}
        </div>
    );
}
