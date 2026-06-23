'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search, UserCheck, UserX, Edit2, ChevronLeft, ChevronRight,
  Users, RefreshCw, KeyRound, Mail,
} from 'lucide-react';
import { request } from '@/lib/api-client';
import type { User, UserRole } from '@/types';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const ROLE_COLORS: Record<UserRole, string> = {
  SuperAdmin: 'bg-purple-100 text-purple-800',
  Admin:      'bg-[#0A1628]/10 text-[#0A1628]',
  Trader:     'bg-blue-100 text-blue-800',
  User:       'bg-gray-100 text-gray-700',
};

// ── Edit Role / Status Modal ──────────────────────────────
function EditModal({ user, onClose, onSave }: {
  user: Omit<User, 'password'>;
  onClose: () => void;
  onSave: (userId: string, data: Partial<User>) => Promise<void>;
}) {
  const [role,   setRole]   = useState<UserRole>(user.role);
  const [active, setActive] = useState(user.isActive !== false);
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="font-bold text-[#1A1A2E] text-lg mb-1">Edit User</h2>
        <p className="text-[#4A4A6A] text-sm mb-5">{user.fullName} — {user.email}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            >
              {(['User', 'Trader', 'Admin'] as UserRole[]).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <p className="text-xs text-[#4A4A6A] mt-1">SuperAdmin promotion is only available in the Super Admin panel.</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#F5F7FA] rounded-xl">
            <div>
              <div className="text-sm font-medium text-[#1A1A2E]">Account Active</div>
              <div className="text-xs text-[#4A4A6A]">{active ? 'User can log in' : 'User is suspended'}</div>
            </div>
            <button
              onClick={() => setActive((p) => !p)}
              className={cn('w-12 h-6 rounded-full transition-colors relative', active ? 'bg-[#00A651]' : 'bg-gray-300')}
            >
              <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all', active ? 'left-7' : 'left-1')} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#C0C9D5] text-sm font-medium text-[#4A4A6A] hover:bg-[#F5F7FA] transition-colors">
            Cancel
          </button>
          <button
            onClick={async () => { setSaving(true); await onSave(user.id, { role, isActive: active }); setSaving(false); onClose(); }}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reset Password Modal ──────────────────────────────────
function ResetPasswordModal({ user, onClose }: {
  user: Omit<User, 'password'>;
  onClose: () => void;
}) {
  const [newPwd,   setNewPwd]   = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  const valid = newPwd.length >= 8 && newPwd === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    try {
      await request(`/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: newPwd }),
      });
      toast.success(`Password reset for ${user.fullName}`);
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Reset failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-bold text-[#1A1A2E] text-lg leading-tight">Reset Password</h2>
            <p className="text-[#4A4A6A] text-xs">{user.fullName} · {user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Min. 8 characters"
                minLength={8}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#C0C9D5] text-sm pr-16 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4A4A6A] hover:text-[#4F46E5] font-medium"
              >
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1.5">Confirm Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              required
              className={cn(
                'w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors',
                confirm && !valid
                  ? 'border-red-400 focus:ring-red-400/30'
                  : confirm && valid
                  ? 'border-green-400 focus:ring-green-400/30'
                  : 'border-[#C0C9D5] focus:ring-[#4F46E5]/30'
              )}
            />
            {confirm && !valid && newPwd !== confirm && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
            The user will be required to use this new password on their next login. This action will be logged.
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#C0C9D5] text-sm font-medium text-[#4A4A6A] hover:bg-[#F5F7FA] transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !valid}
            className="flex-1 py-3 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-60"
          >
            {saving ? 'Resetting…' : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Change Email Modal ────────────────────────────────────
function ChangeEmailModal({ user, onClose, onDone }: {
  user: Omit<User, 'password'>;
  onClose: () => void;
  onDone: () => void;
}) {
  const [email,  setEmail]  = useState(user.email);
  const [saving, setSaving] = useState(false);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email !== user.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    try {
      await request(`/admin/users/${user.id}/change-email`, {
        method: 'PUT',
        body: JSON.stringify({ email }),
      });
      toast.success(`Email updated to ${email}`);
      onDone();
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Email change failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-[#1A1A2E] text-lg leading-tight">Change Email</h2>
            <p className="text-[#4A4A6A] text-xs">{user.fullName}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1.5">Current Email</label>
            <div className="px-4 py-3 rounded-xl bg-[#F5F7FA] border border-[#E8EDF2] text-sm text-[#4A4A6A]">
              {user.email}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1.5">New Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            />
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800">
            The user's login credentials will change immediately. This action will be logged.
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#C0C9D5] text-sm font-medium text-[#4A4A6A] hover:bg-[#F5F7FA] transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !valid}
            className="flex-1 py-3 rounded-xl bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Update Email'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users,      setUsers]      = useState<Omit<User, 'password'>[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [editUser,   setEditUser]   = useState<Omit<User, 'password'> | null>(null);
  const [resetUser,  setResetUser]  = useState<Omit<User, 'password'> | null>(null);
  const [emailUser,  setEmailUser]  = useState<Omit<User, 'password'> | null>(null);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs  = new URLSearchParams({ page: String(page), limit: String(limit), ...(search && { search }) });
      const res = await request<{ success: boolean; data: Omit<User,'password'>[]; pagination: { total: number } }>(`/admin/users?${qs}`);
      setUsers(res.data || []);
      setTotal(res.pagination?.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleSuspend = async (userId: string, active: boolean) => {
    try {
      await request(`/admin/users/${userId}/suspend`, { method: 'POST' });
      toast.success(active ? 'User suspended' : 'User reactivated');
      load();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleSave = async (userId: string, data: Partial<User>) => {
    try {
      await request(`/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
      toast.success('User updated');
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">User Management</h1>
        <p className="text-[#4A4A6A] text-sm mt-0.5">{total} total users registered</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A6A]" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, company..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
          />
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-[#C0C9D5] hover:bg-[#F5F7FA] transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4 text-[#4A4A6A]" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8EDF2] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-12 h-12 text-[#C0C9D5] mx-auto mb-3" />
            <p className="text-[#4A4A6A]">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8EDF2] bg-[#F5F7FA]">
                  {['User', 'Company', 'Role', 'Country', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#4A4A6A]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#E8EDF2] hover:bg-[#F5F7FA] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
                          u.role === 'SuperAdmin' ? 'bg-purple-600' :
                          u.role === 'Admin'      ? 'bg-[#0A1628]' :
                          u.role === 'Trader'     ? 'bg-blue-600'  : 'bg-[#4F46E5]'
                        )}>
                          {u.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[#1A1A2E] truncate max-w-32">{u.fullName}</div>
                          <div className="text-xs text-[#4A4A6A] truncate max-w-32">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#4A4A6A] max-w-32 truncate">{u.company}</td>
                    <td className="px-5 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', ROLE_COLORS[u.role])}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#4A4A6A] text-xs">{u.country}</td>
                    <td className="px-5 py-3">
                      <span className={cn('flex items-center gap-1.5 text-xs font-medium',
                        u.isActive !== false ? 'text-[#00A651]' : 'text-red-600'
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', u.isActive !== false ? 'bg-[#00A651]' : 'bg-red-500')} />
                        {u.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#4A4A6A] text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditUser(u)}
                          title="Edit role / status"
                          className="p-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors text-[#4A4A6A] hover:text-[#4F46E5]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setResetUser(u)}
                          title="Reset password"
                          className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors text-[#4A4A6A] hover:text-amber-600"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEmailUser(u)}
                          title="Change email"
                          className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-[#4A4A6A] hover:text-blue-600"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSuspend(u.id, u.isActive !== false)}
                          title={u.isActive !== false ? 'Suspend' : 'Reactivate'}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-[#4A4A6A] hover:text-red-600"
                        >
                          {u.isActive !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E8EDF2]">
            <span className="text-xs text-[#4A4A6A]">
              Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-[#F5F7FA] disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-medium">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-[#F5F7FA] disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editUser  && <EditModal          user={editUser}  onClose={() => setEditUser(null)}  onSave={handleSave} />}
      {resetUser && <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} />}
      {emailUser && <ChangeEmailModal   user={emailUser} onClose={() => setEmailUser(null)} onDone={load} />}
    </div>
  );
}
