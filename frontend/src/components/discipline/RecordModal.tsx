import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
}

interface RecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    record: RecordBackend | null;
}

export function RecordModal({ isOpen, onClose, onSuccess, record }: RecordModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        reason: '',
        status: '',
        outDate: '',
        location: '',
    });

    useEffect(() => {
        if (record) {
            setFormData({
                reason: record.reason || '',
                status: record.status || '',
                outDate: record.outDate ? new Date(record.outDate).toISOString().slice(0, 16) : '',
                location: record.location || '',
            });
        }
    }, [record, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!record) return;

        setLoading(true);
        try {
            await apiFetch(`/records/${record.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    ...formData,
                    outDate: formData.outDate ? new Date(formData.outDate).toISOString() : null,
                    returnDate: formData.status === 'RETURNED' ? new Date().toISOString() : null,
                }),
            });

            // If status changed to RETURNED, update student status to IN
            if (formData.status === 'RETURNED') {
                await apiFetch(`/students/${record.studentId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: 'IN' }),
                });
            }

            toast.success('Record updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating record:', error);
            toast.error('Failed to update record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white text-[#0A0E2E]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Discipline Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="student" className="text-xs font-bold uppercase text-[#0A0E2E]/60">Student</Label>
                        <Input
                            value={record?.student ? `${record.student.firstName} ${record.student.lastName}` : 'Unknown'}
                            disabled
                            className="bg-slate-50 border-[#0A0E2E]/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-xs font-bold uppercase text-[#0A0E2E]/60">Reason</Label>
                        <Select
                            value={formData.reason}
                            onValueChange={(v) => setFormData(prev => ({ ...prev, reason: v }))}
                        >
                            <SelectTrigger className="border-[#0A0E2E]/10">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {['Medical Checkup', 'Family Emergency', 'School Event', 'Official Errand', 'Holiday'].map((r) => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-xs font-bold uppercase text-[#0A0E2E]/60">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                        >
                            <SelectTrigger className="border-[#0A0E2E]/10">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="OUT">OUT</SelectItem>
                                <SelectItem value="RETURNED">RETURNED</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="outDate" className="text-xs font-bold uppercase text-[#0A0E2E]/60">Out Date</Label>
                            <Input
                                type="datetime-local"
                                value={formData.outDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, outDate: e.target.value }))}
                                className="border-[#0A0E2E]/10"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="location" className="text-xs font-bold uppercase text-[#0A0E2E]/60">Destination / Location</Label>
                            <Input
                                placeholder="Where did the student go?"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                className="border-[#0A0E2E]/10"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-[#0A0E2E]/10 text-[#0A0E2E]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#0A0E2E] text-white hover:bg-[#1a264a]"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
