import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { dashboard } from '@/routes';
import { index } from '@/routes/master/lokasi-arsip';

export default function LokasiArsipIndex() {
    return (
        <>
            <Head title="Lokasi Arsip" />

            <PageContainer>
                <PageHeader
                    title="Lokasi Arsip"
                    description="Manajemen data lokasi penyimpanan fisik arsip."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Lokasi Arsip', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Lokasi Arsip" />
            </PageContainer>
        </>
    );
}
