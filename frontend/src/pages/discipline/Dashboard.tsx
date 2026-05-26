import { useState, useEffect } from 'react';
import { Users, Activity, Zap, Shield, Search, ShieldAlert, FileText, DoorOpen, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/layout/AppHeader';
import { StatusBadge } from '@/components/RCA/Badges';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export default function DisciplineDashboard() {
  const [dateStr, setDateStr] = useState<string>('');
  const { user } = useAuthStore();

  const { data: students = [], isLoading: loadingStudents } = useQuery<any[]>({
    queryKey: ['students'],
    queryFn: () => apiFetch('/students'),
    staleTime: 1000 * 60 * 5,
  });

  const { data: records = [], isLoading: loadingRecords } = useQuery<any[]>({
    queryKey: ['records'],
    queryFn: () => apiFetch('/records'),
    staleTime: 1000 * 60 * 2,
  });

  const { data: staff = [], isLoading: loadingStaff } = useQuery<any[]>({
    queryKey: ['staff'],
    queryFn: () => apiFetch('/staff'),
    staleTime: 1000 * 60 * 10,
  });

  // No global loading variable to prevent blocking the whole UI

  useEffect(() => {
    // Set date only on client to avoid hydration mismatch
    const today = new Date();
    setDateStr(today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
  }, []);

  const activePermitsCount = records.filter(r => r.status === 'OUT').length;
  const recentRecords = records.slice(0, 5);

  const stats = [
    { label: 'Students', value: students.length, icon: Users },
    { label: 'Staff', value: staff.length, icon: UserCheck },
    { label: 'Discipline Records', value: records.length, icon: FileText },
    { label: 'Leave Permits', value: records.filter(r => r.status === 'OUT').length, icon: DoorOpen },
  ];


  return (
    <div className="min-h-screen bg-white font-sans text-[#0A0E2E]">
      <AppHeader title="Dashboard" subtitle="System Analytics & Overview" />
      <div className="mx-auto max-w-7xl px-6 py-8 animate-in fade-in duration-1000">

        <div className="mb-10 flex flex-col justify-between gap-4 rounded-md border border-[#0A0E2E]/15 bg-[#0A0E2E] p-10 shadow-xl shadow-[#0A0E2E]/20 md:flex-row md:items-end relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-white">Dashboard Overview</h2>
            <p className="mt-2 flex items-center gap-2 text-[14px] font-medium text-white/70">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Authenticated as {user?.name || 'Administrator'} • {dateStr}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 relative z-10">
            <Link href="/discipline/records/new" className="rounded-md bg-white px-5 py-2.5 text-sm font-bold text-[#0A0E2E] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10">
              New Record
            </Link>
            <Link href="/discipline/records" className="rounded-md border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10">
              View All
            </Link>
          </div>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Students', value: students.length, icon: Users, loading: loadingStudents },
            { label: 'Staff', value: staff.length, icon: UserCheck, loading: loadingStaff },
            { label: 'Discipline Records', value: records.length, icon: FileText, loading: loadingRecords },
            { label: 'Leave Permits', value: activePermitsCount, icon: DoorOpen, loading: loadingRecords },
          ].map((stat) => (
            <div key={stat.label} className="group relative overflow-hidden rounded-md border border-[#0A0E2E]/15 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0A0E2E]/10">
              <div className="absolute right-0 top-0 p-3 opacity-[0.06] transition-opacity group-hover:opacity-[0.1]">
                <stat.icon size={76} className="text-[#0A0E2E]" />
              </div>
              <div className="relative z-10">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-[#0A0E2E]/15 bg-[#0A0E2E]">
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-[12px] font-bold text-[#0A0E2E]/70">{stat.label}</p>
                <div className="mt-1 flex items-end gap-3">
                  {stat.loading ? (
                    <div className="h-9 w-16 bg-[#0A0E2E]/5 rounded animate-pulse" />
                  ) : (
                    <p className="text-3xl font-black leading-none text-[#0A0E2E]">{stat.value}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-md border border-[#0A0E2E]/15 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#0A0E2E]/10 p-6">
                <div>
                  <h2 className="text-lg font-bold text-[#0A0E2E]">Recent Exits</h2>
                  <p className="text-xs font-medium text-[#0A0E2E]/70">Latest student movements</p>
                </div>
                <Link href="/discipline/records" className="rounded-md bg-[#0A0E2E] px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90">
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#0A0E2E]/10 bg-[#0A0E2E]/5 text-left">
                      <th className="px-6 py-3 text-[10px] font-black text-[#0A0E2E]/70">Entity</th>
                      <th className="px-6 py-3 text-[10px] font-black text-[#0A0E2E]/70">Reason</th>
                      <th className="px-6 py-3 text-[10px] font-black text-[#0A0E2E]/70">Status</th>
                      <th className="px-6 py-3 text-right text-[10px] font-black text-[#0A0E2E]/70">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0A0E2E]/10">
                    {loadingRecords ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="h-16 bg-[#0A0E2E]/5 px-6 py-4" />
                        </tr>
                      ))
                    ) : recentRecords.length > 0 ? recentRecords.map((record: any) => (
                      <tr key={record.id} className="transition-colors hover:bg-[#0A0E2E]/5">
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-[#0A0E2E]">{record.student?.firstName} {record.student?.lastName}</p>
                          <p className="text-[10px] font-medium text-[#0A0E2E]/65">ID: {record.studentId}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#0A0E2E]/75">{record.reason}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={record.status} className="border-[#0A0E2E] bg-[#0A0E2E] text-white" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/discipline/records/${record.id}`} className="inline-block rounded-md p-2 text-[#0A0E2E]/70 transition-colors hover:bg-[#0A0E2E] hover:text-white">
                            <Search size={16} />
                          </Link>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-sm font-black text-[#0A0E2E]/65 italic">
                          No recent activity recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-md border border-[#0A0E2E]/15 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-[#0A0E2E]">Quick Overview</h2>

              <div className="space-y-3">
                <div className="rounded-md border border-[#0A0E2E]/15 bg-white p-4">
                  <p className="text-[11px] font-bold text-[#0A0E2E]/60">Students in system</p>
                  {loadingStudents ? <div className="h-8 w-20 bg-[#0A0E2E]/5 animate-pulse rounded mt-1" /> : <p className="mt-1 text-2xl font-extrabold text-[#0A0E2E]">{students.length || 0}</p>}
                </div>
                <div className="rounded-md border border-[#0A0E2E]/15 bg-white p-4">
                  <p className="text-[11px] font-bold text-[#0A0E2E]/60">Active exits</p>
                  {loadingRecords ? <div className="h-8 w-20 bg-[#0A0E2E]/5 animate-pulse rounded mt-1" /> : <p className="mt-1 text-2xl font-extrabold text-[#0A0E2E]">{activePermitsCount}</p>}
                </div>
                <div className="rounded-md border border-[#0A0E2E]/15 bg-white p-4">
                  <p className="text-[11px] font-bold text-[#0A0E2E]/60">Latest update</p>
                  <p className="mt-1 text-sm font-semibold text-[#0A0E2E]">
                    {loadingRecords ? (
                      <span className="inline-block h-4 w-32 bg-[#0A0E2E]/5 animate-pulse rounded" />
                    ) : recentRecords[0]
                      ? `${recentRecords[0].student?.firstName} ${recentRecords[0].student?.lastName} • ${recentRecords[0].status}`
                      : 'No recent activity'}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link href="/discipline/students" className="rounded-md border border-[#0A0E2E]/20 bg-white px-3 py-2 text-center text-xs font-bold text-[#0A0E2E] transition-colors hover:bg-[#0A0E2E] hover:text-white">
                  Manage Students
                </Link>
                <Link href="/discipline/records/new" className="rounded-md bg-[#0A0E2E] px-3 py-2 text-center text-xs font-bold text-white transition-opacity hover:opacity-90">
                  New Record
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
