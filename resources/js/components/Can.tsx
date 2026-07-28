import type { ReactNode } from 'react';
import { usePermission } from '@/hooks/use-permission';

interface CanProps {
    permission?: string | string[];
    role?: string | string[];
    requireAll?: boolean;
    fallback?: ReactNode;
    children: ReactNode;
}

export function Can({
    permission,
    role,
    requireAll = false,
    fallback = null,
    children,
}: CanProps) {
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
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
}

export default Can;
