import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Plus, Search, Eye, FileText, Calendar, User, UserCheck, Pencil, Trash2, Filter, Clock, ClipboardList, Download } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { StatusBadge } from '@/components/RCA/Badges';
import { EmptyState } from '@/components/RCA/EmptyState';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RecordModal } from '@/components/discipline/RecordModal';
import { DeleteConfirmationModal } from '@/components/discipline/DeleteConfirmationModal';
import { useAuthStore } from '@/stores/authStore';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';

interface RecordBackend {
  id: number;
  studentId: number;
  reason: string;
  status: string;
  outDate: string;
  returnDate: string | null;
  location: string;
  student?: {
    firstName: string;
    lastName: string;
  };
  staff?: {
    firstName: string;
    lastName: string;
  };
  recordedBy?: {
    firstName: string;
    lastName: string;
  };
  createdBy?: {
    firstName: string;
    lastName: string;
  };
}

export default function RecordsList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { user } = useAuthStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<RecordBackend | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  const { data: records = [], isLoading: loading } = useQuery<RecordBackend[]>({
    queryKey: ['records'],
    queryFn: () => apiFetch('/records'),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const { data: staffList = [] } = useQuery<any[]>({
    queryKey: ['staff'],
    queryFn: () => apiFetch('/staff'),
    staleTime: 1000 * 60 * 10,
  });

  const fetchRecords = () => queryClient.invalidateQueries({ queryKey: ['records'] });

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await apiFetch(`/records/${recordToDelete}`, { method: 'DELETE' });
      toast.success('Record deleted successfully');
      fetchRecords();
    } catch (error) {
      toast.error('Failed to delete record');
    } finally {
      setDeleteModalOpen(false);
      setRecordToDelete(null);
    }
  };


  const filtered = records.filter((r) => {
    const studentName = r.student ? `${r.student.firstName} ${r.student.lastName}`.toLowerCase() : '';
    if (search && !studentName.includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    return true;
  });


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const recordColumns = [
    { header: 'Student Name', key: 'studentName' },
    { header: 'Reason', key: 'reason' },
    { header: 'Exit Time', key: 'outDate' },
    { header: 'Return Time', key: 'returnDate' },
    { header: 'Location', key: 'location' },
    { header: 'Status', key: 'status' },
    { header: 'Approved By', key: 'approvedBy' },
  ];

  const exportData = filtered.map((r) => {
    const sObj = r.staff || (r as any).recordedBy || (r as any).createdBy;
    let staffName = sObj && sObj.firstName ? `${sObj.firstName} ${sObj.lastName}`.trim() : '';

    if (!staffName || staffName === 'undefined undefined') {
      const sId = (r as any).recordedById || (r as any).staffId || (r as any).createdById;
      const found = staffList.find(s => s.id === sId);
      if (found) staffName = `${found.firstName} ${found.lastName}`.trim();
    }

    if (!staffName || staffName === 'undefined undefined') staffName = user?.name || 'Admin';

    return {
      studentName: r.student ? `${r.student.firstName} ${r.student.lastName}` : 'Unknown',
      reason: r.reason,
      outDate: r.outDate ? formatDate(r.outDate) : '',
      returnDate: r.returnDate ? formatDate(r.returnDate) : 'Still Out',
      location: r.location || '',
      status: r.status,
      approvedBy: staffName,
    };
  });

  return (
    <div className="min-h-screen bg-white text-[#0A0E2E]">
      <AppHeader title="Discipline Records" subtitle="Incident & Discipline Logs" />
      <div className="max-w-7xl mx-auto px-6 py-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0A0E2E] flex items-center gap-3">
              Exit Logs
              <span className="text-xs font-medium px-2 py-0.5 bg-[#0A0E2E]/10 text-[#0A0E2E] rounded-full">{records.length} TOTAL</span>
            </h2>
            <p className="text-[#0A0E2E]/70 text-sm mt-1 font-medium">Monitoring and managing active student exits.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border border-[#0A0E2E]/15 rounded-md overflow-hidden">
              <button
                onClick={() => exportToPDF(exportData, recordColumns, 'discipline_records', 'RCA — Discipline Records')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0A0E2E] hover:bg-[#0A0E2E] hover:text-white transition-all"
              >
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
              <div className="w-px h-6 bg-[#0A0E2E]/15" />
              <button
                onClick={() => exportToExcel(exportData, recordColumns, 'discipline_records')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0A0E2E] hover:bg-[#0A0E2E] hover:text-white transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Excel
              </button>
            </div>
            <Button
              className="rounded-md bg-[#0A0E2E] text-white hover:bg-[#0A0E2E]/90 shadow-lg shadow-[#0A0E2E]/20"
              onClick={() => router.push('/discipline/records/new')}
            >
              <Plus className="h-4 w-4 mr-2" /> Record New Exit
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between p-6 bg-white rounded-md border border-[#0A0E2E]/15 shadow-sm">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0E2E]/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name..."
              className="w-full bg-white rounded-md border border-[#0A0E2E]/15 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#0A0E2E]/10"
            />
          </div>

          <div className="flex items-center gap-3 bg-white rounded-md border border-[#0A0E2E]/15 px-4 py-2 hover:border-[#0A0E2E]/30 transition-colors">
            <Filter className="h-4 w-4 text-[#0A0E2E]/50" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-[#0A0E2E] outline-none min-w-[150px] cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="OUT">Currently OUT</option>
              <option value="RETURNED">Returned Records</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-md border border-[#0A0E2E]/15 overflow-hidden">
            <div className="bg-[#0A0E2E]/5 h-14 border-b border-[#0A0E2E]/10" />
            <div className="p-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex p-6 border-b border-[#0A0E2E]/5 animate-pulse gap-6">
                  <div className="h-10 w-40 bg-[#0A0E2E]/5 rounded" />
                  <div className="h-10 w-60 bg-[#0A0E2E]/5 rounded" />
                  <div className="h-10 w-32 bg-[#0A0E2E]/5 rounded ml-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Registry Empty"
            description="No discipline records found matching your selection or search criteria."
            actionLabel="Create First Record"
            onAction={() => router.push('/discipline/records/new')}
            className="mt-4"
          />
        ) : (
          <div className="bg-white rounded-md shadow-sm border border-[#0A0E2E]/15 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0A0E2E]/5 border-b border-[#0A0E2E]/10">
                  <tr>
                    {['Student Name', 'Reason', 'Exit Time', 'Return Time', 'Status', 'Approved By', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-5 text-sm font-semibold text-[#0A0E2E]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0A0E2E]/10">
                  {filtered.map((record) => (
                    <tr key={record.id} className="group hover:bg-[#0A0E2E]/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-[#0A0E2E] text-white flex items-center justify-center font-black text-xs shadow-lg shadow-[#0A0E2E]/10 group-hover:scale-110 transition-transform">
                            {record.student?.firstName[0]}{record.student?.lastName[0]}
                          </div>
                          <Link href={`/discipline/records/${record.id}`} className="text-[14px] font-black text-[#0A0E2E] hover:underline decoration-[#0A0E2E]/30 underline-offset-4">
                            {record.student ? `${record.student.firstName} ${record.student.lastName}` : 'Unknown Student'}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0E2E]/5 w-fit rounded-md border border-[#0A0E2E]/10">
                          <FileText className="w-3.5 h-3.5 text-[#0A0E2E]/60" />
                          <span className="text-[12px] font-bold text-[#0A0E2E]/80">{record.reason}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[#0A0E2E]/60 font-black text-[11px]">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(record.outDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {record.returnDate ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-black text-[11px]">
                            <UserCheck className="w-3.5 h-3.5" />
                            {formatDate(record.returnDate)}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md text-[11px] font-black text-amber-600 bg-amber-50 border border-amber-200">
                            <Clock className="w-3 h-3" /> Still Out
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[12px] font-bold text-[#0A0E2E]/70">
                          <UserCheck className="w-3.5 h-3.5 text-[#0A0E2E]/40" />
                          {(() => {
                            const sObj = record.staff || (record as any).recordedBy || (record as any).createdBy;
                            let name = sObj && sObj.firstName ? `${sObj.firstName} ${sObj.lastName}`.trim() : '';

                            if (!name || name === 'undefined undefined') {
                              const sId = (record as any).recordedById || (record as any).staffId || (record as any).createdById;
                              const found = staffList.find(s => s.id === sId);
                              if (found) name = `${found.firstName} ${found.lastName}`.trim();
                            }

                            return name && name !== 'undefined undefined' ? name : (user?.name || 'Admin');
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/discipline/records/${record.id}`}>
                            <button className="h-8 w-8 flex items-center justify-center rounded-md text-[#0A0E2E]/70 hover:bg-[#0A0E2E] hover:text-white transition-all">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => { setRecordToEdit(record); setIsEditModalOpen(true); }}
                            className="h-8 w-8 flex items-center justify-center rounded-md text-[#0A0E2E]/70 hover:bg-[#0A0E2E] hover:text-white transition-all"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setRecordToDelete(record.id); setDeleteModalOpen(true); }}
                            className="h-8 w-8 flex items-center justify-center rounded-md text-[#0A0E2E]/70 hover:bg-[#0A0E2E] hover:text-white transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <RecordModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setRecordToEdit(null);
        }}
        onSuccess={fetchRecords}
        record={recordToEdit}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Record"
        description="Are you sure you want to delete this discipline record? This action cannot be undone."
      />
    </div>
  );
}

