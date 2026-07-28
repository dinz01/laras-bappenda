import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { RouteGuard } from '@/components/RouteGuard';
import { dashboard } from '@/routes';
import { index } from '@/routes/permohonan';

export default function PermohonanIndex() {
    return (
        <RouteGuard permission="workflow.view">
            <Head title="Permohonan Arsip" />

            <PageContainer>
                <PageHeader
                    title="Permohonan Arsip"
                    description="Pengelolaan permohonan peminjaman dan akses arsip."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Permohonan Arsip', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Permohonan Arsip" />
            </PageContainer>
        </RouteGuard>
    );
}
