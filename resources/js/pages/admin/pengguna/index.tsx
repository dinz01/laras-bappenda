import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { dashboard } from '@/routes';
import { index } from '@/routes/admin/pengguna';

export default function PenggunaIndex() {
    return (
        <>
            <Head title="Pengguna" />

            <PageContainer>
                <PageHeader
                    title="Pengguna"
                    description="Manajemen akun pengguna sistem LARAS."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Administrasi', href: '#' },
                        { title: 'Pengguna', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Pengguna" />
            </PageContainer>
        </>
    );
}
