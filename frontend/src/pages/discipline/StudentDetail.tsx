import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppHeader } from '@/components/layout/AppHeader';
import { StatusBadge } from '@/components/RCA/Badges';
import { Button } from '@/components/ui/button';
import {
    User,
    MapPin,
    Phone,
    Mail,
    Shield,
    History,
    ArrowLeft,
    Pencil,
    FileText,
    Calendar,
    AlertCircle,
    Bus,
    CreditCard,
    Map as MapIcon
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AssignRouteModal } from '@/components/discipline/AssignRouteModal';
import { UpdateAssignmentStatusModal } from '@/components/discipline/UpdateAssignmentStatusModal';

interface StudentDetail {
    id: number;
    firstName: string;
    lastName: string;
    fatherName: string;
    motherName: string;
    fatherPhoneNumber: string;
    motherPhoneNumber: string;
    year: string;
    classGroup: string;
    status: string;
    email: string;
    location: string;
    records: any[];
    transportAssignments?: any[];
}

export default function StudentDetail() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id } = router.query;
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);

    const { data: student, isLoading: loading } = useQuery<StudentDetail | null>({
        queryKey: ['student', id],
        queryFn: () => apiFetch(`/students/${id}`),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });

    const fetchStudent = () => queryClient.invalidateQueries({ queryKey: ['student', id] });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0A0E2E] border-t-transparent"></div>
        </div>
    );

    if (!student) return <div className="p-20 text-center">Student not found</div>;

    const currentAssignment = student.transportAssignments && student.transportAssignments.length > 0
        ? student.transportAssignments[0]
        : null;

    return (
        <div className="min-h-screen bg-slate-50/50 text-[#0A0E2E]">
            <AppHeader title={`${student.firstName} ${student.lastName}`} subtitle="Student Profile & Intelligence" />

            <div className="max-w-6xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-8 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/discipline/students')}
                        className="flex items-center gap-2 text-[#0A0E2E]/60 hover:text-[#0A0E2E] transition-colors font-bold text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Students
                    </button>

                    <Button
                        className="bg-[#0A0E2E] text-white hover:bg-[#1a264a] shadow-lg shadow-[#0A0E2E]/20"
                        onClick={() => router.push(`/discipline/students?edit=${student.id}`)}
                    >
                        <Pencil className="w-4 h-4 mr-2" /> Edit Records
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-md border border-[#0A0E2E]/10 p-8 shadow-sm">
                            <div className="flex items-start gap-6">
                                <div className="h-24 w-24 rounded-md bg-[#0A0E2E] text-white flex items-center justify-center text-3xl font-extrabold shadow-xl">
                                    {student.firstName[0]}{student.lastName[0]}
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight">{student.firstName} {student.lastName}</h1>
                                        <div className="flex items-center gap-3 mt-2">
                                            <StatusBadge status={student.status} />
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-[#0A0E2E]/60">
                                                <Shield className="w-4 h-4" /> UID-{student.id.toString().padStart(4, '0')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold uppercase text-slate-400">Class & Level</p>
                                            <div className="flex items-center gap-2 font-bold text-[#0A0E2E]">
                                                <MapPin className="w-4 h-4 text-[#0A0E2E]/50" /> Year {student.year} {student.classGroup}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold uppercase text-slate-400">Home Address</p>
                                            <div className="flex items-center gap-2 font-bold text-[#0A0E2E]">
                                                <MapPin className="w-4 h-4 text-[#0A0E2E]/50" /> {student.location || 'Kigali, Rwanda'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Transport Section */}
                        <section className="bg-white rounded-md border border-[#0A0E2E]/10 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#0A0E2E]/5 rounded-md text-[#0A0E2E]">
                                        <Bus className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold">Transport Route</h3>
                                </div>
                                {!currentAssignment && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAssignModalOpen(true)}
                                        className="border-[#0A0E2E] text-[#0A0E2E] font-bold"
                                    >
                                        Assign Route
                                    </Button>
                                )}
                            </div>

                            {currentAssignment ? (
                                <div className="flex items-center justify-between p-6 bg-[#0A0E2E]/5 rounded-md border border-[#0A0E2E]/10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-md shadow-sm">
                                            <MapPin className="w-6 h-6 text-[#0A0E2E]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#0A0E2E]">{currentAssignment.transport?.location || 'Unknown Location'}</p>
                                            <p className="text-xs font-medium text-[#0A0E2E]/60 flex items-center gap-1">
                                                <CreditCard className="w-3 h-3" /> {currentAssignment.transport?.price?.toLocaleString() || 0} RWF
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 leading-none">Payment Status</p>
                                            <StatusBadge status={currentAssignment.status} />
                                        </div>
                                        <button
                                            onClick={() => setStatusModalOpen(true)}
                                            className="text-[11px] font-bold text-[#0A0E2E] hover:underline flex items-center gap-1"
                                        >
                                            <Pencil className="w-3 h-3" /> Update Status
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-md">
                                    <p className="text-slate-400 font-medium">No transport route assigned yet.</p>
                                </div>
                            )}
                        </section>

                        {/* Discipline History */}
                        <section className="bg-white rounded-md border border-[#0A0E2E]/10 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#0A0E2E]/5 rounded-md text-[#0A0E2E]">
                                    <History className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold">Discipline Logs & History</h3>
                            </div>

                            {student.records.length === 0 ? (
                                <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-md">
                                    <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No discipline records found for this student.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {student.records.map((record) => (
                                        <div key={record.id} className="flex gap-4 p-4 rounded-md border border-slate-100 hover:border-[#0A0E2E]/20 transition-all group">
                                            <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${record.status === 'OUT' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500'}`} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-[#0A0E2E]">{record.reason}</h4>
                                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 italic">#{record.id}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mt-3">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                        <Calendar className="w-3.5 h-3.5" /> Out: {new Date(record.outDate).toLocaleString()}
                                                    </div>
                                                    {record.returnDate && (
                                                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                                            <Shield className="w-3.5 h-3.5" /> Back: {new Date(record.returnDate).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-[#0A0E2E] rounded-md p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 border-b border-white/10 pb-3">
                                <User className="w-4 h-4" /> Parent Information
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Father's Details</p>
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm">{student.fatherName}</p>
                                        <p className="flex items-center gap-2 text-xs text-white/70">
                                            <Phone className="w-3.5 h-3.5" /> {student.fatherPhoneNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Mother's Details</p>
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm">{student.motherName}</p>
                                        <p className="flex items-center gap-2 text-xs text-white/70">
                                            <Phone className="w-3.5 h-3.5" /> {student.motherPhoneNumber}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <AssignRouteModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                onSuccess={fetchStudent}
                studentId={student.id}
                studentName={`${student.firstName} ${student.lastName}`}
            />

            {currentAssignment && (
                <UpdateAssignmentStatusModal
                    isOpen={statusModalOpen}
                    onClose={() => setStatusModalOpen(false)}
                    onSuccess={fetchStudent}
                    assignmentId={currentAssignment.id}
                    currentStatus={currentAssignment.status}
                    studentName={`${student.firstName} ${student.lastName}`}
                />
            )}
        </div>
    );
}
