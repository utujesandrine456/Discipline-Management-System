import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, CreditCard } from 'lucide-react';

interface UpdateAssignmentStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    assignmentId: number;
    currentStatus: string;
    studentName: string;
}

export function UpdateAssignmentStatusModal({ isOpen, onClose, onSuccess, assignmentId, currentStatus, studentName }: UpdateAssignmentStatusModalProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>(currentStatus);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiFetch(`/transport/assignments/${assignmentId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });

            toast.success('Assignment status updated');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Update Assignment Error:', error);
            toast.error(error.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-md border-none bg-white p-0 overflow-hidden shadow-2xl text-[#0A0E2E]">
                <div className="bg-[#0A0E2E] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Update Status</DialogTitle>
                        <p className="text-white/60 text-sm font-medium mt-1">
                            Update transport payment status for {studentName}.
                        </p>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Payment Status</Label>
                        <Select
                            value={status}
                            onValueChange={setStatus}
                        >
                            <SelectTrigger className="rounded-md border-[#0A0E2E]/10 bg-slate-50 h-12 text-sm font-bold">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-[#0A0E2E]/10">
                                <SelectItem value="NOT_PAID" className="text-red-500 font-bold">NOT PAID</SelectItem>
                                <SelectItem value="PAID" className="text-emerald-500 font-bold">PAID</SelectItem>
                                <SelectItem value="OUT" className="text-amber-500 font-bold">OUT (Unassigned)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-md bg-[#0A0E2E] hover:bg-[#1a264a] text-white font-bold text-sm shadow-xl shadow-[#0A0E2E]/20 transition-all font-sans"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                            {loading ? 'Updating...' : 'Update Status'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
