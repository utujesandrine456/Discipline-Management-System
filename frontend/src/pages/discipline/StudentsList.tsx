import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, History, User, MapPin, Trash2, Users, UserCheck, AlertTriangle, Layers3, Pencil, Phone, UserPlus, Eye, Download } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NewStudentModal } from '@/components/discipline/NewStudentModal';
import { DeleteConfirmationModal } from '@/components/discipline/DeleteConfirmationModal';
import { EmptyState } from '@/components/RCA/EmptyState';

interface StudentBackend {
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
  records: any[];
}

export default function StudentsList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [classFilter, setClassFilter] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentBackend | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: students = [], isLoading: loading } = useQuery<StudentBackend[]>({
    queryKey: ['students'],
    queryFn: () => apiFetch('/students'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const fetchStudents = () => queryClient.invalidateQueries({ queryKey: ['students'] });

  useEffect(() => {
    if (router.isReady && router.query.edit && students.length > 0) {
      const student = students.find(s => s.id === parseInt(router.query.edit as string));
      if (student) {
        setStudentToEdit(student);
        setIsModalOpen(true);
      }
    }
  }, [router.isReady, router.query.edit, students]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const className = `Year ${s.year} ${s.classGroup}`;
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();

      if (classFilter !== 'All' && className !== classFilter) return false;
      if (searchFilter && !fullName.includes(searchFilter.toLowerCase())) return false;
      return true;
    });
  }, [students, classFilter, searchFilter]);

  const classes = useMemo(() => Array.from(new Set(students.map(s => `Year ${s.year} ${s.classGroup}`))), [students]);
  const inCampusCount = useMemo(() => students.filter((s) => s.status === 'IN').length, [students]);
  const outsideCount = useMemo(() => students.filter((s) => s.status === 'OUT').length, [students]);
  const filteredCount = filtered.length;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filteredCount / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [classFilter, searchFilter]);

  const getAvatarColor = (name: string) => {
    const colors = ['bg-[#0A0E2E]', 'bg-[#1a264a]', 'bg-[#0F1547]'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const handleEdit = (student: StudentBackend) => {
    setStudentToEdit(student);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setStudentToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setStudentToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await apiFetch(`/students/${studentToDelete}`, { method: 'DELETE' });
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    } finally {
      setDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const prefetchStudent = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: ['student', id.toString()],
      queryFn: () => apiFetch(`/students/${id}`),
      staleTime: 1000 * 60 * 5,
    });
  };

  const studentColumns = [
    { header: 'First Name', key: 'firstName' },
    { header: 'Last Name', key: 'lastName' },
    { header: 'Year', key: 'year' },
    { header: 'Class Group', key: 'classGroup' },
    { header: 'Father Name', key: 'fatherName' },
    { header: 'Mother Name', key: 'motherName' },
    { header: 'Father Phone', key: 'fatherPhoneNumber' },
    { header: 'Mother Phone', key: 'motherPhoneNumber' },
    { header: 'Status', key: 'status' },
  ];

  const exportData = filtered.map((s) => ({
    firstName: s.firstName,
    lastName: s.lastName,
    year: s.year,
    classGroup: s.classGroup,
    fatherName: s.fatherName,
    motherName: s.motherName,
    fatherPhoneNumber: s.fatherPhoneNumber,
    motherPhoneNumber: s.motherPhoneNumber,
    status: s.status,
  }));

  return (
    <div className="min-h-screen bg-white text-[#0A0E2E]">
      <AppHeader title="Students List" subtitle="Student Records Management" />

      <div className="mx-auto max-w-7xl px-6 py-8 animate-in fade-in duration-700">
        <div className="mb-6 rounded-md border border-[#0A0E2E]/15 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0A0E2E]">Students</h2>
              <p className="text-sm font-medium text-[#0A0E2E]/70">View and manage all students in the system.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border border-[#0A0E2E]/15 rounded-md overflow-hidden">
                <button
                  onClick={() => exportToPDF(exportData, studentColumns, 'students_list', 'RCA — Students List')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0A0E2E] hover:bg-[#0A0E2E] hover:text-white transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> PDF
                </button>
                <div className="w-px h-6 bg-[#0A0E2E]/15" />
                <button
                  onClick={() => exportToExcel(exportData, studentColumns, 'students_list')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0A0E2E] hover:bg-[#0A0E2E] hover:text-white transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Excel
                </button>
              </div>
              <Button
                onClick={handleNew}
                className="rounded-md bg-[#0A0E2E] text-white shadow-lg shadow-[#0A0E2E]/20 hover:bg-[#1a264a] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <UserPlus className="h-4 w-4 mr-2" /> New Student
              </Button>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border border-[#0A0E2E]/15 bg-white p-4">
              <div className="mb-2 inline-flex rounded-md bg-[#0A0E2E] p-2 text-white"><Users className="h-4 w-4" /></div>
              <p className="text-xs font-semibold text-[#0A0E2E]/65">Total Students</p>
              <p className="text-2xl font-extrabold text-[#0A0E2E]">{students.length}</p>
            </div>
            <div className="rounded-md border border-[#0A0E2E]/15 bg-white p-4">
              <div className="mb-2 inline-flex rounded-md bg-[#0A0E2E] p-2 text-white"><UserCheck className="h-4 w-4" /></div>
              <p className="text-xs font-semibold text-[#0A0E2E]/65">In Campus</p>
              <p className="text-2xl font-extrabold text-[#0A0E2E]">{inCampusCount}</p>
            </div>
            <div className="rounded-md border border-[#0A0E2E]/15 bg-white p-4">
              <div className="mb-2 inline-flex rounded-md bg-[#0A0E2E] p-2 text-white"><AlertTriangle className="h-4 w-4" /></div>
              <p className="text-xs font-semibold text-[#0A0E2E]/65">Out of Campus</p>
              <p className="text-2xl font-extrabold text-[#0A0E2E]">{outsideCount}</p>
            </div>
            <div className="rounded-md border border-[#0A0E2E]/15 bg-white p-4">
              <div className="mb-2 inline-flex rounded-md bg-[#0A0E2E] p-2 text-white"><Layers3 className="h-4 w-4" /></div>
              <p className="text-xs font-semibold text-[#0A0E2E]/65">Visible Results</p>
              <p className="text-2xl font-extrabold text-[#0A0E2E]">{filteredCount}</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0A0E2E]/50" />
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search by student name..."
                className="w-full rounded-md border border-[#0A0E2E]/15 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#0A0E2E]/15"
              />
            </div>

            <div className="flex items-center gap-3">
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="h-10 min-w-[160px] rounded-md border border-[#0A0E2E]/15 bg-white px-3 py-2 text-sm font-semibold text-[#0A0E2E] focus:ring-2 focus:ring-[#0A0E2E]/10 transition-all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#0A0E2E]/50" />
                    <SelectValue placeholder="All Classes" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0A0E2E] border-white/10 text-white shadow-2xl">
                  <SelectItem value="All" className="hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">
                    All Classes
                  </SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c} className="hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-[#0A0E2E]/15 bg-white shadow-xl shadow-[#0A0E2E]/5">
          {loading ? (
            <Table>
              <TableHeader className="border-b border-[#0A0E2E]/10 bg-[#0A0E2E]/5">
                <TableRow>
                  <TableHead className="px-6 py-5 font-bold text-[#0A0E2E]/80">Student Name</TableHead>
                  <TableHead className="font-bold text-[#0A0E2E]/80">Class</TableHead>
                  <TableHead className="font-bold text-[#0A0E2E]/80">Parent Contact</TableHead>
                  <TableHead className="text-center font-bold text-[#0A0E2E]/80">Engagement</TableHead>
                  <TableHead className="font-bold text-[#0A0E2E]/80">Current Status</TableHead>
                  <TableHead className="text-right font-bold text-[#0A0E2E]/80">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell className="py-4 px-6"><div className="h-10 w-40 bg-[#0A0E2E]/5 rounded-md" /></TableCell>
                    <TableCell><div className="h-8 w-20 bg-[#0A0E2E]/5 rounded-md" /></TableCell>
                    <TableCell><div className="h-8 w-32 bg-[#0A0E2E]/5 rounded-md" /></TableCell>
                    <TableCell><div className="h-8 w-16 mx-auto bg-[#0A0E2E]/5 rounded-md" /></TableCell>
                    <TableCell><div className="h-6 w-16 bg-[#0A0E2E]/5 rounded-full" /></TableCell>
                    <TableCell><div className="h-8 w-12 ml-auto bg-[#0A0E2E]/5 rounded-md" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : filteredCount === 0 ? (
            <EmptyState
              icon={Users}
              title="No Students Found"
              description="We couldn't find any student records matching your currently applied filters."
              actionLabel="Add New Student"
              onAction={handleNew}
            />
          ) : (
            <Table>
              <TableHeader className="border-b border-[#0A0E2E]/10 bg-[#0A0E2E]/5">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-6 py-5 font-bold text-[#0A0E2E]/80">Student Name</TableHead>
                  <TableHead className="font-bold text-[#0A0E2E]/80">Class</TableHead>
                  <TableHead className="font-bold text-[#0A0E2E]/80">Parent Contact</TableHead>
                  <TableHead className="text-center font-bold text-[#0A0E2E]/80">Engagement</TableHead>
                  <TableHead className="font-bold text-[#0A0E2E]/80">Current Status</TableHead>
                  <TableHead className="text-right font-bold text-[#0A0E2E]/80">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((s) => (
                  <TableRow
                    key={s.id}
                    onMouseEnter={() => prefetchStudent(s.id)}
                    className="group border-[#0A0E2E]/10 transition-colors hover:bg-[#0A0E2E]/5"
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-md text-white font-bold shadow-lg ${getAvatarColor(s.firstName)} transition-transform group-hover:scale-110`}>
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#0A0E2E] transition-colors">{s.firstName} {s.lastName}</p>
                          <p className="flex items-center gap-1 text-[11px] font-medium text-[#0A0E2E]/60">
                            <User className="h-3 w-3" /> UID-{s.id.toString().padStart(4, '0')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0A0E2E] text-white">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0A0E2E]">Year {s.year}</p>
                          <p className="text-[11px] font-bold text-[#0A0E2E]/60">{s.classGroup}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#0A0E2E]">{s.fatherName || s.motherName}</p>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-[#0A0E2E]/70">
                          <Phone className="h-3 w-3 text-[#0A0E2E]" />
                          {s.fatherPhoneNumber || s.motherPhoneNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => router.push(`/discipline/records?studentId=${s.id}`)}
                        className="inline-flex items-center gap-2 rounded-md border border-[#0A0E2E]/20 bg-white px-3 py-1.5 text-[11px] font-bold text-[#0A0E2E] transition-all hover:bg-[#0A0E2E] hover:text-white"
                      >
                        <History className="h-3.5 w-3.5" />
                        {s.records?.length || 0} logs
                      </button>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} className="border-[#0A0E2E] bg-[#0A0E2E] text-white" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/discipline/students/${s.id}`)}
                          onMouseEnter={() => prefetchStudent(s.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[#0A0E2E]/70 hover:bg-[#0A0E2E] hover:text-white transition-all hover:scale-110"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(s)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[#0A0E2E]/70 hover:bg-[#0A0E2E] hover:text-white transition-all hover:scale-110"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="group/del flex h-8 w-8 items-center justify-center rounded-md text-[#0A0E2E]/70 hover:bg-[#0A0E2E] hover:text-white transition-all hover:scale-110"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredCount > pageSize && (
            <div className="flex items-center justify-between border-t border-[#0A0E2E]/10 px-6 py-4">
              <p className="text-xs font-semibold text-[#0A0E2E]/60">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredCount)} of {filteredCount} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 border-[#0A0E2E]/15 text-[#0A0E2E] hover:bg-[#0A0E2E] hover:text-white"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-all ${currentPage === i + 1
                        ? "bg-[#0A0E2E] text-white"
                        : "text-[#0A0E2E]/60 hover:bg-[#0A0E2E]/5"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 border-[#0A0E2E]/15 text-[#0A0E2E] hover:bg-[#0A0E2E] hover:text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <NewStudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setStudentToEdit(null);
        }}
        onSuccess={fetchStudents}
        student={studentToEdit}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Student"
        description="Are you sure you want to delete this student from the records?"
      />
    </div>
  );
}
