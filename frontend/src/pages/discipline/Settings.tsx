import { AppHeader } from '@/components/layout/AppHeader';
import { useAuthStore } from '@/stores/authStore';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: ''
  });

  const { data: profile, isLoading: isFetching } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => apiFetch(`/staff/${user?.id}`),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || ''
      }));
    } else if (user) {
      const parts = (user.name || '').split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || ''
      }));
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      };

      // Only include password if the user entered one
      if (formData.password) {
        payload.password = formData.password;
      }

      await apiFetch(`/staff/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      toast.success('Information updated successfully');

      // Clear password field after successful update
      setFormData(prev => ({ ...prev, password: '' }));

    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader title="Settings" subtitle="System Configuration & Profile" />
      <div className="max-w-3xl mx-auto px-6 py-8 animate-in fade-in duration-700">
        <form onSubmit={handleSave} className="bg-white rounded-md p-8 shadow-sm border border-[#0A0E2E]/15 space-y-8">
          <div>
            <h3 className="font-bold text-xl text-[#0A0E2E] mb-1">Profile Information</h3>
            <p className="text-sm font-medium text-[#0A0E2E]/60 mb-6">Update your personal details here.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block text-sm font-bold text-[#0A0E2E]/80">
                First Name
                <Input
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-2 h-12 bg-slate-50 border-[#0A0E2E]/10 focus:bg-white text-base"
                  placeholder="First Name"
                  disabled={isFetching}
                />
              </label>

              <label className="block text-sm font-bold text-[#0A0E2E]/80">
                Last Name
                <Input
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-2 h-12 bg-slate-50 border-[#0A0E2E]/10 focus:bg-white text-base"
                  placeholder="Last Name"
                  disabled={isFetching}
                />
              </label>

              <label className="block text-sm font-bold text-[#0A0E2E]/80">
                Email Address
                <Input
                  disabled
                  defaultValue={profile?.email || user?.email}
                  className="mt-2 h-12 opacity-50 cursor-not-allowed bg-slate-100 border-[#0A0E2E]/10 text-base font-medium"
                />
                <span className="text-xs text-[#0A0E2E]/50 font-medium mt-1 inline-block">Emails cannot be modified.</span>
              </label>

              <label className="block text-sm font-bold text-[#0A0E2E]/80">
                Phone Number
                <Input
                  required
                  value={formData.phoneNumber}
                  onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="mt-2 h-12 bg-slate-50 border-[#0A0E2E]/10 focus:bg-white text-base"
                  placeholder="+250 788 000 000"
                  disabled={isFetching}
                />
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-[#0A0E2E]/10">
            <h3 className="font-bold text-xl text-[#0A0E2E] mb-1">Security Settings</h3>
            <p className="text-sm font-medium text-[#0A0E2E]/60 mb-6">Update your account password. Leave blank if you don't wish to change it.</p>

            <div className="block text-sm font-bold text-[#0A0E2E]/80 max-w-md">
              <label>New Password</label>
              <div className="relative mt-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 bg-slate-50 border-[#0A0E2E]/10 focus:bg-white text-base pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A0E2E]/40 hover:text-[#0A0E2E] transition-colors focus:outline-none"
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#0A0E2E] text-white hover:bg-[#1a264a] h-12 px-8 rounded-md shadow-xl shadow-[#0A0E2E]/20 text-sm font-bold transition-all"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
