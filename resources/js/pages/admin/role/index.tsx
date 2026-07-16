import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { dashboard } from '@/routes';
import { index } from '@/routes/admin/role';

export default function RoleIndex() {
    return (
        <>
            <Head title="Role" />

            <PageContainer>
                <PageHeader
                    title="Role"
                    description="Manajemen peran pengguna dan hak akses sistem."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Administrasi', href: '#' },
                        { title: 'Role', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Role" />
            </PageContainer>
        </>
    );
}
