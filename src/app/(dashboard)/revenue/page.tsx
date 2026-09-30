'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export default function RevenueDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRevenue();
  }, []);

  async function fetchRevenue() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/revenue');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load revenue data');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkPaid(invoiceId: string) {
    setPayingId(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to mark invoice as paid');

      toast.success('Invoice marked as Paid & School subscription activated');
      fetchRevenue();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error processing invoice');
    } finally {
      setPayingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-64 bg-slate-200/70 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const plans = data?.plans || [];
  const planCounts = data?.planCounts || {};
  const invoices = (data?.invoices || []).filter((inv: any) =>
    filterStatus === 'all' ? true : inv.status === filterStatus
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-heading font-black text-[#181E4B] tracking-tight">
              Revenue &amp; Subscription Billing
            </h1>
            <span className="text-xs px-3 py-1 rounded-full bg-[#00A389]/10 text-[#00A389] font-extrabold">
              Live MRR
            </span>
          </div>
          <p className="text-xs text-[#5E6282] mt-1 font-medium">
            Track Monthly Recurring Revenue (MRR), subscription conversions, and invoice settlements.
          </p>
        </div>

        <button
          onClick={fetchRevenue}
          className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white text-[#181E4B] border border-[rgba(24,30,75,0.12)] hover:bg-[#FAF7F2] flex items-center gap-2 shadow-xs transition-all self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#DF6951]" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MRR */}
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Monthly Recurring</span>
            <div className="w-10 h-10 rounded-2xl bg-[#00A389]/10 flex items-center justify-center text-[#00A389]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-[#00A389]">
            ₹{metrics.mrr?.toLocaleString('en-IN') || 0}
          </div>
          <div className="text-xs text-[#5E6282] mt-2 font-medium">
            ARR: ₹{(metrics.arr || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Active Paid Subscribers */}
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Active Paid Schools</span>
            <div className="w-10 h-10 rounded-2xl bg-[#DF6951]/10 flex items-center justify-center text-[#DF6951]">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-[#181E4B]">{metrics.activeSubscribers || 0}</div>
          <div className="text-xs text-[#DF6951] mt-2 font-bold">
            {metrics.trialSubscribers || 0} in 14-day free trial
          </div>
        </div>

        {/* Total Collected Revenue */}
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Total Collected</span>
            <div className="w-10 h-10 rounded-2xl bg-[#5956E9]/10 flex items-center justify-center text-[#5956E9]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-[#181E4B]">
            ₹{(metrics.totalCollectedRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-[#5E6282] mt-2 font-medium">
            Lifetime invoice settlements
          </div>
        </div>

        {/* Overdue / Past Due */}
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Outstanding Invoices</span>
            <div className="w-10 h-10 rounded-2xl bg-[#F1A501]/10 flex items-center justify-center text-[#F1A501]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-[#F1A501]">
            ₹{(metrics.outstandingOverdueAmount || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-[#5E6282] mt-2 font-medium">
            {metrics.pastDueSubscribers || 0} schools with past-due status
          </div>
        </div>
      </div>

      {/* Subscription Plans Distribution */}
      <div>
        <h2 className="text-base font-heading font-bold text-[#181E4B] mb-4">Platform Subscription Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p: any) => (
            <div
              key={p.id}
              className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(24,30,75,0.04)] hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-[#181E4B] text-base">{p.name}</span>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#FFF1DA] text-[#DF6951]">
                  {planCounts[p.name] || 0} Schools
                </span>
              </div>
              <div className="text-3xl font-heading font-black text-[#181E4B] mt-3">
                ₹{p.price_monthly?.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-[#5E6282]">/ month</span>
              </div>
              <div className="text-xs text-[#5E6282] mt-4 space-y-1.5 font-medium">
                <div>• Max {p.max_teachers} teachers per school</div>
                <div>• Up to {p.max_scans_per_month} AI OCR scans/month</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
        <div className="p-5 border-b border-[rgba(24,30,75,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-heading font-bold text-[#181E4B] flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#DF6951]" />
            Invoices &amp; Settlements
          </h2>

          <div className="flex items-center gap-2">
            {['all', 'pending', 'paid', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-[#FFF1DA] text-[#DF6951]'
                    : 'bg-[#FAF7F2] text-[#5E6282] hover:bg-[#FFF1DA]/50 hover:text-[#181E4B]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#FAF7F2] border-b border-[rgba(24,30,75,0.06)] text-[#181E4B] font-heading font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-4 py-4">School</th>
                <th className="px-4 py-4">Plan</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Payment Method</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(24,30,75,0.06)] font-medium">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#5E6282]">
                    No invoices matching status filter.
                  </td>
                </tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="px-6 py-4 text-[#5E6282] font-mono text-[11px]">
                      INV-{inv.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-4 font-bold text-[#181E4B]">
                      {inv.schools?.name || 'School Tenant'}
                    </td>
                    <td className="px-4 py-4 text-[#5E6282]">
                      {inv.subscription_plans?.name || 'Standard'}
                    </td>
                    <td className="px-4 py-4 font-bold text-[#181E4B]">
                      ₹{Number(inv.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full font-bold capitalize ${
                          inv.status === 'paid'
                            ? 'bg-[#00A389]/10 text-[#00A389]'
                            : inv.status === 'pending'
                            ? 'bg-[#F1A501]/10 text-[#F1A501]'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#5E6282] capitalize">
                      {inv.payment_gateway?.replace('_', ' ') || 'Cashfree'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkPaid(inv.id)}
                          disabled={payingId === inv.id}
                          className="px-3.5 py-1.5 rounded-xl bg-[#00A389] hover:opacity-90 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                        >
                          {payingId === inv.id ? 'Processing...' : 'Mark as Paid'}
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
    </div>
  );
}
