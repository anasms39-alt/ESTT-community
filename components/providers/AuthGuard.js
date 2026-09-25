'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const publicPaths = ['/login', '/signup', '/verify-success'];

export default function AuthGuard({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

    useEffect(() => {
        if (!loading && !user && !isPublicPath) {
            const query = window.location.search;
            const requestedPath = `${pathname}${query ? `?${query}` : ''}`;
            router.replace(`/login?redirect=${encodeURIComponent(requestedPath)}`);
        }
    }, [isPublicPath, loading, pathname, router, user]);

    if (loading || (!user && !isPublicPath)) {
        return null;
    }

    return children;
}