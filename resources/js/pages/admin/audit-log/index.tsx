import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { dashboard } from '@/routes';
import { index } from '@/routes/admin/audit-log';

export default function AuditLogIndex() {
    return (
        <>
            <Head title="Audit Log" />

            <PageContainer>
                <PageHeader
                    title="Audit Log"
                    description="Riwayat aktivitas dan jejak audit seluruh pengguna sistem."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Administrasi', href: '#' },
                        { title: 'Audit Log', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Audit Log" />
            </PageContainer>
        </>
    );
}
