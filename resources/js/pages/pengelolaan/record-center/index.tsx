import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { dashboard } from '@/routes';
import { index } from '@/routes/record-center';

export default function RecordCenterIndex() {
    return (
        <>
            <Head title="Record Center" />

            <PageContainer>
                <PageHeader
                    title="Record Center"
                    description="Manajemen arsip inaktif yang disimpan di record center."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Record Center', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Record Center" />
            </PageContainer>
        </>
    );
}
