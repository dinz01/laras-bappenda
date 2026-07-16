import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { dashboard } from '@/routes';
import { index } from '@/routes/master/unit-organisasi';

export default function UnitOrganisasiIndex() {
    return (
        <>
            <Head title="Unit Organisasi" />

            <PageContainer>
                <PageHeader
                    title="Unit Organisasi"
                    description="Manajemen data unit organisasi dalam struktur instansi."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Unit Organisasi', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Unit Organisasi" />
            </PageContainer>
        </>
    );
}
