import { usePage } from '@inertiajs/react';

export function usePermission() {
    const { auth } = usePage().props;
    const user = auth?.user as {
        roles?: string[];
        permissions?: string[];
    } | null;

    const roles = user?.roles ?? [];
    const permissions = user?.permissions ?? [];
    const isSuperAdmin = roles.includes('Super Administrator');

    const can = (permission?: string | string[] | null): boolean => {
        if (!permission) {
            return true;
        }

        if (isSuperAdmin) {
            return true;
        }

        if (Array.isArray(permission)) {
            return permission.some((p) => permissions.includes(p));
        }

        return permissions.includes(permission);
    };

    const canAny = (perms: string[]): boolean => {
        if (isSuperAdmin) {
            return true;
        }

        return perms.some((p) => permissions.includes(p));
    };

    const canAll = (perms: string[]): boolean => {
        if (isSuperAdmin) {
            return true;
        }

        return perms.every((p) => permissions.includes(p));
    };

    const hasRole = (role?: string | string[] | null): boolean => {
        if (!role) {
            return true;
        }

        if (Array.isArray(role)) {
            return role.some((r) => roles.includes(r));
        }

        return roles.includes(role);
    };

    return {
        can,
        canAny,
        canAll,
        hasRole,
        isSuperAdmin,
        permissions,
        roles,
    };
}
