import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { AppHeader } from '@/components/layout/AppHeader';
import { StatusBadge } from '@/components/RCA/Badges';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Shield, Clock, FileText, CheckCircle2, AlertCircle, ArrowLeft, Send, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentBackend {
  id: number;
  firstName: string;
  lastName: string;
  year: string;
  classGroup: string;
}

export default function CreateRecord() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentBackend[]>([]);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const studentRef = useRef<HTMLSelectElement>(null);
  const outDateRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    studentId: '',
    reason: '',
    outDate: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await apiFetch('/students');
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      } finally {
        setFetching(false);
      }
    };
    fetchStudents();
  }, []);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await apiFetch('/records', {
        method: 'POST',
        body: JSON.stringify({
          studentId: parseInt(form.studentId),
          reason: form.reason,
          outDate: form.outDate ? new Date(form.outDate).toISOString() : new Date().toISOString(),
          status: 'OUT',
          location: form.location
        }),
      });

      // Automatically update student status to OUT
      await apiFetch(`/students/${form.studentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'OUT', location: form.location }),
      });

      toast.success('Exit recorded successfully');
      router.push('/discipline/records');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(`Failed to record exit: ${error.message || 'Network error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudent = students.find(s => s.id === parseInt(form.studentId));

  return (
    <div className="min-h-screen bg-white text-[#0A0E2E]">
      <AppHeader title="Record New Exit" subtitle="Student Movement Logging" />
      <div className="max-w-5xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#0A0E2E]/60 hover:text-[#0A0E2E] transition-colors mb-6 text-sm font-semibold group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Logs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-md p-8 border border-[#0A0E2E]/15 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#0A0E2E] flex items-center justify-center border border-[#0A0E2E]/15">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-[#0A0E2E]">Exit Details</h3>
                  <p className="text-sm text-[#0A0E2E]/70 font-medium">Enter the details for the student's exit</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 px-1">Student</label>
                  <Select
                    value={form.studentId}
                    onValueChange={(val) => update('studentId', val)}
                    disabled={fetching}
                  >
                    <SelectTrigger className="w-full h-12 rounded-md border border-[#0A0E2E]/15 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-[#0A0E2E]/20 transition-all text-[#0A0E2E]">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#0A0E2E]/50" />
                        <SelectValue placeholder="Select student..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.firstName} {s.lastName} — Year {s.year} {s.classGroup}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 px-1">Date and Time of Exit</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A0E2E]/50" />
                    <input
                      ref={outDateRef}
                      type="datetime-local"
                      value={form.outDate}
                      onChange={(e) => update('outDate', e.target.value)}
                      className="w-full rounded-md border border-[#0A0E2E]/15 bg-white pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0A0E2E]/20 transition-all text-[#0A0E2E]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 px-1">Reason</label>
                  <Select
                    value={form.reason}
                    onValueChange={(val) => update('reason', val)}
                  >
                    <SelectTrigger className="w-full h-12 rounded-md border border-[#0A0E2E]/15 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-[#0A0E2E]/20 transition-all text-[#0A0E2E]">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#0A0E2E]/50" />
                        <SelectValue placeholder="Select a reason..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {['Medical Checkup', 'Family Emergency', 'School Event'].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 px-1">Location or Destination Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A0E2E]/50" />
                    <input
                      type="text"
                      placeholder="e.g. Kigali, Home Address, etc."
                      value={form.location}
                      onChange={(e) => update('location', e.target.value)}
                      className="w-full rounded-md border border-[#0A0E2E]/15 bg-white pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0A0E2E]/20 transition-all text-[#0A0E2E]"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-md p-8 border border-[#0A0E2E]/15 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#0A0E2E]/50" />
                <h3 className="font-bold text-xl text-[#0A0E2E]">Notes</h3>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={4}
                className="w-full rounded-md border border-[#0A0E2E]/15 bg-white px-4 py-4 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-[#0A0E2E]/20 transition-all placeholder:text-[#0A0E2E]/40 text-[#0A0E2E]"
                placeholder="Provide any additional details about the exit..."
              />
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0A0E2E] rounded-md shadow-xl p-8 space-y-6 text-white border border-[#0A0E2E]/15 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

              <div className="relative z-10">
                <p className="text-sm font-semibold text-white/50 mb-6 border-b border-white/10 pb-2">Summary</p>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-white/60">Student:</span>
                    <span className={cn('text-sm font-bold text-right', selectedStudent ? 'text-white' : 'text-white/40 italic')}>
                      {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-white/60">Reason:</span>
                    <span className={cn('text-sm font-bold text-right', form.reason ? 'text-white' : 'text-white/40 italic')}>
                      {form.reason || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-white/60">Destination:</span>
                    <span className={cn('text-sm font-bold text-right', form.location ? 'text-white' : 'text-white/40 italic')}>
                      {form.location || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-white/60">Status:</span>
                    <StatusBadge status="OUT" className="scale-90 origin-right border-white/20 bg-white/10 text-white" />
                  </div>
                </div>

                <div className="mt-10 space-y-3">
                  <Button
                    className="w-full rounded-md py-6 bg-white hover:bg-white/90 text-[#0A0E2E] font-bold shadow-xl transition-all duration-300 disabled:opacity-50 group"
                    onClick={handleSubmit}
                    disabled={!form.studentId || !form.reason || submitting}
                  >
                    {submitting ? 'Processing...' : 'Record Exit'}
                    {!submitting && <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full rounded-md py-6 text-white/50 hover:text-white hover:bg-white/10 font-semibold text-sm transition-colors"
                    onClick={() => router.push('/discipline/records')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
