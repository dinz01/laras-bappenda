import { router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Forbidden } from '@/components/Common/forbidden';
import { usePermission } from '@/hooks/use-permission';

interface RouteGuardProps {
    permission?: string | string[];
    role?: string | string[];
    requireAll?: boolean;
    fallback?: ReactNode;
    children: ReactNode;
}

export function RouteGuard({
    permission,
    role,
    requireAll = false,
    fallback,
    children,
}: RouteGuardProps) {
    const { can, canAll, hasRole } = usePermission();

    let authorized = true;

    if (permission) {
        if (Array.isArray(permission)) {
            authorized = requireAll ? canAll(permission) : can(permission);
        } else {
            authorized = can(permission);
        }
    }

    if (role && authorized) {
        authorized = hasRole(role);
    }

    if (!authorized) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <Forbidden
                onBack={() => router.visit('/dashboard')}
                backLabel="Kembali ke Dashboard"
            />
        );
    }

    return <>{children}</>;
}

export default RouteGuard;
