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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { User, Mail, Phone, ShieldCheck, Lock } from 'lucide-react';

interface StaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    staffMember?: any; // If provided, it's edit mode
}

export function StaffModal({ isOpen, onClose, onSuccess, staffMember }: StaffModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        role: 'STAFF',
        status: 'ACTIVE',
        password: ''
    });

    useEffect(() => {
        if (staffMember) {
            setFormData({
                firstName: staffMember.firstName,
                lastName: staffMember.lastName,
                email: staffMember.email,
                phoneNumber: staffMember.phoneNumber,
                role: staffMember.role,
                status: staffMember.status,
                password: ''
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                role: 'STAFF',
                status: 'ACTIVE',
                password: ''
            });
        }
    }, [staffMember, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = staffMember ? `/staff/${staffMember.id}` : '/staff';
            const method = staffMember ? 'PATCH' : 'POST';

            // Clean data to send
            const payload: any = { ...formData };
            if (staffMember) {
                // Remove password from payload if updating and empty
                if (!payload.password) delete payload.password;
            }

            await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            toast.success(staffMember ? 'Staff details synchronized' : 'Staff registered successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Staff Operation Error:', error);
            toast.error(error.message || 'Operation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-md border-none bg-white p-0 overflow-hidden shadow-2xl">
                <div className="bg-[#0A0E2E] p-8 text-white relative overflow-hidden">
                    {/* Subtle glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {staffMember ? 'Staff Information' : 'Register New Staff'}
                        </DialogTitle>
                        <p className="text-white/60 text-sm font-medium mt-1">
                            {staffMember ? 'Personnel details and assignment.' : 'Add a new member to the school administration.'}
                        </p>
                    </DialogHeader>
                </div>

                {staffMember ? (
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-[#0A0E2E]/50 uppercase tracking-wider">First Name</span>
                                <p className="text-sm font-semibold text-[#0A0E2E]">{staffMember.firstName}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-[#0A0E2E]/50 uppercase tracking-wider">Last Name</span>
                                <p className="text-sm font-semibold text-[#0A0E2E]">{staffMember.lastName}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold text-[#0A0E2E]/50 uppercase tracking-wider">Email Address</span>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-[#0A0E2E]/40" />
                                <p className="text-sm font-semibold text-[#0A0E2E]">{staffMember.email}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold text-[#0A0E2E]/50 uppercase tracking-wider">Phone Number</span>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#0A0E2E]/40" />
                                <p className="text-sm font-semibold text-[#0A0E2E]">{staffMember.phoneNumber}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-[#0A0E2E]/50 uppercase tracking-wider">Role</span>
                                <p className="text-sm font-semibold text-[#0A0E2E] capitalize">{staffMember.role?.toLowerCase() || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-[#0A0E2E]/50 uppercase tracking-wider">Status</span>
                                <p className="text-sm font-semibold text-[#0A0E2E] capitalize">{staffMember.status?.toLowerCase() || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                ) : (

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">First Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0E2E]/30 group-focus-within:text-[#0A0E2E] transition-colors" />
                                    <Input
                                        required
                                        placeholder="Jean"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="rounded-md pl-10 border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Last Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0E2E]/30 group-focus-within:text-[#0A0E2E] transition-colors" />
                                    <Input
                                        required
                                        placeholder="Kabera"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="rounded-md pl-10 border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0E2E]/30 group-focus-within:text-[#0A0E2E] transition-colors" />
                                <Input
                                    required
                                    type="email"
                                    placeholder="jean@rca.ac.rw"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="rounded-md pl-10 border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Phone Number</Label>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0E2E]/30 group-focus-within:text-[#0A0E2E] transition-colors" />
                                <Input
                                    required
                                    placeholder="+250 788 000 000"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="rounded-md pl-10 border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">
                                {staffMember ? 'New Password (Optional)' : 'Password'}
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0E2E]/30 group-focus-within:text-[#0A0E2E] transition-colors" />
                                <Input
                                    required={!staffMember}
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="rounded-md pl-10 border-[#0A0E2E]/10 bg-slate-50 focus:bg-white h-12 text-sm font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                                >
                                    <SelectTrigger className="rounded-md border-[#0A0E2E]/10 bg-slate-50 h-12 text-sm font-bold">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Administrator</SelectItem>
                                        <SelectItem value="STAFF">Staff</SelectItem>
                                        <SelectItem value="SECURITY">Security</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-[#0A0E2E]/60 ml-1">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger className="rounded-md border-[#0A0E2E]/10 bg-slate-50 h-12 text-sm font-bold">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-md bg-[#0A0E2E] hover:bg-[#1a264a] text-white font-bold text-sm shadow-xl shadow-[#0A0E2E]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {loading ? (staffMember ? 'Updating...' : 'Registering...') : (staffMember ? 'Save Changes' : 'Register Member')}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
