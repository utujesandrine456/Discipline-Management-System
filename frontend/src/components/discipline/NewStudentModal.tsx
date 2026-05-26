import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone, GraduationCap, ShieldCheck, Mail } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

interface NewStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    student?: any; // If provided, it's edit mode
}

export function NewStudentModal({ isOpen, onClose, onSuccess, student }: NewStudentModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        fatherName: '',
        motherName: '',
        fatherPhoneNumber: '',
        motherPhoneNumber: '',
        year: '',
        classGroup: '',
        location: '',
        status: 'IN',
    });

    useEffect(() => {
        if (student) {
            setFormData({
                firstName: student.firstName || '',
                lastName: student.lastName || '',
                fatherName: student.fatherName || '',
                motherName: student.motherName || '',
                fatherPhoneNumber: student.fatherPhoneNumber || '',
                motherPhoneNumber: student.motherPhoneNumber || '',
                year: student.year?.toString() || '',
                classGroup: student.classGroup || '',
                location: student.location || '',
                status: student.status || 'IN',
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                fatherName: '',
                motherName: '',
                fatherPhoneNumber: '',
                motherPhoneNumber: '',
                year: '',
                classGroup: '',
                location: '',
                status: 'IN',
            });
        }
    }, [student, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (student && !student.id) {
                throw new Error('Student ID is missing. Cannot update.');
            }
            const url = student ? `/students/${student.id}` : '/students';
            const method = student ? 'PATCH' : 'POST';

            await apiFetch(url, {
                method,
                body: JSON.stringify(formData),
            });

            toast.success(student ? 'Student profile updated' : 'Student registered successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl rounded-md border-none bg-white p-0 overflow-hidden shadow-2xl">
                <div className="bg-[#0A0E2E] p-8 text-white relative overflow-hidden">
                    {/* Subtle glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {student ? 'Edit Student Profile' : 'Register New Student'}
                        </DialogTitle>
                        <p className="text-white/60 text-sm font-medium mt-1">
                            {student ? 'Update student records and guardian information.' : 'Enroll a new student into the management system.'}
                        </p>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-[#0A0E2E] flex items-center gap-2">
                                <User className="h-4 w-4" /> Personal Details
                            </h3>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">First Name</Label>
                                <Input
                                    required
                                    placeholder="Jean"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="rounded-md border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Last Name</Label>
                                <Input
                                    required
                                    placeholder="Kabera"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="rounded-md border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Year</Label>
                                    <Select
                                        value={formData.year}
                                        onValueChange={(val) => setFormData({ ...formData, year: val })}
                                    >
                                        <SelectTrigger className="rounded-md border-[#0A0E2E]/10 bg-slate-50 h-12 text-sm font-bold">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Year 1</SelectItem>
                                            <SelectItem value="2">Year 2</SelectItem>
                                            <SelectItem value="3">Year 3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Class</Label>
                                    <Select
                                        value={formData.classGroup}
                                        onValueChange={(val) => setFormData({ ...formData, classGroup: val })}
                                    >
                                        <SelectTrigger className="rounded-md border-[#0A0E2E]/10 bg-slate-50 h-12 text-sm font-bold">
                                            <SelectValue placeholder="Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">Class A</SelectItem>
                                            <SelectItem value="B">Class B</SelectItem>
                                            <SelectItem value="C">Class C</SelectItem>
                                            <SelectItem value="D">Class D</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Current Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val) => setFormData({ ...formData, status: val })}
                                    >
                                        <SelectTrigger className="rounded-md border-[#0A0E2E]/10 bg-slate-50 h-11 text-sm font-bold">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IN">In Campus</SelectItem>
                                            <SelectItem value="OUT">Out of Campus</SelectItem>
                                            <SelectItem value="RETURNED">Returned</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Home Address / Room</Label>
                                    <Input
                                        placeholder="e.g. Kigali / Room 102"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="rounded-md border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-11 text-sm font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-[#0A0E2E] flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" /> Guardian Info
                            </h3>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Father's Name</Label>
                                <Input
                                    placeholder="Father's Full Name"
                                    value={formData.fatherName}
                                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                    className="rounded-md border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Father's Phone</Label>
                                <Input
                                    placeholder="+250 788 000 000"
                                    value={formData.fatherPhoneNumber}
                                    onChange={(e) => setFormData({ ...formData, fatherPhoneNumber: e.target.value })}
                                    className="rounded-md border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Mother's Name</Label>
                                <Input
                                    placeholder="Mother's Full Name"
                                    value={formData.motherName}
                                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                                    className="rounded-md border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Mother's Phone</Label>
                                <Input
                                    placeholder="+250 788 000 000"
                                    value={formData.motherPhoneNumber}
                                    onChange={(e) => setFormData({ ...formData, motherPhoneNumber: e.target.value })}
                                    className="rounded-md border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[#0A0E2E]/5">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-md bg-[#0A0E2E] hover:bg-[#1a264a] text-white font-bold text-sm shadow-xl shadow-[#0A0E2E]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {loading ? 'Processing...' : (student ? 'Save Changes' : 'Register Student')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
