'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Mail,
  Lock,
  Calendar,
  Sparkles,
  Key,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PlatformTeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'support_admin',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.team) setTeam(data.team);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load platform team');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.password) {
      toast.error('All fields are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');

      toast.success(`Platform admin ${formData.full_name} created successfully!`);
      setShowInviteModal(false);
      setFormData({ full_name: '', email: '', password: '', role: 'support_admin' });
      fetchTeam();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error creating admin');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(adminId: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/team/${adminId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update admin');

      toast.success(`Admin account ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchTeam();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error updating status');
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Platform Team & Access
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              {team.length} Members
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage super admin personnel, assign roles (root, support, billing), and control platform privileges.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold gradient-kavion text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:opacity-95 transition-opacity self-start cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Platform Admin
        </button>
      </div>

      {/* Role Descriptions Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 font-bold text-xs text-indigo-400 font-mono uppercase">
            <ShieldCheck className="w-4 h-4" />
            Root Admin
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
            Full platform authority. Can invite/deactivate admins, suspend schools, view all billing/MRR, and impersonate.
          </p>
        </div>

        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 font-bold text-xs text-cyan-400 font-mono uppercase">
            <Users className="w-4 h-4" />
            Support Admin
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
            Inspects tenant academic data, views OCR logs, and generates single-use support impersonation sessions.
          </p>
        </div>

        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 font-mono uppercase">
            <Key className="w-4 h-4" />
            Billing Admin
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
            Manages revenue dashboard, tracks invoices, records manual payments, and updates tenant subscription tiers.
          </p>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Admin Member</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Last Login</th>
                <th className="px-4 py-3.5">Created Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-mono">
                    Loading admin personnel...
                  </td>
                </tr>
              ) : team.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No platform admins found.
                  </td>
                </tr>
              ) : (
                team.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">{admin.full_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{admin.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full border ${
                          admin.role === 'root_admin'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : admin.role === 'billing_admin'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}
                      >
                        {admin.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded ${
                          admin.is_active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {admin.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-400 text-[11px]">
                      {admin.last_login_at ? new Date(admin.last_login_at).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-400 text-[11px]">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {admin.role !== 'root_admin' && (
                        <button
                          onClick={() => handleToggleStatus(admin.id, admin.is_active)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                            admin.is_active
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                          }`}
                        >
                          {admin.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                Add New Platform Admin
              </h2>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Admin Email *</label>
                <input
                  type="email"
                  placeholder="operator@kavionquestion.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Temporary Password *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Platform Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="support_admin">Support Admin (Tenant inspection, Impersonation)</option>
                  <option value="billing_admin">Billing Admin (Invoices, Revenue, Subscriptions)</option>
                  <option value="root_admin">Root Admin (Full Platform Control)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl gradient-kavion text-white font-medium shadow-md hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
