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
  Mail,
  Phone,
  Sparkles,
  Loader2,
  DollarSign,
  CreditCard,
  ChevronRight,
  FileSpreadsheet,
  ScanText,
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
        <div className="h-6 w-32 bg-slate-200 rounded-xl" />
        <div className="h-44 bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl" />
      </div>
    );
  }

  const { school, users, classes, scans, stats, plans, invoices } = data || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link
        href="/schools"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5E6282] hover:text-[#DF6951] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Schools
      </Link>

      {/* Header Banner */}
      <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(24,30,75,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[rgba(24,30,75,0.08)] flex items-center justify-center p-2 shrink-0 shadow-xs">
            {school.logo_url ? (
              <img src={school.logo_url} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-8 h-8 text-[#DF6951]" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-heading font-black text-[#181E4B]">{school.name}</h1>
              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                  school.is_active
                    ? 'bg-[#00A389]/10 text-[#00A389]'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                {school.is_active ? 'Active Tenant' : 'Suspended'}
              </span>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#FFF1DA] text-[#DF6951] uppercase">
                {school.subscription_status || 'Trial'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#5E6282] mt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#DF6951]" /> {school.contact_email}
              </span>
              {school.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#DF6951]" /> {school.phone}
                </span>
              )}
              {school.board && (
                <span className="font-bold bg-[#FAF7F2] text-[#181E4B] border border-[rgba(24,30,75,0.08)] px-2.5 py-0.5 rounded-full text-[10px]">
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
            className="px-4 py-2.5 rounded-2xl text-xs font-bold gradient-jadoo text-white shadow-md shadow-[#DF6951]/25 flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Impersonate (Support Session)
          </button>

          <button
            onClick={toggleStatus}
            disabled={isUpdating}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              school.is_active
                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
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
        <div className="bg-white border border-[rgba(24,30,75,0.08)] p-5 rounded-3xl shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Questions in Bank</div>
          <div className="text-3xl font-heading font-black text-[#181E4B] mt-1">{stats?.totalQuestions || 0}</div>
        </div>
        <div className="bg-white border border-[rgba(24,30,75,0.08)] p-5 rounded-3xl shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Papers Generated</div>
          <div className="text-3xl font-heading font-black text-[#181E4B] mt-1">{stats?.totalPapers || 0}</div>
        </div>
        <div className="bg-white border border-[rgba(24,30,75,0.08)] p-5 rounded-3xl shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Registered Classes</div>
          <div className="text-3xl font-heading font-black text-[#181E4B] mt-1">{classes?.length || 0}</div>
        </div>
        <div className="bg-white border border-[rgba(24,30,75,0.08)] p-5 rounded-3xl shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Staff Members</div>
          <div className="text-3xl font-heading font-black text-[#181E4B] mt-1">{users?.length || 0}</div>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-[rgba(24,30,75,0.08)] text-xs font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 -mb-px transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-b-2 border-[#DF6951] text-[#DF6951]'
              : 'text-[#5E6282] hover:text-[#181E4B]'
          }`}
        >
          Overview &amp; Branding
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 px-4 -mb-px transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'billing'
              ? 'border-b-2 border-[#DF6951] text-[#DF6951]'
              : 'text-[#5E6282] hover:text-[#181E4B]'
          }`}
        >
          Subscription &amp; Billing
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 px-4 -mb-px transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'staff'
              ? 'border-b-2 border-[#DF6951] text-[#DF6951]'
              : 'text-[#5E6282] hover:text-[#181E4B]'
          }`}
        >
          Staff &amp; Teachers ({users?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('scans')}
          className={`pb-3 px-4 -mb-px transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'scans'
              ? 'border-b-2 border-[#DF6951] text-[#DF6951]'
              : 'text-[#5E6282] hover:text-[#181E4B]'
          }`}
        >
          Scans History ({scans?.length || 0})
        </button>
      </div>

      {/* Tab: Overview & Branding */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(24,30,75,0.04)] space-y-4">
            <h2 className="text-base font-heading font-bold text-[#181E4B]">Academic Details</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[rgba(24,30,75,0.06)]">
                <span className="text-[#5E6282]">Board</span>
                <span className="text-[#181E4B] font-bold">{school.board || 'CBSE'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[rgba(24,30,75,0.06)]">
                <span className="text-[#5E6282]">Classes Range</span>
                <span className="text-[#181E4B] font-bold">{school.classes_range || 'Nursery - 10th'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[rgba(24,30,75,0.06)]">
                <span className="text-[#5E6282]">Address</span>
                <span className="text-[#181E4B] font-bold">{school.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[rgba(24,30,75,0.06)]">
                <span className="text-[#5E6282]">Created At</span>
                <span className="text-[#181E4B] font-medium">{new Date(school.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
            <h2 className="text-base font-heading font-bold text-[#181E4B] mb-4">Official Print Assets (Watermark)</h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FAF7F2] border border-[rgba(24,30,75,0.08)] rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-[#5E6282] uppercase tracking-wider mb-2">School Stamp</span>
                {school.stamp_url ? (
                  <img src={school.stamp_url} alt="Stamp" className="h-20 object-contain rounded" />
                ) : (
                  <span className="text-[#5E6282] font-medium text-xs py-4">No stamp uploaded</span>
                )}
              </div>

              <div className="bg-[#FAF7F2] border border-[rgba(24,30,75,0.08)] rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-[#5E6282] uppercase tracking-wider mb-2">Principal Signature</span>
                {school.signature_url ? (
                  <img src={school.signature_url} alt="Signature" className="h-20 object-contain rounded" />
                ) : (
                  <span className="text-[#5E6282] font-medium text-xs py-4">No signature uploaded</span>
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
            <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(24,30,75,0.04)] space-y-4">
              <h2 className="text-base font-heading font-bold text-[#181E4B] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#DF6951]" />
                Subscription Plan Management
              </h2>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[#181E4B] font-bold uppercase tracking-wider block mb-1.5">Assign Plan Tier</label>
                  <select
                    value={school.plan_id || ''}
                    onChange={(e) => handleUpdatePlan(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-4 py-2.5 text-[#181E4B] font-bold focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10 cursor-pointer"
                  >
                    <option value="">-- No Active Plan --</option>
                    {plans?.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.price_monthly}/month (Max {p.max_teachers} Teachers, {p.max_scans_per_month} Scans)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[rgba(24,30,75,0.06)]">
                  <div>
                    <div className="text-[#5E6282] font-medium">Trial Expiration</div>
                    <div className="text-[#181E4B] font-bold text-xs mt-0.5">
                      {school.trial_ends_at ? new Date(school.trial_ends_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <button
                    onClick={handleExtendTrial}
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-xl bg-[#FFF1DA] hover:bg-[#FFE6BE] text-[#DF6951] text-xs font-bold transition-all cursor-pointer"
                  >
                    + Extend Trial 14 Days
                  </button>
                </div>
              </div>
            </div>

            {/* Generation Wallet & Usage Card */}
            <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(24,30,75,0.04)] space-y-4">
              <h2 className="text-base font-heading font-bold text-[#181E4B] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#00A389]" />
                  Generation Wallet &amp; Usage
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-[#00A389]/10 text-[#00A389] font-bold">
                  ₹5 / paper
                </span>
              </h2>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[rgba(24,30,75,0.06)]">
                  <span className="text-[10px] text-[#5E6282] block font-bold uppercase tracking-wider">Wallet Balance</span>
                  <span className="text-2xl font-heading font-black text-[#00A389] mt-1 block">
                    ₹{Number(school.wallet_balance || 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[rgba(24,30,75,0.06)]">
                  <span className="text-[10px] text-[#5E6282] block font-bold uppercase tracking-wider">Generations Left</span>
                  <span className="text-2xl font-heading font-black text-[#181E4B] mt-1 block">
                    {Math.floor(Number(school.wallet_balance || 0) / Number(school.cost_per_generation || 5))}
                  </span>
                </div>
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[rgba(24,30,75,0.06)]">
                  <span className="text-[10px] text-[#5E6282] block font-bold uppercase tracking-wider">Used Papers</span>
                  <span className="text-2xl font-heading font-black text-[#DF6951] mt-1 block">
                    {school.generations_used || 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[rgba(24,30,75,0.06)]">
                <button
                  type="button"
                  onClick={async () => {
                    const amount = prompt('Enter bonus credits amount to add to school wallet (₹):', '50');
                    if (!amount || isNaN(Number(amount))) return;
                    try {
                      const res = await fetch(`/api/schools/${schoolId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          wallet_balance: Number(school.wallet_balance || 0) + Number(amount),
                        }),
                      });
                      if (res.ok) {
                        toast.success(`Added ₹${amount} bonus credits!`);
                        fetchSchool();
                      }
                    } catch (e) {
                      toast.error('Failed to add credits');
                    }
                  }}
                  className="w-full py-2.5 rounded-2xl bg-[#00A389]/10 hover:bg-[#00A389]/20 text-[#00A389] text-xs font-bold transition-colors cursor-pointer"
                >
                  + Grant Bonus Credits (₹)
                </button>
              </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(24,30,75,0.04)] space-y-4 md:col-span-2">
              <h2 className="text-base font-heading font-bold text-[#181E4B] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#DF6951]" />
                School Invoices ({invoices?.length || 0})
              </h2>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {(!invoices || invoices.length === 0) ? (
                  <p className="text-xs text-[#5E6282] py-6 text-center font-medium">No invoices issued for this school yet.</p>
                ) : (
                  invoices.map((inv: any) => (
                    <div
                      key={inv.id}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[rgba(24,30,75,0.06)] text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-[#181E4B]">₹{Number(inv.amount).toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-[#5E6282] mt-0.5">{new Date(inv.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[10px] px-3 py-1 rounded-full font-bold capitalize ${
                            inv.status === 'paid' ? 'bg-[#00A389]/10 text-[#00A389]' : 'bg-[#F1A501]/10 text-[#F1A501]'
                          }`}
                        >
                          {inv.status}
                        </span>
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkInvoicePaid(inv.id)}
                            className="px-3 py-1 rounded-xl bg-[#00A389] text-white text-[11px] font-bold hover:opacity-90 cursor-pointer shadow-xs"
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
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <h2 className="text-base font-heading font-bold text-[#181E4B] flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#DF6951]" />
            Registered Staff &amp; Roles ({users?.length || 0})
          </h2>

          <div className="space-y-2.5">
            {(!users || users.length === 0) ? (
              <p className="text-xs text-[#5E6282] py-8 text-center font-medium">No users registered under this school.</p>
            ) : (
              users.map((u: any) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[rgba(24,30,75,0.06)] text-xs"
                >
                  <div>
                    <div className="font-bold text-[#181E4B]">{u.full_name || 'Staff User'}</div>
                    <div className="text-[11px] text-[#5E6282] mt-0.5">{u.users?.email || 'N/A'}</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-[#FFF1DA] text-[#DF6951]">
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
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <h2 className="text-base font-heading font-bold text-[#181E4B] mb-4">Recent OCR Invocations ({scans?.length || 0})</h2>
          <div className="space-y-2.5">
            {(!scans || scans.length === 0) ? (
              <p className="text-xs text-[#5E6282] py-8 text-center font-medium">No scans recorded yet for this school.</p>
            ) : (
              scans.map((s: any) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[rgba(24,30,75,0.06)] text-xs"
                >
                  <div>
                    <span className="font-bold text-[#181E4B] capitalize">{s.doc_type?.replace('_', ' ')}</span>
                    <span className="text-[11px] text-[#5E6282] ml-3">{new Date(s.created_at).toLocaleString()}</span>
                  </div>
                  <span
                    className={`text-[10px] px-3 py-1 rounded-full font-bold capitalize ${
                      s.status === 'ocr_completed' || s.status === 'reviewed'
                        ? 'bg-[#00A389]/10 text-[#00A389]'
                        : s.status === 'failed'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-[#5956E9]/10 text-[#5956E9]'
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
