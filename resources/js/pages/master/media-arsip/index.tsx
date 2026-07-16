import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { dashboard } from '@/routes';
import { index } from '@/routes/master/media-arsip';

export default function MediaArsipIndex() {
    return (
        <>
            <Head title="Media Arsip" />

            <PageContainer>
                <PageHeader
                    title="Media Arsip"
                    description="Manajemen data media dan format penyimpanan arsip."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Media Arsip', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Media Arsip" />
            </PageContainer>
        </>
    );
}
