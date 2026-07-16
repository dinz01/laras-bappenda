import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { dashboard } from '@/routes';
import { index } from '@/routes/admin/permission';

export default function PermissionIndex() {
    return (
        <>
            <Head title="Permission" />

            <PageContainer>
                <PageHeader
                    title="Permission"
                    description="Manajemen izin akses terperinci untuk setiap fitur sistem."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Administrasi', href: '#' },
                        { title: 'Permission', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Permission" />
            </PageContainer>
        </>
    );
}
