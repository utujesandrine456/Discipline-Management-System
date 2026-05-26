import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Users, FileText, DoorOpen, Settings, Menu, X, UserCheck, Bus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/RCA/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const navItems = [
  { label: 'Dashboard', path: '/discipline/dashboard', icon: LayoutDashboard, queryKey: ['students', 'records', 'staff'] },
  { label: 'Students', path: '/discipline/students', icon: Users, queryKey: ['students'] },
  { label: 'Staff Management', path: '/discipline/staff', icon: UserCheck, queryKey: ['staff'] },
  { label: 'Transport Management', path: '/discipline/transport', icon: Bus, queryKey: ['transport-routes'] },
  { label: 'Discipline Records', path: '/discipline/records', icon: FileText, queryKey: ['records'] },
  { label: 'Leave Permits', path: '/discipline/permits', icon: DoorOpen, queryKey: ['records'] },
  { label: 'Settings', path: '/discipline/settings', icon: Settings, queryKey: [] },
];

export function AppSidebar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const prefetchData = (keys: string[]) => {
    keys.forEach(key => {
      queryClient.prefetchQuery({
        queryKey: [key],
        queryFn: () => {
          if (key === 'transport-routes') return apiFetch('/transport');
          return apiFetch(`/${key}`);
        },
        staleTime: 1000 * 60 * 5,
      });
    });
  };

  const isActive = (path: string) => router.asPath.startsWith(path);

  const nav = (
    <div className="flex flex-col h-full">
      <div className="pt-10 px-12 pb-6">
        <Link href="/discipline/dashboard" className="flex items-center gap-2">
          <img src="/rca-logo.jpg" alt="RCA Logo" className="h-8 w-8 rounded-md object-contain bg-white" />
          <span className="text-xl font-bold text-white">RCA</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => setMobileOpen(false)}
            onMouseEnter={() => prefetchData(item.queryKey)}
            className={cn(
              'sidebar-nav-link',
              isActive(item.path) && 'active'
            )}
          >
            <item.icon className="nav-icon h-5 w-5 shrink-0" />
            <span className="hidden lg:inline">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/8">
        <div className="flex items-center gap-3">
          <Avatar name={mounted ? (user?.name || 'User') : 'User'} size="sm" />
          <div className="hidden lg:block min-w-0">
            <p className="text-sm font-medium text-white truncate">{mounted ? user?.name : '...'}</p>
            <p className="text-xs text-white/50 truncate">{mounted ? user?.email : '...'}</p>
          </div>
        </div>
        <Link href="/" className="sidebar-back-link mt-4 block text-center">
          Back to home
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-card shadow-sm border md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-60 bg-[#0A0E2E]">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {nav}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-16 lg:w-60 bg-[#0A0E2E] border-r border-white/8 z-40">
        {nav}
      </aside>
    </>
  );
}
