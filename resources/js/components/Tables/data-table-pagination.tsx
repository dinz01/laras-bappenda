import { router } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type PaginationLinkItem = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedData = {
    from?: number | null;
    to?: number | null;
    total?: number;
    current_page?: number;
    last_page?: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
    links?: PaginationLinkItem[];
    per_page?: number;
};

interface DataTablePaginationProps {
    data: PaginatedData;
    itemName?: string;
    className?: string;
    onPageChange?: (url: string) => void;
    perPage?: number | string | null;
    onPerPageChange?: (perPage: number) => void;
    perPageOptions?: number[];
}

export function DataTablePagination({
    data,
    itemName = 'data',
    className = '',
    onPageChange,
    perPage,
    onPerPageChange,
    perPageOptions = [15, 30, 50, 100],
}: DataTablePaginationProps) {
    const handleNavigate = (url: string | null) => {
        if (!url) {
            return;
        }

        if (onPageChange) {
            onPageChange(url);
        } else {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    const links = data.links || [];
    const prevLink =
        links.length > 0
            ? links[0]
            : {
                  url: data.prev_page_url ?? null,
                  label: 'Previous',
                  active: false,
              };
    const nextLink =
        links.length > 0
            ? links[links.length - 1]
            : {
                  url: data.next_page_url ?? null,
                  label: 'Next',
                  active: false,
              };
    // Calculate compact page links (max 3 visible numbers with ellipsis)
    const rawPageLinks = links.length > 2 ? links.slice(1, -1) : [];
    const totalPages =
        data.last_page ??
        rawPageLinks.filter((l) => !isNaN(Number(l.label))).length;
    const currentPage =
        data.current_page ??
        (rawPageLinks.find((l) => l.active)
            ? Number(rawPageLinks.find((l) => l.active)?.label)
            : 1);

    type DisplayItem = {
        type: 'page' | 'ellipsis';
        page?: number;
        url?: string | null;
        active?: boolean;
        key: string;
    };

    let displayItems: DisplayItem[] = [];

    if (totalPages <= 3) {
        // Show all pages if 3 or fewer
        displayItems = Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1;
            const originalLink = rawPageLinks.find(
                (l) => Number(l.label) === pageNum,
            );

            return {
                type: 'page' as const,
                page: pageNum,
                url: originalLink?.url ?? null,
                active: pageNum === currentPage,
                key: `page-${pageNum}`,
            };
        });
    } else {
        // Max 3 page numbers: sliding window of 3 around currentPage
        let start = Math.max(1, currentPage - 1);
        let end = start + 2;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - 2);
        }

        const pages: number[] = [];

        for (let p = start; p <= end; p++) {
            pages.push(p);
        }

        if (start > 1) {
            displayItems.push({
                type: 'ellipsis',
                key: 'ellipsis-start',
            });
        }

        for (const p of pages) {
            const originalLink = rawPageLinks.find(
                (l) => Number(l.label) === p,
            );
            displayItems.push({
                type: 'page',
                page: p,
                url: originalLink?.url ?? null,
                active: p === currentPage,
                key: `page-${p}`,
            });
        }

        if (end < totalPages) {
            displayItems.push({
                type: 'ellipsis',
                key: 'ellipsis-end',
            });
        }
    }

    const total = data.total ?? 0;
    const from = data.from ?? (total > 0 ? 1 : 0);
    const to = data.to ?? total;
    const currentPerPage = perPage ?? data.per_page ?? 15;

    const handlePerPageChange = (val: string) => {
        const num = Number(val);

        if (onPerPageChange) {
            onPerPageChange(num);
        } else {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('per_page', String(num));
            currentUrl.searchParams.delete('page');
            router.get(
                currentUrl.pathname + currentUrl.search,
                {},
                { preserveState: true, preserveScroll: true },
            );
        }
    };

    return (
        <div
            className={`flex flex-col gap-4 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between ${className}`}
        >
            <div className="flex flex-wrap items-center gap-3">
                {onPerPageChange || perPage !== undefined ? (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            Baris per halaman:
                        </span>
                        <Select
                            value={String(currentPerPage)}
                            onValueChange={handlePerPageChange}
                        >
                            <SelectTrigger className="h-8 w-[70px] text-xs">
                                <SelectValue
                                    placeholder={String(currentPerPage)}
                                />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {perPageOptions.map((opt) => (
                                    <SelectItem
                                        key={opt}
                                        value={String(opt)}
                                        className="text-xs"
                                    >
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ) : null}

                <div>
                    Menampilkan{' '}
                    <span className="font-medium text-foreground">{from}</span>{' '}
                    hingga{' '}
                    <span className="font-medium text-foreground">{to}</span>{' '}
                    dari{' '}
                    <span className="font-medium text-foreground">{total}</span>{' '}
                    {itemName}
                </div>
            </div>

            <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent className="gap-1">
                    <PaginationItem>
                        <PaginationPrevious
                            href={prevLink.url || '#'}
                            onClick={(e) => {
                                e.preventDefault();

                                if (prevLink.url) {
                                    handleNavigate(prevLink.url);
                                }
                            }}
                            className={
                                !prevLink.url
                                    ? 'pointer-events-none opacity-50'
                                    : 'cursor-pointer'
                            }
                        />
                    </PaginationItem>

                    {displayItems.map((item) => {
                        if (item.type === 'ellipsis') {
                            return (
                                <PaginationItem key={item.key}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        return (
                            <PaginationItem key={item.key}>
                                <PaginationLink
                                    href={item.url || '#'}
                                    isActive={item.active}
                                    onClick={(e) => {
                                        e.preventDefault();

                                        if (item.url && !item.active) {
                                            handleNavigate(item.url);
                                        }
                                    }}
                                    className={
                                        !item.url
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'
                                    }
                                >
                                    {item.page}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <PaginationNext
                            href={nextLink.url || '#'}
                            onClick={(e) => {
                                e.preventDefault();

                                if (nextLink.url) {
                                    handleNavigate(nextLink.url);
                                }
                            }}
                            className={
                                !nextLink.url
                                    ? 'pointer-events-none opacity-50'
                                    : 'cursor-pointer'
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
