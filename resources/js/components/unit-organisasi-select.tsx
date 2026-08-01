import { useMemo, useState, useEffect } from 'react';
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
    const bidangList = useMemo(
        () => units.filter((u) => u.tipe === 'bidang'),
        [units],
    );

    const uptList = useMemo(
        () => units.filter((u) => u.tipe === 'upt'),
        [units],
    );

    // Turunkan kategori & bidang terpilih dari value yang sedang aktif
    const derived = useMemo(() => {
        if (!value) {
            return { kategori: '' as '' | 'bidang' | 'upt', bidangId: '' };
        }
        const selected = units.find((u) => u.id.toString() === value);
        if (!selected) {
            return { kategori: '' as '' | 'bidang' | 'upt', bidangId: '' };
        }
        if (selected.tipe === 'upt') {
            return { kategori: 'upt' as const, bidangId: '' };
        }
        if (selected.tipe === 'bidang') {
            return { kategori: 'bidang' as const, bidangId: selected.id.toString() };
        }
        // sub_bidang
        return {
            kategori: 'bidang' as const,
            bidangId: selected.parent_id?.toString() ?? '',
        };
    }, [value, units]);

    const [kategori, setKategori] = useState<'' | 'bidang' | 'upt'>(derived.kategori);
    const [selectedBidangId, setSelectedBidangId] = useState(derived.bidangId);

    useEffect(() => {
        setKategori(derived.kategori);
        setSelectedBidangId(derived.bidangId);
    }, [derived.kategori, derived.bidangId]);

    const subBidangList = useMemo(
        () =>
            units.filter(
                (u) => u.tipe === 'sub_bidang' && u.parent_id?.toString() === selectedBidangId,
            ),
        [units, selectedBidangId],
    );

    const handleKategoriChange = (val: 'bidang' | 'upt') => {
        setKategori(val);
        setSelectedBidangId('');
        onChange('');
    };

    const handleBidangChange = (bidangId: string) => {
        setSelectedBidangId(bidangId);
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
        const selectedUnit = units.find((u) => u.id.toString() === value);
        const parentUnit =
            selectedUnit?.tipe === 'sub_bidang' && selectedUnit.parent_id
                ? units.find((u) => u.id === selectedUnit.parent_id)
                : null;

        return (
            <div className="space-y-1.5">
                <Label>Unit Organisasi</Label>
                <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground">
                    {selectedUnit
                        ? parentUnit
                            ? `${parentUnit.kode} — ${parentUnit.nama} / ${selectedUnit.kode} — ${selectedUnit.nama}`
                            : `${selectedUnit.kode} — ${selectedUnit.nama}`
                        : 'Unit organisasi Anda belum diatur, hubungi Admin.'}
                </div>
                <p className="text-[10px] text-muted-foreground">
                    Otomatis sesuai unit organisasi akun Anda.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}_kategori`}>Kategori Unit</Label>
                <Select value={kategori} onValueChange={handleKategoriChange}>
                    <SelectTrigger id={`${idPrefix}_kategori`} className="border-border/60">
                        <SelectValue placeholder="Pilih kategori..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bidang">Bidang</SelectItem>
                        <SelectItem value="upt">UPT</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {kategori === 'bidang' && (
                <div className="space-y-1.5">
                    <Label htmlFor={`${idPrefix}_bidang`}>Bidang</Label>
                    <Select value={selectedBidangId} onValueChange={handleBidangChange}>
                        <SelectTrigger id={`${idPrefix}_bidang`} className="border-border/60">
                            <SelectValue placeholder="Pilih bidang..." />
                        </SelectTrigger>
                        <SelectContent>
                            {bidangList.map((opt) => (
                                <SelectItem key={opt.id} value={opt.id.toString()}>
                                    {opt.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {kategori === 'bidang' && selectedBidangId && subBidangList.length > 0 && (
                <div className="space-y-1.5">
                    <Label htmlFor={`${idPrefix}_sub_bidang`}>
                        Sub Bidang{' '}
                        <span className="text-xs font-normal text-muted-foreground">
                            (opsional)
                        </span>
                    </Label>
                    <Select
                        value={value !== selectedBidangId ? value : '__none__'}
                        onValueChange={handleSubBidangChange}
                    >
                        <SelectTrigger id={`${idPrefix}_sub_bidang`} className="border-border/60">
                            <SelectValue placeholder="Pilih sub bidang (opsional)..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none__">Tidak ada (langsung Bidang)</SelectItem>
                            {subBidangList.map((opt) => (
                                <SelectItem key={opt.id} value={opt.id.toString()}>
                                    {opt.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {kategori === 'upt' && (
                <div className="space-y-1.5">
                    <Label htmlFor={`${idPrefix}_upt`}>UPT</Label>
                    <Select value={value} onValueChange={handleUptChange}>
                        <SelectTrigger id={`${idPrefix}_upt`} className="border-border/60">
                            <SelectValue placeholder="Pilih UPT..." />
                        </SelectTrigger>
                        <SelectContent>
                            {uptList.map((opt) => (
                                <SelectItem key={opt.id} value={opt.id.toString()}>
                                    {opt.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}