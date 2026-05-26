import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/RCA/Badges';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, Plus, Trash2, Edit, MapPin, Bus, Map, DollarSign, Users, Filter, CreditCard, Pencil, Download } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TransportModal } from '@/components/discipline/TransportModal';
import { DeleteConfirmationModal } from '@/components/discipline/DeleteConfirmationModal';
import { UpdateAssignmentStatusModal } from '@/components/discipline/UpdateAssignmentStatusModal';

interface RouteItem {
    id: number;
    location: string;
    price: number;
}

interface AssignmentItem {
    id: number;
    studentId: number;
    transportId: number;
    status: string;
    student?: {
        firstName: string;
        lastName: string;
    };
    transport?: {
        location: string;
        price: number;
    };
}

export default function TransportList() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'routes' | 'assignments'>('routes');
    const [search, setSearch] = useState('');

    // Modals
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);

    // Selection
    const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);
    const [routeToDelete, setRouteToDelete] = useState<number | null>(null);
    const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(null);

    const { data: routes = [], isLoading: loadingRoutes } = useQuery<RouteItem[]>({
        queryKey: ['transport-routes'],
        queryFn: () => apiFetch('/transport'),
        staleTime: 1000 * 60 * 5,
    });

    const { data: assignments = [], isLoading: loadingAssignments } = useQuery<AssignmentItem[]>({
        queryKey: ['transport-assignments'],
        queryFn: () => apiFetch('/transport/assignments'),
        staleTime: 1000 * 60 * 2,
    });

    const loading = activeTab === 'routes' ? loadingRoutes : loadingAssignments;

    const fetchRoutes = () => queryClient.invalidateQueries({ queryKey: ['transport-routes'] });
    const fetchAssignments = () => queryClient.invalidateQueries({ queryKey: ['transport-assignments'] });

    const handleNew = () => {
        setSelectedRoute(null);
        setModalOpen(true);
    };

    const handleEdit = (route: RouteItem) => {
        setSelectedRoute(route);
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setRouteToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleUpdateAssignment = (assignment: AssignmentItem) => {
        setSelectedAssignment(assignment);
        setStatusModalOpen(true);
    };

    const handleDeleteAssignment = (id: number) => {
        setAssignmentToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (activeTab === 'routes' && routeToDelete) {
            try {
                await apiFetch(`/transport/${routeToDelete}`, { method: 'DELETE' });
                toast.success('Route removed successfully');
                fetchRoutes();
            } catch (error) {
                toast.error('Failed to remove route');
            } finally {
                setDeleteModalOpen(false);
                setRouteToDelete(null);
            }
        } else if (activeTab === 'assignments' && assignmentToDelete) {
            try {
                await apiFetch(`/transport/assignments/${assignmentToDelete}`, { method: 'DELETE' });
                toast.success('Assignment removed successfully');
                fetchAssignments();
            } catch (error) {
                toast.error('Failed to remove assignment');
            } finally {
                setDeleteModalOpen(false);
                setAssignmentToDelete(null);
            }
        }
    };

    const filteredRoutes = routes.filter(r =>
        r.location.toLowerCase().includes(search.toLowerCase())
    );

    const filteredAssignments = assignments.filter(a =>
        a.student?.firstName.toLowerCase().includes(search.toLowerCase()) ||
        a.student?.lastName.toLowerCase().includes(search.toLowerCase()) ||
        a.transport?.location.toLowerCase().includes(search.toLowerCase())
    );

    // Export columns & data for Routes
    const routeColumns = [
        { header: 'Route ID', key: 'routeId' },
        { header: 'Location', key: 'location' },
        { header: 'Price (RWF)', key: 'price' },
    ];
    const routeExportData = filteredRoutes.map(r => ({
        routeId: `RT-${r.id.toString().padStart(3, '0')}`,
        location: r.location,
        price: r.price.toLocaleString(),
    }));

    // Export columns & data for Assignments
    const assignmentColumns = [
        { header: 'Student Name', key: 'studentName' },
        { header: 'Student ID', key: 'studentId' },
        { header: 'Route Location', key: 'routeLocation' },
        { header: 'Price (RWF)', key: 'price' },
        { header: 'Payment Status', key: 'status' },
    ];
    const assignmentExportData = filteredAssignments.map(a => ({
        studentName: a.student ? `${a.student.firstName} ${a.student.lastName}` : 'Unknown',
        studentId: a.studentId,
        routeLocation: a.transport?.location || 'N/A',
        price: a.transport?.price?.toLocaleString() || '0',
        status: a.status,
    }));

    return (
        <div className="min-h-screen bg-slate-50/50 text-[#0A0E2E]">
            <AppHeader title="Transport Management" subtitle="Routes, Pricing & Assignments" />

            <div className="mx-auto max-w-7xl px-6 py-8 animate-in fade-in duration-700">
                <div className="mb-6 rounded-md border border-[#0A0E2E]/10 bg-white p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[#0A0E2E]">
                                {activeTab === 'routes' ? 'Transport Routes' : 'Student Assignments'}
                            </h2>
                            <p className="text-sm font-medium text-[#0A0E2E]/60">
                                {activeTab === 'routes'
                                    ? 'Manage school transport routes and their associated pricing.'
                                    : 'Track student route assignments and payment status.'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-md">
                            <button
                                onClick={() => setActiveTab('routes')}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'routes' ? 'bg-[#0A0E2E] text-white shadow-md' : 'text-[#0A0E2E]/60 hover:text-[#0A0E2E]'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Map className="w-3.5 h-3.5" /> Routes
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('assignments')}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'assignments' ? 'bg-[#0A0E2E] text-white shadow-md' : 'text-[#0A0E2E]/60 hover:text-[#0A0E2E]'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Assignments
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0A0E2E]/40" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={activeTab === 'routes' ? "Search by location..." : "Search by student or location..."}
                                className="w-full rounded-md border border-[#0A0E2E]/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#0A0E2E]/10 focus:bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-1 border border-[#0A0E2E]/15 rounded-md overflow-hidden">
                            <button
                                onClick={() => {
                                    if (activeTab === 'routes') {
                                        exportToPDF(routeExportData, routeColumns, 'transport_routes', 'RCA — Transport Routes');
                                    } else {
                                        exportToPDF(assignmentExportData, assignmentColumns, 'transport_assignments', 'RCA — Transport Assignments');
                                    }
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0A0E2E] hover:bg-[#0A0E2E] hover:text-white transition-all"
                            >
                                <Download className="h-3.5 w-3.5" /> PDF
                            </button>
                            <div className="w-px h-6 bg-[#0A0E2E]/15" />
                            <button
                                onClick={() => {
                                    if (activeTab === 'routes') {
                                        exportToExcel(routeExportData, routeColumns, 'transport_routes');
                                    } else {
                                        exportToExcel(assignmentExportData, assignmentColumns, 'transport_assignments');
                                    }
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0A0E2E] hover:bg-[#0A0E2E] hover:text-white transition-all"
                            >
                                <Download className="h-3.5 w-3.5" /> Excel
                            </button>
                        </div>
                        {activeTab === 'routes' && (
                            <Button
                                onClick={handleNew}
                                className="rounded-md bg-[#0A0E2E] text-white shadow-lg shadow-[#0A0E2E]/20 hover:bg-[#1a264a] font-bold"
                            >
                                <Plus className="h-4 w-4 mr-2" /> New Route
                            </Button>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden rounded-md border border-[#0A0E2E]/10 bg-white shadow-xl shadow-[#0A0E2E]/5">
                    {loading ? (
                        <div className="p-20 text-center space-y-4">
                            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#0A0E2E] border-t-transparent" />
                            <p className="animate-pulse font-medium text-[#0A0E2E]/60 text-sm">Synchronizing Data...</p>
                        </div>
                    ) : activeTab === 'routes' ? (
                        <Table>
                            <TableHeader className="bg-[#0A0E2E]/5">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="px-6 py-5 font-bold text-[#0A0E2E]/70 text-xs uppercase tracking-wider">Route Location</TableHead>
                                    <TableHead className="font-bold text-[#0A0E2E]/70 text-xs uppercase tracking-wider text-center">Pricing (RWF)</TableHead>
                                    <TableHead className="text-right font-bold text-[#0A0E2E]/70 text-xs uppercase tracking-wider px-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRoutes.map((route) => (
                                    <TableRow key={route.id} className="group border-slate-100 transition-colors hover:bg-slate-50/80">
                                        <TableCell className="py-5 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0A0E2E]/5 text-[#0A0E2E] transition-transform group-hover:scale-110">
                                                    <MapPin className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#0A0E2E]">{route.location}</p>
                                                    <p className="text-[11px] font-bold text-[#0A0E2E]/40 uppercase">RT-{route.id.toString().padStart(3, '0')}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 italic">
                                                <CreditCard className="h-3 w-3" />
                                                {route.price.toLocaleString()} RWF
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(route)}
                                                    className="p-2 rounded-md transition-all hover:bg-[#0A0E2E] hover:text-white text-[#0A0E2E]/50"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(route.id)}
                                                    className="p-2 rounded-md transition-all hover:bg-red-50 text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Table>
                            <TableHeader className="bg-[#0A0E2E]/5">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="px-6 py-5 font-bold text-[#0A0E2E]/70 text-xs uppercase tracking-wider">Student</TableHead>
                                    <TableHead className="font-bold text-[#0A0E2E]/70 text-xs uppercase tracking-wider">Assigned Route</TableHead>
                                    <TableHead className="font-bold text-[#0A0E2E]/70 text-xs uppercase tracking-wider text-center">Status</TableHead>
                                    <TableHead className="text-right font-bold text-[#0A0E2E]/70 text-xs uppercase tracking-wider px-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssignments.length > 0 ? (
                                    filteredAssignments.map((assignment) => (
                                        <TableRow key={assignment.id} className="group border-slate-100 transition-colors hover:bg-slate-50/80">
                                            <TableCell className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-md bg-[#0A0E2E] text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
                                                        {assignment.student?.firstName?.[0]}{assignment.student?.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#0A0E2E]">{assignment.student?.firstName} {assignment.student?.lastName}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">ID: {assignment.studentId}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                    <div>
                                                        <p className="text-sm font-bold text-[#0A0E2E]">{assignment.transport?.location}</p>
                                                        <p className="text-[10px] font-medium text-slate-400">{assignment.transport?.price.toLocaleString()} RWF</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <StatusBadge status={assignment.status} />
                                            </TableCell>
                                            <TableCell className="px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdateAssignment(assignment)}
                                                        className="p-2 rounded-md transition-all hover:bg-[#0A0E2E] hover:text-white text-[#0A0E2E]/50"
                                                        title="Update Status"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                                        className="p-2 rounded-md transition-all hover:bg-red-50 text-red-300 hover:text-red-500"
                                                        title="Remove Assignment"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-12 text-center text-slate-400 font-medium italic">
                                            No transport assignments found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            <TransportModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchRoutes}
                transportMember={selectedRoute}
            />

            {selectedAssignment && (
                <UpdateAssignmentStatusModal
                    isOpen={statusModalOpen}
                    onClose={() => { setStatusModalOpen(false); setSelectedAssignment(null); }}
                    onSuccess={fetchAssignments}
                    assignmentId={selectedAssignment.id}
                    currentStatus={selectedAssignment.status}
                    studentName={`${selectedAssignment.student?.firstName} ${selectedAssignment.student?.lastName}`}
                />
            )}

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setRouteToDelete(null);
                    setAssignmentToDelete(null);
                }}
                onConfirm={confirmDelete}
                title={activeTab === 'routes' ? "Remove Route" : "Remove Assignment"}
                description={activeTab === 'routes'
                    ? "Are you sure? This will remove the route. Students assigned to this route will still keep their records but without a location."
                    : "Are you sure you want to remove this student's transport assignment?"}
            />
        </div>
    );
}
