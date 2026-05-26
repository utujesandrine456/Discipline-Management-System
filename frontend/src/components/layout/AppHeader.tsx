import { Search, ChevronDown, LogOut, User, Settings, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = mounted ? (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <header className="app-header fixed top-0 right-0 left-0 md:left-16 lg:left-60 h-16 z-30 flex items-center justify-between px-6">
      <div className="flex flex-col ml-10 md:ml-0 justify-center">
        <h1 className="text-xl font-bold" style={{ color: 'white', lineHeight: '1.2' }}>{title}</h1>
        {subtitle && (
          <p className="text-[13px] font-medium text-white/70" style={{ fontFamily: 'Urbanist, sans-serif', lineHeight: '1' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">


        <div className="relative" ref={ref}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1 rounded-md hover:bg-white/10 transition-colors">
            <div className="avatar-circle w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              <span style={{ color: 'white', fontWeight: 600 }}>{initials}</span>
            </div>
            <ChevronDown className="chevron-icon h-4 w-4 hidden sm:block" style={{ color: 'white', opacity: 0.6 }} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[#0A0E2E] rounded-md shadow-2xl border border-white/10 py-2 animate-fade-in text-white/90">
              <button onClick={() => { setDropdownOpen(false); router.push('/discipline/settings'); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-white/10 transition-colors">
                <Settings className="h-4 w-4" /> Settings
              </button>
              <div className="h-px w-full bg-white/10 my-1" />
              <button onClick={() => { logout(); router.push('/login'); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header >
  );
}
