import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type LokasiArsipOption = {
    id: number;
    kode: string;
    nama: string;
    parent_id?: number | null;
};

type LokasiArsipSelectProps = {
    lokasis: LokasiArsipOption[];
    value: string;
    onChange: (val: string) => void;
    idPrefix?: string;
};

function getLevelLabel(index: number): string {
    switch (index) {
        case 0:
            return 'Lokasi';
        case 1:
            return 'Lantai';
        case 2:
            return 'Ruangan';
        case 3:
            return 'Rak';
        case 4:
        default:
            return 'Box';
    }
}

export function LokasiArsipSelect({
    lokasis,
    value,
    onChange,
    idPrefix = 'lokasi',
}: LokasiArsipSelectProps) {
    const lokasiMap = useMemo(() => {
        const map = new Map<string, LokasiArsipOption>();

        for (const item of lokasis) {
            map.set(item.id.toString(), item);
        }

        return map;
    }, [lokasis]);

    const childrenMap = useMemo(() => {
        const map = new Map<string | null, LokasiArsipOption[]>();

        for (const item of lokasis) {
            const parentKey =
                item.parent_id != null ? item.parent_id.toString() : null;

            if (!map.has(parentKey)) {
                map.set(parentKey, []);
            }

            map.get(parentKey)!.push(item);
        }

        return map;
    }, [lokasis]);

    const derivedChain = useMemo(() => {
        if (!value) {
            return [];
        }

        const selected = lokasiMap.get(value);

        if (!selected) {
            return [];
        }

        const chain: string[] = [];
        let curr: LokasiArsipOption | undefined = selected;

        while (curr) {
            chain.unshift(curr.id.toString());
            curr =
                curr.parent_id != null
                    ? lokasiMap.get(curr.parent_id.toString())
                    : undefined;
        }

        return chain;
    }, [value, lokasiMap]);

    const [selectedChain, setSelectedChain] = useState<string[]>(derivedChain);

    useEffect(() => {
        queueMicrotask(() => {
            setSelectedChain(derivedChain);
        });
    }, [derivedChain]);

    const levelsToRender = useMemo(() => {
        const levels: {
            parentId: string | null;
            selectedId: string;
            options: LokasiArsipOption[];
        }[] = [];

        const rootOptions = childrenMap.get(null) ?? [];

        if (rootOptions.length === 0) {
            return levels;
        }

        levels.push({
            parentId: null,
            selectedId: selectedChain[0] ?? '',
            options: rootOptions,
        });

        for (let i = 0; i < selectedChain.length; i++) {
            const currentSelectedId = selectedChain[i];

            if (!currentSelectedId) {
                break;
            }

            const childOptions = childrenMap.get(currentSelectedId) ?? [];

            if (childOptions.length > 0) {
                levels.push({
                    parentId: currentSelectedId,
                    selectedId: selectedChain[i + 1] ?? '',
                    options: childOptions,
                });
            }
        }

        return levels;
    }, [selectedChain, childrenMap]);

    const hasNoData = useMemo(
        () => (childrenMap.get(null) ?? []).length === 0,
        [childrenMap],
    );

    const handleSelectLevel = (levelIndex: number, newValue: string) => {
        const nextChain = [...selectedChain.slice(0, levelIndex)];

        if (newValue) {
            nextChain.push(newValue);
        }

        setSelectedChain(nextChain);

        const finalSelectedId = nextChain[nextChain.length - 1] ?? '';

        onChange(finalSelectedId);
    };

    return (
        <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
                {hasNoData ? (
                    <div className="min-w-0 space-y-1.5">
                        <Label className="block truncate text-xs">
                            Lokasi <span className="text-destructive">*</span>
                        </Label>
                        <Select disabled>
                            <SelectTrigger className="w-full min-w-0 overflow-hidden border-border/60 text-left [&>span]:block [&>span]:w-full [&>span]:truncate">
                                <SelectValue placeholder="Belum ada data lokasi" />
                            </SelectTrigger>
                            <SelectContent />
                        </Select>
                        <p className="text-[10px] text-muted-foreground">
                            Data lokasi arsip belum tersedia. Hubungi Admin.
                        </p>
                    </div>
                ) : (
                    levelsToRender.map((lvl, index) => {
                        const label = getLevelLabel(index);
                        const isRequired = index === 0;

                        return (
                            <div
                                key={lvl.parentId ?? 'root'}
                                className="min-w-0 space-y-1.5"
                            >
                                <Label
                                    htmlFor={`${idPrefix}-lvl-${index}`}
                                    className="block truncate text-xs"
                                >
                                    {label}{' '}
                                    {isRequired && (
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    )}
                                </Label>
                                <Select
                                    value={lvl.selectedId}
                                    onValueChange={(val) =>
                                        handleSelectLevel(index, val)
                                    }
                                >
                                    <SelectTrigger
                                        id={`${idPrefix}-lvl-${index}`}
                                        className="w-full min-w-0 overflow-hidden border-border/60 text-left [&>span]:block [&>span]:w-full [&>span]:truncate"
                                    >
                                        <SelectValue
                                            placeholder={`Pilih ${label}...`}
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
                                        {lvl.options.map((item) => (
                                            <SelectItem
                                                key={item.id}
                                                value={item.id.toString()}
                                            >
                                                <span
                                                    className="block truncate"
                                                    title={`${item.kode} — ${item.nama}`}
                                                >
                                                    {item.kode} — {item.nama}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
