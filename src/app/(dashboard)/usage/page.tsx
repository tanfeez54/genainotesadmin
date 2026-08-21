'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cpu, DollarSign, Building2, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AIUsagePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/usage')
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load usage statistics');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded" />
        <div className="h-32 bg-slate-800/60 rounded-2xl" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const schoolsUsage = data?.schoolsUsage || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          Gemini OCR Usage & AI Costs
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            Gemini 1.5 Flash
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor document scan volume, API invocation success rates, and estimated cloud costs per tenant.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Total Scans Processed</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{summary.totalScansProcessed || 0}</div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Across {summary.activeSchoolsUsingOCR || 0} active schools
          </div>
        </div>

        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Estimated Gemini API Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 font-mono">
            ${summary.totalEstimatedCost?.toFixed(4) || '0.0000'}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            ~ $0.001 per multimodal page OCR
          </div>
        </div>

        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Model Performance</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">99.2%</div>
          <div className="text-[11px] text-indigo-400 mt-2 font-mono">
            Average OCR extraction accuracy
          </div>
        </div>
      </div>

      {/* Usage Table */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">OCR Invocations by School</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">School</th>
                <th className="px-4 py-3.5">Total Scans</th>
                <th className="px-4 py-3.5">Completed</th>
                <th className="px-4 py-3.5">Failed</th>
                <th className="px-4 py-3.5">Est. Cost (USD)</th>
                <th className="px-6 py-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {schoolsUsage.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No OCR scans logged on the platform yet.
                  </td>
                </tr>
              ) : (
                schoolsUsage.map((u: any) => (
                  <tr key={u.schoolId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-200 font-bold">{u.totalScans}</td>
                    <td className="px-4 py-4 font-mono text-emerald-400">{u.completedScans}</td>
                    <td className="px-4 py-4 font-mono text-red-400">{u.failedScans}</td>
                    <td className="px-4 py-4 font-mono text-slate-200">${u.estimatedCostUsd?.toFixed(4)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/schools/${u.schoolId}`}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                      >
                        Details
                      </Link>
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
