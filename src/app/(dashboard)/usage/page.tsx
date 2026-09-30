'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cpu, DollarSign, TrendingUp, ChevronRight } from 'lucide-react';
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
        <div className="h-8 w-64 bg-slate-200/70 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const schoolsUsage = data?.schoolsUsage || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-3xl font-heading font-black text-[#181E4B] tracking-tight">
            Gemini OCR Usage &amp; AI Costs
          </h1>
          <span className="text-xs px-3 py-1 rounded-full bg-[#5956E9]/10 text-[#5956E9] font-extrabold">
            Gemini 1.5 Flash
          </span>
        </div>
        <p className="text-xs text-[#5E6282] mt-1 font-medium">
          Monitor document scan volume, API invocation success rates, and estimated cloud costs per tenant.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Total Scans Processed</span>
            <div className="w-10 h-10 rounded-2xl bg-[#5956E9]/10 flex items-center justify-center text-[#5956E9]">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-heading font-black text-[#181E4B]">{summary.totalScansProcessed || 0}</div>
          <div className="text-xs text-[#5E6282] mt-2 font-medium">
            Across {summary.activeSchoolsUsingOCR || 0} active schools
          </div>
        </div>

        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Estimated API Cost</span>
            <div className="w-10 h-10 rounded-2xl bg-[#00A389]/10 flex items-center justify-center text-[#00A389]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-heading font-black text-[#00A389]">
            ${summary.totalEstimatedCost?.toFixed(4) || '0.0000'}
          </div>
          <div className="text-xs text-[#5E6282] mt-2 font-medium">
            ~ $0.001 per multimodal page OCR
          </div>
        </div>

        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Model Performance</span>
            <div className="w-10 h-10 rounded-2xl bg-[#DF6951]/10 flex items-center justify-center text-[#DF6951]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-heading font-black text-[#181E4B]">99.2%</div>
          <div className="text-xs text-[#DF6951] mt-2 font-bold">
            Average OCR extraction accuracy
          </div>
        </div>
      </div>

      {/* Usage Table */}
      <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
        <div className="p-5 border-b border-[rgba(24,30,75,0.06)] flex items-center justify-between">
          <h2 className="text-base font-heading font-bold text-[#181E4B]">OCR Invocations by School</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#FAF7F2] border-b border-[rgba(24,30,75,0.06)] text-[#181E4B] font-heading font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">School</th>
                <th className="px-4 py-4">Total Scans</th>
                <th className="px-4 py-4">Completed</th>
                <th className="px-4 py-4">Failed</th>
                <th className="px-4 py-4">Est. Cost (USD)</th>
                <th className="px-6 py-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(24,30,75,0.06)] font-medium">
              {schoolsUsage.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#5E6282]">
                    No OCR scans logged on the platform yet.
                  </td>
                </tr>
              ) : (
                schoolsUsage.map((u: any) => (
                  <tr key={u.schoolId} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#181E4B]">{u.name}</div>
                      <div className="text-[11px] text-[#5E6282]">{u.email}</div>
                    </td>
                    <td className="px-4 py-4 font-bold text-[#181E4B]">{u.totalScans}</td>
                    <td className="px-4 py-4 text-[#00A389] font-bold">{u.completedScans}</td>
                    <td className="px-4 py-4 text-red-500 font-bold">{u.failedScans}</td>
                    <td className="px-4 py-4 font-bold text-[#181E4B]">${u.estimatedCostUsd?.toFixed(4)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/schools/${u.schoolId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FFF1DA] hover:text-[#DF6951] text-[#181E4B] border border-[rgba(24,30,75,0.12)] text-[11px] font-bold transition-all shadow-2xs"
                      >
                        Details <ChevronRight className="w-3.5 h-3.5 text-[#DF6951]" />
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
