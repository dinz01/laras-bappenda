import { Head } from '@inertiajs/react';
import { UnderDevelopment } from '@/components/Common/under-development';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { RouteGuard } from '@/components/RouteGuard';
import { dashboard } from '@/routes';
import { index } from '@/routes/pemusnahan';

export default function PemusnahanIndex() {
    return (
        <RouteGuard permission="arsip.delete">
            <Head title="Pemusnahan Arsip" />

            <PageContainer>
                <PageHeader
                    title="Pemusnahan Arsip"
                    description="Pengelolaan proses pemusnahan arsip yang telah habis masa retensinya."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Pemusnahan Arsip', href: index.url() },
                    ]}
                />

                <UnderDevelopment featureName="Pemusnahan Arsip" />
            </PageContainer>
        </RouteGuard>
    );
}
