import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type KlasifikasiArsipOption = {
    id: number;
    kode: string;
    nama: string;
    parent_id?: number | null;
    retensi_aktif?: number | null;
    retensi_inaktif?: number | null;
    nasib_akhir?: { id: number; nama: string } | null;
};

type KlasifikasiArsipSelectProps = {
    klasifikasis: KlasifikasiArsipOption[];
    value: string;
    onChange: (val: string) => void;
    idPrefix?: string;
};

function getLevelLabel(index: number): string {
    switch (index) {
        case 0:
            return 'Klasifikasi Utama';
        case 1:
            return 'Sub Klasifikasi';
        case 2:
            return 'Rincian Klasifikasi';
        case 3:
            return 'Sub Rincian Klasifikasi';
        default:
            return `Rincian Klasifikasi (Tingkat ${index + 1})`;
    }
}

export function KlasifikasiArsipSelect({
    klasifikasis,
    value,
    onChange,
    idPrefix = 'klasifikasi',
}: KlasifikasiArsipSelectProps) {
    // Build quick lookup map by ID
    const klasifikasiMap = useMemo(() => {
        const map = new Map<string, KlasifikasiArsipOption>();

        for (const item of klasifikasis) {
            map.set(item.id.toString(), item);
        }

        return map;
    }, [klasifikasis]);

    // Build children map: parentId -> children list
    const childrenMap = useMemo(() => {
        const map = new Map<string | null, KlasifikasiArsipOption[]>();

        for (const item of klasifikasis) {
            const parentKey =
                item.parent_id != null ? item.parent_id.toString() : null;

            if (!map.has(parentKey)) {
                map.set(parentKey, []);
            }

            map.get(parentKey)!.push(item);
        }

        return map;
    }, [klasifikasis]);

    // Derive active selection chain [l1Id, l2Id, l3Id, ...] from current value
    const derivedChain = useMemo(() => {
        if (!value) {
            return [];
        }

        const selected = klasifikasiMap.get(value);

        if (!selected) {
            return [];
        }

        const chain: string[] = [];
        let curr: KlasifikasiArsipOption | undefined = selected;

        while (curr) {
            chain.unshift(curr.id.toString());
            curr =
                curr.parent_id != null
                    ? klasifikasiMap.get(curr.parent_id.toString())
                    : undefined;
        }

        return chain;
    }, [value, klasifikasiMap]);

    const [selectedChain, setSelectedChain] = useState<string[]>(derivedChain);

    useEffect(() => {
        queueMicrotask(() => {
            setSelectedChain(derivedChain);
        });
    }, [derivedChain]);

    // Determine all active levels to render
    const levelsToRender = useMemo(() => {
        const levels: {
            parentId: string | null;
            selectedId: string;
            options: KlasifikasiArsipOption[];
        }[] = [];

        // Level 0 (root)
        const rootOptions = childrenMap.get(null) ?? [];

        if (rootOptions.length === 0) {
            return levels;
        }

        levels.push({
            parentId: null,
            selectedId: selectedChain[0] ?? '',
            options: rootOptions,
        });

        // Add subsequent levels as long as the previous level has a selection and that item has children
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

    const handleSelectLevel = (levelIndex: number, newValue: string) => {
        const nextChain = [...selectedChain.slice(0, levelIndex)];

        if (newValue) {
            nextChain.push(newValue);
        }

        setSelectedChain(nextChain);

        const finalSelectedId = nextChain[nextChain.length - 1] ?? '';

        onChange(finalSelectedId);
    };

    const activeSelected = useMemo(() => {
        const lastId = selectedChain[selectedChain.length - 1];

        return lastId ? klasifikasiMap.get(lastId) : undefined;
    }, [selectedChain, klasifikasiMap]);

    return (
        <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
                {levelsToRender.map((lvl, index) => {
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
                                    <span className="text-destructive">*</span>
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
                })}
            </div>

            {activeSelected &&
                (activeSelected.retensi_aktif != null ||
                    activeSelected.retensi_inaktif != null) && (
                    <p className="truncate rounded border border-border/40 bg-muted/30 px-2.5 py-1 text-[11px] text-muted-foreground">
                        Retensi:{' '}
                        <span className="font-semibold text-foreground">
                            {activeSelected.retensi_aktif ?? 0} thn aktif +{' '}
                            {activeSelected.retensi_inaktif ?? 0} thn inaktif
                        </span>
                        {activeSelected.nasib_akhir?.nama && (
                            <span>
                                {' '}
                                — Nasib Akhir:{' '}
                                <strong>
                                    {activeSelected.nasib_akhir.nama}
                                </strong>
                            </span>
                        )}
                    </p>
                )}
        </div>
    );
}
