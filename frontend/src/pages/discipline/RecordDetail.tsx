import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Calendar, User, FileText, ArrowLeft, Printer, Share2, Shield, Phone, MapPin, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { useAuthStore } from '@/stores/authStore';

import { StatusBadge } from '@/components/RCA/Badges';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { DeleteConfirmationModal } from '@/components/discipline/DeleteConfirmationModal';


interface RecordFull {
  id: number;
  studentId: number;
  reason: string;
  status: string;
  outDate: string;
  returnDate: string | null;
  location: string;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    fatherName: string;
    motherName: string;
    fatherPhoneNumber: string;
    motherPhoneNumber: string;
    year: string;
    classGroup: string;
    records: any[];
  }
}

export default function RecordDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const [record, setRecord] = useState<RecordFull | any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchRecord = async () => {
      try {
        const data = await apiFetch(`/records/${id}`);
        setRecord(data);
      } catch (error) {
        console.error('Error fetching record:', error);
        toast.error('Failed to load record details');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReturn = async () => {
    if (!record) return;
    try {
      setLoading(true);
      await apiFetch(`/records/${record.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'RETURNED',
          returnDate: new Date().toISOString()
        })
      });

      // SYNC STUDENT STATUS BACK TO IN
      await apiFetch(`/students/${record.studentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'IN' }),
      });
      toast.success('Return confirmed');
      router.reload();
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!record) return;
    try {
      await apiFetch(`/records/${record.id}`, { method: 'DELETE' });
      toast.success('Record deleted successfully');
      router.push('/discipline/records');
    } catch (error) {
      toast.error('Failed to delete record');
    } finally {
      setDeleteModalOpen(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-[#0A0E2E]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#0A0E2E] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#0A0E2E]/70 font-semibold">Loading details...</p>
      </div>
    </div>
  );

  if (!record) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-[#0A0E2E]">
      <div className="text-center space-y-6 max-w-sm px-6">
        <div className="w-20 h-20 bg-[#0A0E2E] rounded-md flex items-center justify-center mx-auto shadow-xl">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#0A0E2E]">Record Not Found</h2>
        <p className="text-sm text-[#0A0E2E]/65 font-medium leading-relaxed">The requested record could not be found. It may have been deleted or moved.</p>
        <Button onClick={() => router.push('/discipline/records')} className="w-full rounded-md bg-[#0A0E2E] text-white shadow-xl font-bold py-6">
          Back to Records
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-[#0A0E2E]">
      <AppHeader title={`Exit Record: ${record.student.firstName} ${record.student.lastName}`} subtitle="Detailed Intelligence Analysis" />
      <div className="max-w-6xl mx-auto px-6 py-8 animate-in zoom-in-95 duration-500">
        <div className="mb-8 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#0A0E2E]/60 hover:text-[#0A0E2E] transition-all font-bold text-xs group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Records
          </button>

          <Button onClick={handleDelete} variant="ghost" className="text-[#0A0E2E]/70 hover:text-red-600 hover:bg-red-50 text-xs font-bold">
            Delete Record
          </Button>
        </div>

        <div className="bg-white rounded-md shadow-2xl shadow-[#0A0E2E]/5 border border-[#0A0E2E]/15 overflow-hidden relative">

          {/* Masthead */}
          <div className="bg-[#0A0E2E] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-md bg-white/10 backdrop-blur-xl border border-white/20 text-white text-2xl font-black">
                  {record.student.firstName?.[0]}{record.student.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-4xl font-black">{record.student.firstName} {record.student.lastName}</h2>
                  <div className="flex items-center gap-2 mt-2 font-bold text-[10px] text-white/60">
                    <User size={12} className="text-blue-400" />
                    Year {record.student.year} {record.student.classGroup} — UID: {record.student.id.toString().padStart(4, '0')}
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-3">
                <StatusBadge status={record.status} className="px-6 py-2.5 text-xs font-black rounded-md bg-white text-[#0A0E2E] border-none shadow-xl" />
                <div className="px-4 py-2 bg-white/5 rounded-md border border-white/10 backdrop-blur-sm">
                  <p className="text-[9px] text-white/40 font-black text-right">Reference ID</p>
                  <p className="text-xs font-bold text-white text-right">ORD-{record.id.toString().padStart(5, '0')}</p>
                </div>
              </div>
            </div>
          </div>


          <div className="p-10">
            {/* Intel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
              {[
                { label: 'Reason for Exit', value: record.reason, icon: FileText },
                { label: 'Exit Date', value: formatDate(record.outDate), icon: Clock },
                { label: 'Return Date', value: record.returnDate ? formatDate(record.returnDate) : 'Still Out', icon: Clock },
                { label: 'Destination / Location', value: record.location || 'Not Specified', icon: MapPin },
                {
                  label: 'Recorded By', value: (record.staff?.firstName || record.recordedBy?.firstName || record.createdBy?.firstName)
                    ? `${record.staff?.firstName || record.recordedBy?.firstName || record.createdBy?.firstName} ${record.staff?.lastName || record.recordedBy?.lastName || record.createdBy?.lastName || ''}`
                    : (user?.name || 'Authorized Admin'), icon: Shield
                }
              ].map((item, i) => (
                <div key={i} className="space-y-3 group">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-[#0A0E2E]/50" />
                    <p className="text-[10px] font-bold text-[#0A0E2E]/60 ">{item.label}</p>
                  </div>
                  <p className="text-sm font-bold text-[#0A0E2E]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-[#0A0E2E]/10 w-full mb-16 shadow-sm" />

            {/* Strategic Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-[#0A0E2E] flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#0A0E2E]/50" />
                  Guardian Information
                </h3>
                <div className="bg-white p-8 rounded-md border border-[#0A0E2E]/15 space-y-6 shadow-sm">
                  <div className="flex justify-between items-center text-sm border-b border-[#0A0E2E]/10 pb-4">
                    <span className="text-[#0A0E2E]/60 font-semibold text-[10px]">Contact Person</span>
                    <span className="font-bold text-[#0A0E2E]">{record.student.fatherName || record.student.motherName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-[#0A0E2E]/10 pb-4">
                    <span className="text-[#0A0E2E]/60 font-semibold text-[10px]">Phone Number</span>
                    <span className="font-bold text-[#0A0E2E]">{record.student.fatherPhoneNumber || record.student.motherPhoneNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#0A0E2E]/60 font-semibold text-[10px]">District/Sector</span>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#0A0E2E]/40" />
                      <span className="font-bold text-[#0A0E2E] text-xs">Kicukiro District</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-lg text-[#0A0E2E] flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#0A0E2E]/50" />
                  Student Summary
                </h3>
                <div className="bg-white p-8 rounded-md border border-[#0A0E2E]/15 space-y-6 shadow-sm">
                  <div className="flex justify-between items-center text-sm border-b border-[#0A0E2E]/10 pb-4">
                    <span className="text-[#0A0E2E]/60 font-semibold text-[10px]">Total Exits</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0A0E2E] text-lg">{record.student.records?.length || 0}</span>
                      <span className="text-[10px] font-bold text-[#0A0E2E]/40">Times</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-[#0A0E2E]/10 pb-4">
                    <span className="text-[#0A0E2E]/60 font-semibold text-[10px]">Compliance Rating</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-[#0A0E2E]/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0A0E2E] w-[95%]" />
                      </div>
                      <span className="font-bold text-[#0A0E2E] text-xs">95%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#0A0E2E]/60 font-semibold text-[10px]">Status</span>
                    <span className="px-3 py-1 bg-[#0A0E2E]/10 rounded-md font-bold text-[#0A0E2E] text-[10px]">Record Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-10 border-t border-[#0A0E2E]/10">
              <div className="flex-1 min-w-[300px] flex gap-4">
                {record.status === 'OUT' ? (
                  <Button
                    onClick={handleReturn}
                    className="flex-1 rounded-md bg-[#0A0E2E] hover:bg-[#0A0E2E]/90 text-white font-bold text-xs py-7 shadow-xl shadow-[#0A0E2E]/20 transition-all hover:-translate-y-1"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Return
                  </Button>
                ) : (
                  <Button className="flex-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-xs py-7 pointer-events-none">
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Already Returned
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 rounded-md border-[#0A0E2E]/20 bg-white font-bold text-xs py-7 text-[#0A0E2E] transition-all hover:bg-[#0A0E2E] hover:text-white hover:-translate-y-1 shadow-sm hover:shadow-lg hover:shadow-[#0A0E2E]/10"
                >
                  <Printer className="mr-2 h-4 w-4" /> Print Record
                </Button>
              </div>
              <Button
                variant="ghost"
                className="rounded-md px-10 flex items-center justify-center font-bold text-xs py-7 text-[#0A0E2E]/60 border border-transparent hover:border-[#0A0E2E]/10 hover:bg-[#0A0E2E]/5 transition-all hover:-translate-y-1"
              >
                <Share2 className="mr-2 h-4 w-4" /> Contact Parent
              </Button>
            </div>
          </div>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Record"
        description="Are you sure you want to delete this exit record? This cannot be undone."
      />
    </div>
  );
}

