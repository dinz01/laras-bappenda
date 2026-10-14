import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { KlasifikasiArsipOption } from '@/components/klasifikasi-arsip-select';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import type { LokasiArsipOption } from '@/components/lokasi-arsip-select';
import { RouteGuard } from '@/components/RouteGuard';
import { Button } from '@/components/ui/button';
import type { UnitOrganisasiOption } from '@/components/unit-organisasi-select';
import { index } from '@/routes/arsip';
import type { MasterItem } from './create-dialog';
import { ArsipCreateDialog } from './create-dialog';

type CreateProps = {
    klasifikasis?: KlasifikasiArsipOption[];
    kategoriArsips?: MasterItem[];
    jenisArsips?: MasterItem[];
    jenisDokumens?: MasterItem[];
    sifatArsips?: MasterItem[];
    tingkatPerkembanganArsips?: MasterItem[];
    unitOrganisasis?: UnitOrganisasiOption[];
    lokasiArsips?: LokasiArsipOption[];
    kondisiArsips?: MasterItem[];
    tingkatAksesArsips?: MasterItem[];
    statusArsips?: MasterItem[];
};

export default function Create(props: CreateProps) {
    const [open, setOpen] = useState(true);

    const handleClose = () => {
        setOpen(false);
        router.visit(index());
    };

    return (
        <RouteGuard permission="kelola-arsip.create">
            <Head title="Tambah Arsip" />
            <PageContainer>
                <PageHeader
                    title="Tambah Arsip"
                    description="Registrasi arsip baru ke dalam repositori"
                    breadcrumb={[
                        { title: 'UTAMA' },
                        { title: 'Repository Arsip', href: index() },
                        { title: 'Input Arsip Baru' },
                    ]}
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href={index()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    }
                />

                <ArsipCreateDialog
                    open={open}
                    onClose={handleClose}
                    {...props}
                />
            </PageContainer>
        </RouteGuard>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'UTAMA' },
        { title: 'Repositori Arsip', href: '/arsip' },
        { title: 'Tambah Arsip' },
    ],
};
