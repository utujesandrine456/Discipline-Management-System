import { useState, useEffect } from 'react';
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
import { MapPin, Bus, Loader2 } from 'lucide-react';

interface AssignRouteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    studentId: number;
    studentName: string;
}

export function AssignRouteModal({ isOpen, onClose, onSuccess, studentId, studentName }: AssignRouteModalProps) {
    const [loading, setLoading] = useState(false);
    const [fetchingRoutes, setFetchingRoutes] = useState(false);
    const [routes, setRoutes] = useState<any[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string>('');
    const [status, setStatus] = useState<string>('NOT_PAID');

    useEffect(() => {
        if (isOpen) {
            fetchRoutes();
        }
    }, [isOpen]);

    const fetchRoutes = async () => {
        setFetchingRoutes(true);
        try {
            const data = await apiFetch('/transport');
            setRoutes(data || []);
        } catch (error) {
            console.error('Error fetching routes:', error);
            toast.error('Failed to load routes');
        } finally {
            setFetchingRoutes(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRouteId) {
            toast.error('Please select a route');
            return;
        }

        setLoading(true);
        try {
            await apiFetch('/transport/assign', {
                method: 'POST',
                body: JSON.stringify({
                    studentId,
                    transportId: parseInt(selectedRouteId),
                    status,
                })
            });

            toast.success('Route assigned successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Assign Route Error:', error);
            toast.error(error.message || 'Failed to assign route');
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
                        <DialogTitle className="text-2xl font-bold">Assign Transport Route</DialogTitle>
                        <p className="text-white/60 text-sm font-medium mt-1">
                            Assign {studentName} to a transport route.
                        </p>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Select Route</Label>
                        <Select
                            value={selectedRouteId}
                            onValueChange={setSelectedRouteId}
                        >
                            <SelectTrigger className="rounded-md border-[#0A0E2E]/10 bg-slate-50 h-12 text-sm font-bold">
                                {fetchingRoutes ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Select a location" />}
                            </SelectTrigger>
                            <SelectContent className="bg-white border-[#0A0E2E]/10">
                                {routes.map((route) => (
                                    <SelectItem key={route.id} value={route.id.toString()} className="text-[#0A0E2E] font-medium">
                                        {route.location} — {route.price.toLocaleString()} RWF
                                    </SelectItem>
                                ))}
                                {routes.length === 0 && !fetchingRoutes && (
                                    <div className="p-2 text-center text-xs text-slate-400">No routes found</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

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
                                <SelectItem value="OUT" className="text-amber-500 font-bold">OUT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={loading || fetchingRoutes}
                            className="w-full h-12 rounded-md bg-[#0A0E2E] hover:bg-[#1a264a] text-white font-bold text-sm shadow-xl shadow-[#0A0E2E]/20 transition-all"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bus className="h-4 w-4 mr-2" />}
                            {loading ? 'Assigning...' : 'Assign Route'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
