'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Users,
  Layers,
  FileSpreadsheet,
  ScanText,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  CreditCard,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'billing' | 'scans'>('overview');

  useEffect(() => {
    fetchSchool();
  }, [schoolId]);

  async function fetchSchool() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/schools/${schoolId}`);
      const result = await res.json();
      if (result.school) setData(result);
      else throw new Error(result.error || 'School not found');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load school');
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleStatus() {
    if (!data?.school) return;
    const newStatus = !data.school.is_active;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/schools/${schoolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update status');

      toast.success(`School ${newStatus ? 'reactivated' : 'suspended'} successfully`);
      fetchSchool();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error updating status');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleUpdatePlan(planId: string) {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/schools/${schoolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId, subscription_status: 'active' }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update subscription');

      toast.success('Subscription plan updated');
      fetchSchool();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error updating plan');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleExtendTrial() {
    setIsUpdating(true);
    try {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 14);

      const res = await fetch(`/api/schools/${schoolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trial_ends_at: newExpiry.toISOString(),
          subscription_status: 'trial',
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to extend trial');

      toast.success('Trial extended by 14 days');
      fetchSchool();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error extending trial');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleMarkInvoicePaid(invoiceId: string) {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to mark paid');

      toast.success('Invoice marked paid');
      fetchSchool();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error processing invoice');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleImpersonate() {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/schools/${schoolId}/impersonate`, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to start support session');

      toast.success('Support session generated (15m single-use)');
      window.open(result.targetUrl, '_blank');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Impersonation failed');
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded" />
        <div className="h-40 bg-slate-800/60 rounded-2xl" />
      </div>
    );
  }

  const { school, users, classes, scans, stats, plans, invoices } = data || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link
        href="/schools"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Schools
      </Link>

      {/* Header Banner */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center p-2 flex-shrink-0">
            {school.logo_url ? (
              <img src={school.logo_url} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-8 h-8 text-indigo-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">{school.name}</h1>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full ${
                  school.is_active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {school.is_active ? 'Active Tenant' : 'Suspended'}
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                {school.subscription_status || 'Trial'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {school.contact_email}
              </span>
              {school.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {school.phone}
                </span>
              )}
              {school.board && (
                <span className="font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                  {school.board}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleImpersonate}
            disabled={isUpdating}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Impersonate (Support Session)
          </button>

          <button
            onClick={toggleStatus}
            disabled={isUpdating}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              school.is_active
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : school.is_active ? (
              <ShieldAlert className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {school.is_active ? 'Suspend Access' : 'Reactivate'}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0f172a]/90 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Questions in Bank</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.totalQuestions}</div>
        </div>
        <div className="bg-[#0f172a]/90 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Papers Generated</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.totalPapers}</div>
        </div>
        <div className="bg-[#0f172a]/90 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Registered Classes</div>
          <div className="text-2xl font-bold text-white mt-1">{classes.length}</div>
        </div>
        <div className="bg-[#0f172a]/90 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Staff Members</div>
          <div className="text-2xl font-bold text-white mt-1">{users.length}</div>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 -mb-px transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-b-2 border-indigo-500 text-indigo-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview & Branding
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 px-4 -mb-px transition-colors cursor-pointer ${
            activeTab === 'billing'
              ? 'border-b-2 border-indigo-500 text-indigo-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Subscription & Billing
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 px-4 -mb-px transition-colors cursor-pointer ${
            activeTab === 'staff'
              ? 'border-b-2 border-indigo-500 text-indigo-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Staff & Teachers ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('scans')}
          className={`pb-3 px-4 -mb-px transition-colors cursor-pointer ${
            activeTab === 'scans'
              ? 'border-b-2 border-indigo-500 text-indigo-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Scans History ({scans.length})
        </button>
      </div>

      {/* Tab: Overview & Branding */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Details */}
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-white">Academic Details</h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Board</span>
                <span className="text-white font-medium">{school.board || 'CBSE'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Classes Range</span>
                <span className="text-white font-medium">{school.classes_range || 'Nursery - 10th'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Address</span>
                <span className="text-white font-medium">{school.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Created At</span>
                <span className="text-slate-300 font-mono">{new Date(school.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Official Branding Assets */}
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-semibold text-white mb-4">Official Print Assets (Watermark)</h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-slate-400 mb-2">School Stamp</span>
                {school.stamp_url ? (
                  <img src={school.stamp_url} alt="Stamp" className="h-20 object-contain rounded" />
                ) : (
                  <span className="text-slate-600 font-mono text-xs py-4">No stamp uploaded</span>
                )}
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-slate-400 mb-2">Principal Signature</span>
                {school.signature_url ? (
                  <img src={school.signature_url} alt="Signature" className="h-20 object-contain rounded" />
                ) : (
                  <span className="text-slate-600 font-mono text-xs py-4">No signature uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Subscription & Billing */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Plan & Tier Assignment */}
            <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                Subscription Plan Management
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Assign Plan Tier</label>
                  <select
                    value={school.plan_id || ''}
                    onChange={(e) => handleUpdatePlan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">-- No Active Plan --</option>
                    {plans?.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.price_monthly}/month (Max {p.max_teachers} Teachers, {p.max_scans_per_month} Scans)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <div className="text-slate-400">Trial Expiration</div>
                    <div className="text-slate-200 font-mono text-[11px] mt-0.5">
                      {school.trial_ends_at ? new Date(school.trial_ends_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <button
                    onClick={handleExtendTrial}
                    disabled={isUpdating}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    + Extend Trial 14 Days
                  </button>
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                School Invoices ({invoices?.length || 0})
              </h2>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(!invoices || invoices.length === 0) ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No invoices issued for this school yet.</p>
                ) : (
                  invoices.map((inv: any) => (
                    <div
                      key={inv.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono text-slate-300">₹{Number(inv.amount).toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded capitalize font-mono ${
                            inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {inv.status}
                        </span>
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkInvoicePaid(inv.id)}
                            className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] hover:bg-emerald-500 cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Staff & Teachers */}
      {activeTab === 'staff' && (
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-indigo-400" />
            Registered Staff & Roles ({users.length})
          </h2>

          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No users registered under this school.</p>
            ) : (
              users.map((u: any) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <div>
                    <div className="font-medium text-slate-200">{u.full_name || 'Staff User'}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{u.users?.email || 'N/A'}</div>
                  </div>
                  <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {u.role?.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Scans History */}
      {activeTab === 'scans' && (
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20">
          <h2 className="text-sm font-semibold text-white mb-4">Recent OCR Invocations ({scans.length})</h2>
          <div className="space-y-2">
            {scans.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No scans recorded yet for this school.</p>
            ) : (
              scans.map((s: any) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono"
                >
                  <div>
                    <span className="text-slate-300 capitalize">{s.doc_type?.replace('_', ' ')}</span>
                    <span className="text-[10px] text-slate-500 ml-3">{new Date(s.created_at).toLocaleString()}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                      s.status === 'ocr_completed' || s.status === 'reviewed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : s.status === 'failed'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-indigo-500/10 text-indigo-400'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
