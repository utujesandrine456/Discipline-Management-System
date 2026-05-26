import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import { StatusBadge } from '@/components/RCA/Badges';
import { ExternalLink, Clock, UserCheck, User, Download, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';

import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/RCA/EmptyState';

export default function PermitsList() {
  const { data: records = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ['records'],
    queryFn: () => apiFetch('/records'),
    staleTime: 1000 * 60 * 5,
  });

  const { data: staffList = [] } = useQuery<any[]>({
    queryKey: ['staff'],
    queryFn: () => apiFetch('/staff'),
    staleTime: 1000 * 60 * 10,
  });

  const permits = records.filter((r: any) => r.status === 'OUT');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const permitColumns = [
    { header: 'Student Name', key: 'studentName' },
    { header: 'Reason', key: 'reason' },
    { header: 'Exit Time', key: 'outDate' },
    { header: 'Approved By', key: 'approvedBy' },
    { header: 'Status', key: 'status' },
  ];

  const exportData = permits.map((p: any) => {
    const sObj = p.staff || p.recordedBy || p.createdBy;
    let staffName = sObj && sObj.firstName ? `${sObj.firstName} ${sObj.lastName}`.trim() : '';

    if (!staffName || staffName === 'undefined undefined') {
      const sId = p.recordedById || p.staffId || p.createdById || p.recordedBy?.id || p.staff?.id;
      const foundStaff = staffList.find((s: any) => s.id === sId);
      if (foundStaff) staffName = `${foundStaff.firstName} ${foundStaff.lastName}`.trim();
    }

    if (!staffName || staffName === 'undefined undefined') staffName = 'Authorized Admin';

    return {
      studentName: p.student ? `${p.student.firstName} ${p.student.lastName}` : 'Unknown',
      reason: p.reason,
      outDate: p.outDate ? formatDate(p.outDate) : '',
      approvedBy: staffName,
      status: p.status,
    };
  });

  return (
    <div className="min-h-screen bg-white text-[#0A0E2E]">
      <AppHeader title="Leave Permits" subtitle="Authorization & Exit Passes" />
      <div className="mx-auto max-w-7xl px-6 py-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-md border border-[#0A0E2E]/15 bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0A0E2E]">
              Live Exit Permits
              <span className="rounded-full bg-[#0A0E2E] px-2 py-0.5 text-xs font-medium text-white">{permits.length} ACTIVE</span>
            </h2>
            <p className="mt-1 text-sm font-medium text-[#0A0E2E]/70">Real-time monitoring of students currently outside campus.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border border-[#0A0E2E]/15 rounded-md overflow-hidden bg-white">
              <button
                onClick={() => exportToPDF(exportData, permitColumns, 'active_permits', 'RCA — Active Permits')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0A0E2E] hover:bg-[#0A0E2E] hover:text-white transition-all"
              >
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
              <div className="w-px h-6 bg-[#0A0E2E]/15" />
              <button
                onClick={() => exportToExcel(exportData, permitColumns, 'active_permits')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0A0E2E] hover:bg-[#0A0E2E] hover:text-white transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Excel
              </button>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-[#0A0E2E]/20 bg-white px-4 py-2">
              <UserCheck className="h-4 w-4 text-[#0A0E2E]" />
              <span className="text-[11px] font-bold text-[#0A0E2E]">Authorized and tracked</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-[#0A0E2E]/15 bg-white shadow-xl shadow-[#0A0E2E]/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-[#0A0E2E]/10 bg-[#0A0E2E]/5">
                <tr>
                  {['Student Name', 'Reason', 'Exit Time', 'Approved By', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-5 text-[10px] font-bold text-[#0A0E2E]/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A0E2E]/10">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="h-16 animate-pulse bg-[#0A0E2E]/5" />
                  ))
                ) : permits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4">
                      <EmptyState
                        icon={ClipboardList}
                        title="No Active Permits"
                        description="There are currently no students authorized to be outside the campus."
                      />
                    </td>
                  </tr>
                ) : permits.map((permit) => (
                  <tr key={permit.id} className="group transition-colors hover:bg-[#0A0E2E]/5">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0A0E2E]">
                          <User size={14} className="text-white" />
                        </div>
                        <p className="text-sm font-bold text-[#0A0E2E]">
                          {permit.student?.firstName} {permit.student?.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-md border border-[#0A0E2E]/15 bg-white px-2.5 py-1 text-xs font-medium text-[#0A0E2E]/80">
                        {permit.reason}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[#0A0E2E]/70">
                        <Clock size={14} />
                        <span className="text-xs font-bold">{formatDate(permit.outDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-[#0A0E2E]/70">
                        {(() => {
                          const sObj = permit.staff || permit.recordedBy || permit.createdBy;
                          let name = sObj && sObj.firstName ? `${sObj.firstName} ${sObj.lastName}`.trim() : '';

                          if (!name || name === 'undefined undefined') {
                            const sId = permit.recordedById || permit.staffId || permit.createdById || permit.recordedBy?.id || permit.staff?.id;
                            const found = staffList.find(s => s.id === sId);
                            if (found) name = `${found.firstName} ${found.lastName}`.trim();
                          }

                          return name && name !== 'undefined undefined' ? name : 'Authorized Admin';
                        })()}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={permit.status} className="border-[#0A0E2E] bg-[#0A0E2E] text-white" />
                    </td>
                    <td className="px-6 py-5">
                      <Link href={`/discipline/records/${permit.id}`}>
                        <Button variant="ghost" size="sm" className="rounded-md border border-[#0A0E2E]/20 bg-white text-[10px] font-bold text-[#0A0E2E] transition-all hover:bg-[#0A0E2E] hover:text-white">
                          Details <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

