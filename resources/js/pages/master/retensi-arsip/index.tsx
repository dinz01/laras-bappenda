import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { dashboard } from '@/routes';
import { index } from '@/routes/master/retensi-arsip';

export default function RetensiArsipIndex() {
    return (
        <>
            <Head title="Retensi Arsip" />

            <PageContainer>
                <PageHeader
                    title="Retensi Arsip"
                    description="Manajemen jadwal retensi dan masa simpan arsip."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Retensi Arsip', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Retensi Arsip" />
            </PageContainer>
        </>
    );
}
