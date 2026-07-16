import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { dashboard } from '@/routes';
import { index } from '@/routes/master/jabatan';

export default function JabatanIndex() {
    return (
        <>
            <Head title="Jabatan" />

            <PageContainer>
                <PageHeader
                    title="Jabatan"
                    description="Manajemen data jabatan dalam struktur organisasi."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Jabatan', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Jabatan" />
            </PageContainer>
        </>
    );
}
