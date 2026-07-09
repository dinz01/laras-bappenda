import type { ReactNode } from 'react';

interface PageContainerProps {
    children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
    return (
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6 space-y-6 animate-fade-in">
            {children}
        </div>
    );
}
