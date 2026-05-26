import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        // If we're on a client-side transition and not authenticated, redirect
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    // Avoid hydration mismatch by waiting for mount
    if (!mounted || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0E2E]">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
