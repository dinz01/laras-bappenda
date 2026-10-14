import { usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type UnitOrganisasiOption = {
    id: number;
    kode: string;
    nama: string;
    tipe: 'bidang' | 'sub_bidang' | 'upt';
    parent_id: number | null;
};

type UnitOrganisasiSelectProps = {
    units: UnitOrganisasiOption[];
    value: string;
    onChange: (val: string) => void;
    error?: string;
    idPrefix?: string;
    locked?: boolean;
};

export function UnitOrganisasiSelect({
    units,
    value,
    onChange,
    idPrefix = 'unit',
    locked = false,
}: UnitOrganisasiSelectProps) {
    const { auth } = usePage<{
        auth: {
            user: {
                unit_organisasi_id?: number | null;
                unit_organisasi?: {
                    id: number;
                    kode: string;
                    nama: string;
                    tipe: string;
                    parent_id: number | null;
                    parent?: {
                        id: number;
                        kode: string;
                        nama: string;
                    } | null;
                } | null;
            } | null;
        };
    }>().props;

    const currentUnit = useMemo(
        () =>
            value
                ? units.find((u) => u.id.toString() === value.toString())
                : undefined,
        [units, value],
    );

    const derivedKategori: 'bidang' | 'upt' | '' = useMemo(() => {
        if (!currentUnit) {
            return '';
        }

        if (currentUnit.tipe === 'upt') {
            return 'upt';
        }

        if (
            currentUnit.tipe === 'bidang' ||
            currentUnit.tipe === 'sub_bidang'
        ) {
            return 'bidang';
        }

        return '';
    }, [currentUnit]);

    const derivedBidangId: string = useMemo(() => {
        if (!currentUnit) {
            return '';
        }

        if (currentUnit.tipe === 'bidang') {
            return currentUnit.id.toString();
        }

        if (currentUnit.tipe === 'sub_bidang') {
            return currentUnit.parent_id
                ? currentUnit.parent_id.toString()
                : '';
        }

        return '';
    }, [currentUnit]);

    const [manualKategori, setManualKategori] = useState<'bidang' | 'upt' | ''>(
        '',
    );
    const [manualBidangId, setManualBidangId] = useState<string>('');

    const kategori = derivedKategori || manualKategori;
    const selectedBidangId = derivedBidangId || manualBidangId;

    const bidangList = useMemo(
        () => units.filter((u) => u.tipe === 'bidang'),
        [units],
    );

    const uptList = useMemo(
        () => units.filter((u) => u.tipe === 'upt'),
        [units],
    );

    const subBidangList = useMemo(() => {
        if (!selectedBidangId) {
            return [];
        }

        return units.filter(
            (u) =>
                u.tipe === 'sub_bidang' &&
                u.parent_id?.toString() === selectedBidangId.toString(),
        );
    }, [units, selectedBidangId]);

    const handleKategoriChange = (val: 'bidang' | 'upt') => {
        setManualKategori(val);
        setManualBidangId('');
        onChange('');
    };

    const handleBidangChange = (bidangId: string) => {
        setManualBidangId(bidangId);
        // Default: pilih Bidang itu sendiri, bisa ditimpa lagi kalau pilih sub bidang
        onChange(bidangId);
    };

    const handleSubBidangChange = (val: string) => {
        onChange(val === '__none__' ? selectedBidangId : val);
    };

    const handleUptChange = (uptId: string) => {
        onChange(uptId);
    };

    if (locked) {
        const effectiveUnitId =
            value || auth?.user?.unit_organisasi_id?.toString() || '';
        const selectedUnit = units.find(
            (u) => u.id.toString() === effectiveUnitId,
        );
        const parentUnit =
            selectedUnit?.tipe === 'sub_bidang' && selectedUnit.parent_id
                ? units.find((u) => u.id === selectedUnit.parent_id)
                : null;

        const authUserUnit = auth?.user?.unit_organisasi;

        let displayText = '';

        if (selectedUnit) {
            displayText = parentUnit
                ? `${parentUnit.kode} — ${parentUnit.nama} / ${selectedUnit.kode} — ${selectedUnit.nama}`
                : `${selectedUnit.kode} — ${selectedUnit.nama}`;
        } else if (authUserUnit) {
            displayText = authUserUnit.parent
                ? `${authUserUnit.parent.kode} — ${authUserUnit.parent.nama} / ${authUserUnit.kode} — ${authUserUnit.nama}`
                : `${authUserUnit.kode} — ${authUserUnit.nama}`;
        } else {
            displayText = 'Unit organisasi Anda belum diatur, hubungi Admin.';
        }

        return (
            <div className="space-y-1.5">
                <Label>
                    Unit Organisasi <span className="text-destructive">*</span>
                </Label>
                <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground">
                    {displayText}
                </div>
                <p className="text-[10px] text-muted-foreground">
                    Otomatis sesuai unit organisasi akun Anda.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="min-w-0 space-y-1.5">
                <Label htmlFor={`${idPrefix}_kategori`}>
                    Kategori Unit <span className="text-destructive">*</span>
                </Label>
                <Select
                    value={kategori}
                    onValueChange={handleKategoriChange}
                    disabled={units.length === 0}
                >
                    <SelectTrigger
                        id={`${idPrefix}_kategori`}
                        className="w-full min-w-0 overflow-hidden border-border/60 text-left [&>span]:block [&>span]:w-full [&>span]:truncate"
                    >
                        <SelectValue
                            placeholder={
                                units.length === 0
                                    ? 'Belum ada data unit organisasi'
                                    : 'Pilih kategori...'
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {units.length === 0 ? (
                            <SelectItem disabled value="__empty__">
                                Belum ada data unit organisasi
                            </SelectItem>
                        ) : (
                            <>
                                <SelectItem value="bidang">Bidang</SelectItem>
                                <SelectItem value="upt">UPT</SelectItem>
                            </>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {kategori === 'bidang' && (
                <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`${idPrefix}_bidang`}>
                        Bidang <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={selectedBidangId}
                        onValueChange={handleBidangChange}
                        disabled={bidangList.length === 0}
                    >
                        <SelectTrigger
                            id={`${idPrefix}_bidang`}
                            className="w-full min-w-0 overflow-hidden border-border/60 text-left [&>span]:block [&>span]:w-full [&>span]:truncate"
                        >
                            <SelectValue
                                placeholder={
                                    bidangList.length === 0
                                        ? 'Belum ada data bidang'
                                        : 'Pilih bidang...'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
                            {bidangList.length === 0 ? (
                                <SelectItem disabled value="__empty__">
                                    Belum ada data bidang
                                </SelectItem>
                            ) : (
                                bidangList.map((opt) => (
                                    <SelectItem
                                        key={opt.id}
                                        value={opt.id.toString()}
                                    >
                                        <span
                                            className="block truncate"
                                            title={opt.nama}
                                        >
                                            {opt.nama}
                                        </span>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {kategori === 'bidang' &&
                selectedBidangId &&
                subBidangList.length > 0 && (
                    <div className="min-w-0 space-y-1.5">
                        <Label htmlFor={`${idPrefix}_sub_bidang`}>
                            Sub Bidang{' '}
                            <span className="text-xs font-normal text-muted-foreground">
                                (opsional)
                            </span>
                        </Label>
                        <Select
                            value={
                                value !== selectedBidangId ? value : '__none__'
                            }
                            onValueChange={handleSubBidangChange}
                        >
                            <SelectTrigger
                                id={`${idPrefix}_sub_bidang`}
                                className="w-full min-w-0 overflow-hidden border-border/60 text-left [&>span]:block [&>span]:w-full [&>span]:truncate"
                            >
                                <SelectValue placeholder="Pilih sub bidang (opsional)..." />
                            </SelectTrigger>
                            <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
                                <SelectItem value="__none__">
                                    Tidak ada (langsung Bidang)
                                </SelectItem>
                                {subBidangList.map((opt) => (
                                    <SelectItem
                                        key={opt.id}
                                        value={opt.id.toString()}
                                    >
                                        <span
                                            className="block truncate"
                                            title={opt.nama}
                                        >
                                            {opt.nama}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

            {kategori === 'upt' && (
                <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`${idPrefix}_upt`}>
                        UPT <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={value}
                        onValueChange={handleUptChange}
                        disabled={uptList.length === 0}
                    >
                        <SelectTrigger
                            id={`${idPrefix}_upt`}
                            className="w-full min-w-0 overflow-hidden border-border/60 text-left [&>span]:block [&>span]:w-full [&>span]:truncate"
                        >
                            <SelectValue
                                placeholder={
                                    uptList.length === 0
                                        ? 'Belum ada data UPT'
                                        : 'Pilih UPT...'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
                            {uptList.length === 0 ? (
                                <SelectItem disabled value="__empty__">
                                    Belum ada data UPT
                                </SelectItem>
                            ) : (
                                uptList.map((opt) => (
                                    <SelectItem
                                        key={opt.id}
                                        value={opt.id.toString()}
                                    >
                                        <span
                                            className="block truncate"
                                            title={opt.nama}
                                        >
                                            {opt.nama}
                                        </span>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}
