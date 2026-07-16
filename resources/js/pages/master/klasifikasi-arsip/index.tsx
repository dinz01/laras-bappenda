import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { dashboard } from '@/routes';
import { index } from '@/routes/master/klasifikasi-arsip';

export default function KlasifikasiArsipIndex() {
    return (
        <>
            <Head title="Klasifikasi Arsip" />

            <PageContainer>
                <PageHeader
                    title="Klasifikasi Arsip"
                    description="Manajemen kode klasifikasi arsip sesuai standar kearsipan."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Klasifikasi Arsip', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Klasifikasi Arsip" />
            </PageContainer>
        </>
    );
}
