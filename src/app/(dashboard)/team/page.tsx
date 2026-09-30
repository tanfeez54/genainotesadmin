'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Key,
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-heading font-black text-[#181E4B] tracking-tight">
              Platform Team &amp; Access
            </h1>
            <span className="text-xs px-3 py-1 rounded-full bg-[#FFF1DA] text-[#DF6951] font-extrabold">
              {team.length} Members
            </span>
          </div>
          <p className="text-xs text-[#5E6282] mt-1 font-medium">
            Manage super admin personnel, assign roles (root, support, billing), and control platform privileges.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-5 py-3 rounded-2xl text-xs font-bold gradient-jadoo text-white shadow-md shadow-[#DF6951]/25 flex items-center gap-2 hover:opacity-95 transition-all self-start cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Platform Admin
        </button>
      </div>

      {/* Role Descriptions Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <div className="flex items-center gap-2.5 font-bold text-xs text-[#DF6951] uppercase tracking-wider">
            <div className="w-8 h-8 rounded-xl bg-[#DF6951]/10 flex items-center justify-center text-[#DF6951]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            Root Admin
          </div>
          <p className="text-xs text-[#5E6282] mt-3 leading-relaxed font-medium">
            Full platform authority. Can invite/deactivate admins, suspend schools, view all billing/MRR, and impersonate.
          </p>
        </div>

        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <div className="flex items-center gap-2.5 font-bold text-xs text-[#5956E9] uppercase tracking-wider">
            <div className="w-8 h-8 rounded-xl bg-[#5956E9]/10 flex items-center justify-center text-[#5956E9]">
              <Users className="w-4 h-4" />
            </div>
            Support Admin
          </div>
          <p className="text-xs text-[#5E6282] mt-3 leading-relaxed font-medium">
            Inspects tenant academic data, views OCR logs, and generates single-use support impersonation sessions.
          </p>
        </div>

        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <div className="flex items-center gap-2.5 font-bold text-xs text-[#00A389] uppercase tracking-wider">
            <div className="w-8 h-8 rounded-xl bg-[#00A389]/10 flex items-center justify-center text-[#00A389]">
              <Key className="w-4 h-4" />
            </div>
            Billing Admin
          </div>
          <p className="text-xs text-[#5E6282] mt-3 leading-relaxed font-medium">
            Manages revenue dashboard, tracks invoices, records manual payments, and updates tenant subscription tiers.
          </p>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#FAF7F2] border-b border-[rgba(24,30,75,0.06)] text-[#181E4B] font-heading font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Admin Member</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Last Login</th>
                <th className="px-4 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(24,30,75,0.06)] font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#5E6282]">
                    Loading admin personnel...
                  </td>
                </tr>
              ) : team.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#5E6282]">
                    No platform admins found.
                  </td>
                </tr>
              ) : (
                team.map((admin) => (
                  <tr key={admin.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#181E4B]">{admin.full_name}</div>
                      <div className="text-[11px] text-[#5E6282] mt-0.5">{admin.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                          admin.role === 'root_admin'
                            ? 'bg-[#DF6951]/10 text-[#DF6951]'
                            : admin.role === 'billing_admin'
                            ? 'bg-[#00A389]/10 text-[#00A389]'
                            : 'bg-[#5956E9]/10 text-[#5956E9]'
                        }`}
                      >
                        {admin.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          admin.is_active
                            ? 'bg-[#00A389]/10 text-[#00A389]'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {admin.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#5E6282] text-[11px]">
                      {admin.last_login_at ? new Date(admin.last_login_at).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-4 text-[#5E6282] text-[11px]">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {admin.role !== 'root_admin' && (
                        <button
                          onClick={() => handleToggleStatus(admin.id, admin.is_active)}
                          className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            admin.is_active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-[32px] w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(24,30,75,0.06)]">
              <h2 className="text-lg font-heading font-black text-[#181E4B] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#DF6951]/10 flex items-center justify-center text-[#DF6951]">
                  <UserPlus className="w-4 h-4" />
                </div>
                Add New Platform Admin
              </h2>
              <button onClick={() => setShowInviteModal(false)} className="text-[#5E6282] hover:text-[#181E4B] text-lg font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#181E4B] font-bold uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-4 py-2.5 text-[#181E4B] font-medium focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10"
                  required
                />
              </div>

              <div>
                <label className="block text-[#181E4B] font-bold uppercase tracking-wider mb-1.5">Admin Email *</label>
                <input
                  type="email"
                  placeholder="operator@notegen.internal"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-4 py-2.5 text-[#181E4B] font-medium focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10"
                  required
                />
              </div>

              <div>
                <label className="block text-[#181E4B] font-bold uppercase tracking-wider mb-1.5">Temporary Password *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-4 py-2.5 text-[#181E4B] font-medium focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10"
                  required
                />
              </div>

              <div>
                <label className="block text-[#181E4B] font-bold uppercase tracking-wider mb-1.5">Platform Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-4 py-2.5 text-[#181E4B] font-bold focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10 cursor-pointer"
                >
                  <option value="support_admin">Support Admin (Tenant inspection, Impersonation)</option>
                  <option value="billing_admin">Billing Admin (Invoices, Revenue, Subscriptions)</option>
                  <option value="root_admin">Root Admin (Full Platform Control)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[rgba(24,30,75,0.06)]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-white border border-[rgba(24,30,75,0.12)] text-[#181E4B] hover:bg-[#FAF7F2] font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl gradient-jadoo text-white font-bold shadow-md shadow-[#DF6951]/25 hover:opacity-95 disabled:opacity-50 cursor-pointer transition-all"
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
