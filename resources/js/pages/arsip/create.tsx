import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { Button } from '@/components/ui/button';
import { ArsipCreateDialog, MasterItem } from './create-dialog';
import { index, create } from '@/routes/arsip';

type CreateProps = {
    klasifikasis?: MasterItem[];
    jenisArsips?: MasterItem[];
    jenisDokumens?: MasterItem[];
    sifatArsips?: MasterItem[];
    tingkatPerkembanganArsips?: MasterItem[];
    unitOrganisasis?: MasterItem[];
    lokasiArsips?: MasterItem[];
    statusArsips?: MasterItem[];
};

export default function Create(props: CreateProps) {
    const [open, setOpen] = useState(true);

    const handleClose = () => {
        setOpen(false);
        router.visit(index());
    };

    return (
        <>
            <Head title="Tambah Arsip" />
            <PageContainer>
                <PageHeader
                    title="Tambah Arsip"
                    description="Registrasi arsip baru ke dalam repositori"
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Repository Arsip', href: index() },
                        { title: 'Tambah', href: create() },
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
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Repository Arsip', href: '/arsip' },
        { title: 'Tambah', href: '/arsip/create' },
    ],
};
