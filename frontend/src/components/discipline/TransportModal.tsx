import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { MapPin, DollarSign } from 'lucide-react';

interface TransportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    transportMember?: any; // If provided, it's edit mode
}

export function TransportModal({ isOpen, onClose, onSuccess, transportMember }: TransportModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        location: '',
        price: '',
    });

    useEffect(() => {
        if (transportMember) {
            setFormData({
                location: transportMember.location,
                price: transportMember.price.toString(),
            });
        } else {
            setFormData({
                location: '',
                price: '',
            });
        }
    }, [transportMember, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = transportMember ? `/transport/${transportMember.id}` : '/transport';
            const method = transportMember ? 'PATCH' : 'POST';

            await apiFetch(url, {
                method,
                body: JSON.stringify({
                    location: formData.location,
                    price: Number(formData.price),
                })
            });

            toast.success(transportMember ? 'Route details updated' : 'Route created successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Transport Route Error:', error);
            toast.error(error.message || 'Operation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-md border-none bg-white p-0 overflow-hidden shadow-2xl">
                <div className="bg-[#0A0E2E] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {transportMember ? 'Edit Route' : 'Create New Route'}
                        </DialogTitle>
                        <p className="text-white/60 text-sm font-medium mt-1">
                            {transportMember ? 'Update route location and pricing.' : 'Add a new transport destination and cost.'}
                        </p>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Location Name</Label>
                        <div className="relative group">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0E2E]/30 group-focus-within:text-[#0A0E2E] transition-colors" />
                            <Input
                                required
                                placeholder="e.g. Kigali, Musanze, Huye"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="rounded-md pl-10 border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Transportation Price (RWF)</Label>
                        <div className="relative group">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0E2E]/30 group-focus-within:text-[#0A0E2E] transition-colors" />
                            <Input
                                required
                                type="number"
                                placeholder="5000"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="rounded-md pl-10 border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-md bg-[#0A0E2E] hover:bg-[#1a264a] text-white font-bold text-sm shadow-xl shadow-[#0A0E2E]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {loading ? (transportMember ? 'Updating...' : 'Creating...') : (transportMember ? 'Save Route Changes' : 'Create Route')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
