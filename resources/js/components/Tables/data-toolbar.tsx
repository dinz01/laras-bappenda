import type { ReactNode } from 'react';
import { SearchBox } from '@/components/Forms/search-box';

interface DataToolbarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    filters?: ReactNode;
    actions?: ReactNode;
}

export function DataToolbar({
    searchValue,
    onSearchChange,
    searchPlaceholder,
    filters,
    actions,
}: DataToolbarProps) {
    return (
        <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <SearchBox
                    value={searchValue}
                    placeholder={searchPlaceholder}
                    onChange={onSearchChange}
                />
                {filters && (
                    <div className="flex items-center gap-2">{filters}</div>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                    {actions}
                </div>
            )}
        </div>
    );
}
