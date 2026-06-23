'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Lock, Shield } from 'lucide-react';
import { getProfile, updateProfile } from '@/services/dashboardService';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { SessionUser } from '@/types';

function RoleBadge({ role }: { role: SessionUser['role'] }) {
  const map: Record<SessionUser['role'], { cls: string; label: string }> = {
    SuperAdmin: { cls: 'bg-violet-50 text-violet-700 border-violet-200',  label: 'SuperAdmin' },
    Admin:      { cls: 'bg-red-50 text-red-700 border-red-200',            label: 'Admin' },
    Trader:     { cls: 'bg-purple-50 text-purple-700 border-purple-200',   label: 'Trader' },
    User:       { cls: 'bg-blue-50 text-blue-700 border-blue-200',         label: 'User' },
  };
  const { cls, label } = map[role] || map['User'];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', cls)}>
      <Shield className="w-3 h-3" />
      {label}
    </span>
  );
}

interface FormState {
  fullName:  string;
  company:   string;
  phone:     string;
  country:   string;
  address:   string;
  cageCode:  string;
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const [form, setForm] = useState<FormState>({
    fullName: '',
    company:  '',
    phone:    '',
    country:  '',
    address:  '',
    cageCode: '',
  });

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          fullName: p.fullName  ?? '',
          company:  p.company   ?? '',
          phone:    p.phone     ?? '',
          country:  p.country   ?? '',
          address:  p.address   ?? '',
          cageCode: p.cageCode  ?? '',
        });
      })
      .catch(() => {
        /* Fall back to auth user data if API fails */
        if (authUser) {
          setProfile(authUser);
          setForm({
            fullName: authUser.fullName  ?? '',
            company:  authUser.company   ?? '',
            phone:    authUser.phone     ?? '',
            country:  authUser.country   ?? '',
            address:  authUser.address   ?? '',
            cageCode: authUser.cageCode  ?? '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [authUser]);

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({
        fullName: form.fullName,
        company:  form.company,
        phone:    form.phone,
        country:  form.country,
        address:  form.address,
        cageCode: form.cageCode || undefined,
      });
      setProfile(updated);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??';

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]} />
      <h1 className="text-xl font-bold text-navy">Profile Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar / summary card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-silver shadow-sm p-6 flex flex-col items-center text-center gap-3">
            {loading ? (
              <>
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-navy flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-navy">{profile?.fullName}</div>
                  <div className="text-xs text-text-muted mt-0.5">{profile?.company}</div>
                </div>
                {profile?.role && <RoleBadge role={profile.role} />}
                <div className="text-xs text-text-muted flex items-center gap-1 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {profile?.email}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Form card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-silver shadow-sm p-6">
            {loading ? (
              <div className="space-y-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Read-only email */}
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={profile?.email ?? ''}
                      readOnly
                      disabled
                      className="w-full border border-silver-dark rounded-lg px-3 py-2.5 pl-10 text-sm text-text-muted bg-bg cursor-not-allowed opacity-70"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Lock className="w-3.5 h-3.5 text-text-muted" />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">Email address cannot be changed.</p>
                </div>

                {/* Two-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={form.fullName}
                    onChange={handleChange('fullName')}
                    required
                    placeholder="Your full name"
                    leftIcon={<User className="w-4 h-4" />}
                  />
                  <Input
                    label="Company"
                    value={form.company}
                    onChange={handleChange('company')}
                    required
                    placeholder="Company name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    placeholder="+1 (000) 000-0000"
                  />
                  <Input
                    label="Country"
                    value={form.country}
                    onChange={handleChange('country')}
                    placeholder="United States"
                  />
                </div>

                <Input
                  label="Address"
                  value={form.address}
                  onChange={handleChange('address')}
                  placeholder="Street address, city, state, ZIP"
                />

                <Input
                  label="CAGE Code"
                  value={form.cageCode}
                  onChange={handleChange('cageCode')}
                  placeholder="e.g. 8ATR9"
                  hint="Commercial and Government Entity code (optional)"
                  className="part-number uppercase"
                />

                <div className="flex justify-end pt-1">
                  <Button type="submit" variant="orange" size="md" loading={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
