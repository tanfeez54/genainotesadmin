'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Building2,
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
        <div className="h-8 w-64 bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800/60 rounded-2xl" />
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
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Revenue & Subscription Billing
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Live MRR
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track Monthly Recurring Revenue (MRR), subscription conversions, and invoice settlements.
          </p>
        </div>

        <button
          onClick={fetchRevenue}
          className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Monthly Recurring Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400 font-mono">
            ₹{metrics.mrr?.toLocaleString('en-IN') || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            ARR: ₹{(metrics.arr || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Active Paid Subscribers */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Active Paid Schools</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{metrics.activeSubscribers || 0}</div>
          <div className="text-[11px] text-indigo-400 mt-2 font-mono">
            {metrics.trialSubscribers || 0} currently in 14-day trial
          </div>
        </div>

        {/* Total Collected Revenue */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Collected Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            ₹{(metrics.totalCollectedRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Lifetime invoice settlements
          </div>
        </div>

        {/* Overdue / Past Due */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Outstanding Invoices</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono">
            ₹{(metrics.outstandingOverdueAmount || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            {metrics.pastDueSubscribers || 0} schools with past-due status
          </div>
        </div>
      </div>

      {/* Subscription Plans Distribution */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Platform Subscription Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p: any) => (
            <div
              key={p.id}
              className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{p.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {planCounts[p.name] || 0} Schools
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-100 font-mono mt-2">
                ₹{p.price_monthly?.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-slate-500">/ month</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-3 space-y-1">
                <div>• Max {p.max_teachers} teachers per school</div>
                <div>• Up to {p.max_scans_per_month} AI OCR scans/month</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Invoices & Settlements
          </h2>

          <div className="flex items-center gap-2">
            {['all', 'pending', 'paid', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                  filterStatus === status
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-mono">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">School</th>
                <th className="px-4 py-3.5">Plan</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-sans text-xs">
                    No invoices matching status filter.
                  </td>
                </tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      INV-{inv.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-4 font-sans font-medium text-slate-200">
                      {inv.schools?.name || 'School Tenant'}
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {inv.subscription_plans?.name || 'Standard'}
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-100">
                      ₹{Number(inv.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full capitalize ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : inv.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400 capitalize">
                      {inv.payment_gateway?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkPaid(inv.id)}
                          disabled={payingId === inv.id}
                          className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-sans font-medium transition-colors cursor-pointer"
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
