import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { dashboard } from '@/routes';
import { index } from '@/routes/master/jenis-arsip';

export default function JenisArsipIndex() {
    return (
        <>
            <Head title="Jenis Arsip" />

            <PageContainer>
                <PageHeader
                    title="Jenis Arsip"
                    description="Manajemen data jenis dan kategori dokumen arsip."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Jenis Arsip', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Jenis Arsip" />
            </PageContainer>
        </>
    );
}
