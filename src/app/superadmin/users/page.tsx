'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, UserCheck, UserX, Edit2, RefreshCw,
  UserPlus, KeyRound, Mail, X, Eye, EyeOff,
} from 'lucide-react';
import { request } from '@/lib/api-client';
import type { User, UserRole } from '@/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const ROLE_COLORS: Record<UserRole, string> = {
  SuperAdmin: 'bg-purple-900/40 text-purple-300 border border-purple-700/40',
  Admin:      'bg-blue-900/40 text-blue-300 border border-blue-700/40',
  Trader:     'bg-teal-900/40 text-teal-300 border border-teal-700/40',
  User:       'bg-white/10 text-white/60 border border-white/10',
};

// ── Change Role Modal ─────────────────────────────────────
function ChangeRoleModal({
  user, onClose, onSave,
}: { user: Omit<User, 'password'>; onClose: () => void; onSave: (id: string, role: UserRole) => Promise<void> }) {
  const [role,   setRole]   = useState<UserRole>(user.role);
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#13132B] border border-purple-900/40 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="font-bold text-white text-lg mb-1">Change Role</h2>
        <p className="text-purple-300/60 text-sm mb-5">{user.fullName} — {user.email}</p>

        <div className="space-y-2">
          {(['User', 'Trader', 'Admin', 'SuperAdmin'] as UserRole[]).map((r) => (
            <button key={r} onClick={() => setRole(r)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
                role === r
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              <span>{r}</span>
              {role === r && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Selected</span>}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={async () => { setSaving(true); await onSave(user.id, role); setSaving(false); onClose(); }}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reset Password Modal ──────────────────────────────────
function ResetPasswordModal({ user, onClose }: { user: Omit<User, 'password'>; onClose: () => void }) {
  const [pwd,    setPwd]    = useState('');
  const [conf,   setConf]   = useState('');
  const [show,   setShow]   = useState(false);
  const [saving, setSaving] = useState(false);
  const valid = pwd.length >= 8 && pwd === conf;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#13132B] border border-purple-900/40 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-900/40 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg leading-tight">Reset Password</h2>
            <p className="text-purple-300/50 text-xs">{user.fullName}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/50 mb-1.5">New Password</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={pwd} onChange={(e) => setPwd(e.target.value)} minLength={8} placeholder="Min. 8 chars"
                className="w-full px-4 py-3 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm pr-16 focus:outline-none focus:ring-2 focus:ring-purple-600/50 placeholder:text-purple-300/20" />
              <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/50 hover:text-purple-300">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/50 mb-1.5">Confirm Password</label>
            <input type={show ? 'text' : 'password'} value={conf} onChange={(e) => setConf(e.target.value)} placeholder="Repeat"
              className={cn('w-full px-4 py-3 rounded-xl border text-white text-sm focus:outline-none focus:ring-2 bg-[#1A1A35] placeholder:text-purple-300/20',
                conf && !valid ? 'border-red-500/50 focus:ring-red-600/30' : 'border-purple-900/40 focus:ring-purple-600/50'
              )} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/5">Cancel</button>
          <button disabled={saving || !valid} onClick={async () => {
            setSaving(true);
            try {
              await request(`/admin/users/${user.id}/reset-password`, { method: 'POST', body: JSON.stringify({ password: pwd }) });
              toast.success('Password reset successfully');
              onClose();
            } catch (err: unknown) { toast.error((err as Error).message); }
            finally { setSaving(false); }
          }}
            className="flex-1 py-3 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors">
            {saving ? 'Resetting…' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Change Email Modal ────────────────────────────────────
function ChangeEmailModal({ user, onClose, onDone }: { user: Omit<User, 'password'>; onClose: () => void; onDone: () => void }) {
  const [email,  setEmail]  = useState(user.email);
  const [saving, setSaving] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email !== user.email;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#13132B] border border-purple-900/40 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-900/40 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">Change Email</h2>
            <p className="text-purple-300/50 text-xs">{user.fullName}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="px-4 py-3 rounded-xl bg-purple-900/20 border border-purple-900/30 text-sm text-purple-300/60">Current: {user.email}</div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/50 mb-1.5">New Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/5">Cancel</button>
          <button disabled={saving || !valid} onClick={async () => {
            setSaving(true);
            try {
              await request(`/admin/users/${user.id}/change-email`, { method: 'PUT', body: JSON.stringify({ email }) });
              toast.success('Email updated');
              onDone(); onClose();
            } catch (err: unknown) { toast.error((err as Error).message); }
            finally { setSaving(false); }
          }}
            className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Update Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create User Panel ─────────────────────────────────────
function CreateUserPanel({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', company: '', phone: '', country: 'United States',
    role: 'User' as UserRole, cageCode: '',
  });
  const [saving, setSaving]   = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.fullName && form.email && form.password.length >= 8 && form.company;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    try {
      await request('/superadmin/users/create', { method: 'POST', body: JSON.stringify(form) });
      toast.success(`User ${form.email} created as ${form.role}`);
      onCreated();
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Creation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-[#13132B] border border-purple-900/40 rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Create New User</h2>
              <p className="text-purple-300/50 text-xs">SuperAdmin only</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-purple-300/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/50 mb-1.5">Role</label>
            <div className="flex gap-2">
              {(['User', 'Trader', 'Admin', 'SuperAdmin'] as UserRole[]).map((r) => (
                <button key={r} type="button" onClick={() => set('role', r)}
                  className={cn('flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors',
                    form.role === r
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
                  )}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Jane Doe', col: 2 },
            { key: 'email',    label: 'Email',     type: 'email', placeholder: 'jane@acme.com', col: 2 },
            { key: 'company',  label: 'Company',   type: 'text', placeholder: 'Acme Corp', col: 1 },
            { key: 'phone',    label: 'Phone',     type: 'tel',  placeholder: '+1 555 000 0000', col: 1 },
            { key: 'country',  label: 'Country',   type: 'text', placeholder: 'United States', col: 1 },
            { key: 'cageCode', label: 'CAGE Code',  type: 'text', placeholder: '8ATR9', col: 1 },
          ].map(({ key, label, type, placeholder, col }) => (
            <div key={key} className={col === 2 ? 'col-span-2' : ''}>
              <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/50 mb-1.5">{label}</label>
              <input
                type={type} placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => set(key as keyof typeof form, e.target.value)}
                required={['fullName', 'email', 'company'].includes(key)}
                className="w-full px-4 py-3 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm placeholder:text-purple-300/20 focus:outline-none focus:ring-2 focus:ring-purple-600/50"
              />
            </div>
          ))}

          <div className="col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/50 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                minLength={8}
                required
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm pr-16 placeholder:text-purple-300/20 focus:outline-none focus:ring-2 focus:ring-purple-600/50"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/50 hover:text-purple-300">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/5">Cancel</button>
          <button type="submit" disabled={saving || !valid}
            className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors">
            {saving ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function SAUsersPage() {
  const [users,      setUsers]      = useState<Omit<User, 'password'>[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [editUser,   setEditUser]   = useState<Omit<User, 'password'> | null>(null);
  const [resetUser,  setResetUser]  = useState<Omit<User, 'password'> | null>(null);
  const [emailUser,  setEmailUser]  = useState<Omit<User, 'password'> | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
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

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await request('/superadmin/users/make-admin', { method: 'POST', body: JSON.stringify({ userId, role }) });
      toast.success(`Role updated to ${role}`);
      load();
    } catch { toast.error('Failed to update role'); }
  };

  const handleSuspend = async (userId: string, isActive: boolean) => {
    try {
      await request(`/admin/users/${userId}/suspend`, { method: 'POST' });
      toast.success(isActive ? 'User suspended' : 'User reactivated');
      load();
    } catch { toast.error('Action failed'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Users</h1>
          <p className="text-purple-300/50 text-sm mt-0.5">{total} registered accounts across all roles</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-4 gap-3">
        {(['SuperAdmin', 'Admin', 'Trader', 'User'] as UserRole[]).map((role) => {
          const count = users.filter((u) => u.role === role).length;
          return (
            <div key={role} className="bg-[#13132B] border border-purple-900/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className={cn('text-xs font-bold mt-1 px-2 py-0.5 rounded-full inline-block', ROLE_COLORS[role])}>
                {role}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
          <input
            type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, company…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm placeholder:text-purple-300/30 focus:outline-none focus:ring-2 focus:ring-purple-600/50"
          />
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] hover:bg-[#1F1F40] text-purple-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#13132B] rounded-2xl border border-purple-900/30 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-purple-900/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-900/30 bg-purple-900/20">
                  {['User', 'Company', 'Role', 'Status', 'Country', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-purple-300/40">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-purple-900/20 hover:bg-purple-900/10 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
                          u.role === 'SuperAdmin' ? 'bg-purple-600' :
                          u.role === 'Admin'      ? 'bg-blue-600'   :
                          u.role === 'Trader'     ? 'bg-teal-600'   : 'bg-indigo-600'
                        )}>
                          {u.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white truncate max-w-32">{u.fullName}</div>
                          <div className="text-xs text-purple-300/40 truncate max-w-32">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-purple-200/60 max-w-28 truncate">{u.company}</td>
                    <td className="px-5 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', ROLE_COLORS[u.role])}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('flex items-center gap-1.5 text-xs font-medium',
                        u.isActive !== false ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', u.isActive !== false ? 'bg-emerald-400' : 'bg-red-400')} />
                        {u.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-purple-200/40 text-xs">{u.country}</td>
                    <td className="px-5 py-3 text-purple-200/40 text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditUser(u)} title="Change role"
                          className="p-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setResetUser(u)} title="Reset password"
                          className="p-1.5 rounded-lg bg-amber-900/20 hover:bg-amber-600/20 text-amber-400/60 hover:text-amber-300 transition-colors">
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEmailUser(u)} title="Change email"
                          className="p-1.5 rounded-lg bg-blue-900/20 hover:bg-blue-600/20 text-blue-400/60 hover:text-blue-300 transition-colors">
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSuspend(u.id, u.isActive !== false)}
                          title={u.isActive !== false ? 'Suspend' : 'Reactivate'}
                          className="p-1.5 rounded-lg bg-purple-900/30 hover:bg-red-900/30 text-purple-400 hover:text-red-400 transition-colors"
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-purple-900/30">
            <span className="text-xs text-purple-300/40">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-purple-900/30 disabled:opacity-30 text-purple-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-purple-900/30 disabled:opacity-30 text-purple-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editUser   && <ChangeRoleModal    user={editUser}   onClose={() => setEditUser(null)}   onSave={handleRoleChange} />}
      {resetUser  && <ResetPasswordModal user={resetUser}  onClose={() => setResetUser(null)} />}
      {emailUser  && <ChangeEmailModal   user={emailUser}  onClose={() => setEmailUser(null)}  onDone={load} />}
      {createOpen && <CreateUserPanel                       onClose={() => setCreateOpen(false)} onCreated={load} />}
    </div>
  );
}
