'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  ScanText,
  FileSpreadsheet,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function PlatformDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-slate-200/70 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentSchools = data?.recentSchools || [];
  const recentScans = data?.recentScans || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-heading font-black text-[#181E4B] tracking-tight">
              Platform Overview
            </h1>
            <span className="text-xs px-3 py-1 rounded-full bg-[#FFF1DA] text-[#DF6951] font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#DF6951] animate-ping" />
              Live Feed
            </span>
          </div>
          <p className="text-xs text-[#5E6282] mt-1 font-medium">
            Real-time multi-tenant health, metrics, and Gemini OCR usage across all schools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/schools"
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white text-[#181E4B] border border-[rgba(24,30,75,0.12)] hover:bg-[#FAF7F2] flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-[#DF6951]" />
            Manage Schools
          </Link>
          <Link
            href="/usage"
            className="px-4 py-2.5 rounded-2xl text-xs font-bold gradient-jadoo text-white shadow-md shadow-[#DF6951]/25 flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            AI Usage &amp; Costs
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Schools */}
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(24,30,75,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Total Schools</span>
            <div className="w-10 h-10 rounded-2xl bg-[#DF6951]/10 flex items-center justify-center text-[#DF6951]">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-heading font-black text-[#181E4B] tracking-tight">{stats.totalSchools || 0}</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-[#00A389] font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{stats.activeSchools || 0} active tenants</span>
          </div>
        </div>

        {/* Total Teachers / Staff */}
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(24,30,75,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Teachers &amp; Staff</span>
            <div className="w-10 h-10 rounded-2xl bg-[#F1A501]/10 flex items-center justify-center text-[#F1A501]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-heading font-black text-[#181E4B] tracking-tight">{stats.totalTeachers || 0}</div>
          <div className="text-xs text-[#5E6282] mt-3 font-medium">
            Across {stats.totalSchools || 0} registered schools
          </div>
        </div>

        {/* Total OCR Scans */}
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(24,30,75,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">AI OCR Docs</span>
            <div className="w-10 h-10 rounded-2xl bg-[#5956E9]/10 flex items-center justify-center text-[#5956E9]">
              <ScanText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-heading font-black text-[#181E4B] tracking-tight">{stats.totalScans || 0}</div>
          <div className="text-xs text-[#5956E9] mt-3 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Vision Processed</span>
          </div>
        </div>

        {/* Papers Generated */}
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(24,30,75,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Papers Generated</span>
            <div className="w-10 h-10 rounded-2xl bg-[#00A389]/10 flex items-center justify-center text-[#00A389]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-heading font-black text-[#181E4B] tracking-tight">{stats.totalPapers || 0}</div>
          <div className="text-xs text-[#5E6282] mt-3 font-medium">
            {stats.totalQuestions || 0} bank questions
          </div>
        </div>
      </div>

      {/* Grid: Recent Schools & Recent OCR Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Schools */}
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-heading font-bold text-[#181E4B] flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-[#DF6951]" />
              Recently Onboarded Schools
            </h2>
            <Link href="/schools" className="text-xs font-bold text-[#DF6951] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentSchools.length === 0 ? (
              <p className="text-xs text-[#5E6282] py-8 text-center font-medium">No schools onboarded yet.</p>
            ) : (
              recentSchools.map((s: any) => (
                <Link key={s.id} href={`/schools/${s.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[rgba(24,30,75,0.06)] hover:border-[#DF6951]/40 hover:bg-white transition-all group shadow-xs">
                    <div>
                      <div className="text-xs font-bold text-[#181E4B] group-hover:text-[#DF6951] transition-colors">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-[#5E6282] mt-0.5">{s.contact_email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#181E4B] border border-[rgba(24,30,75,0.08)]">
                        {s.board || 'CBSE'}
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          s.is_active
                            ? 'bg-[#00A389]/10 text-[#00A389]'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {s.is_active ? 'Active' : 'Suspended'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#5E6282] group-hover:text-[#DF6951] transition-colors" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Scans */}
        <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-heading font-bold text-[#181E4B] flex items-center gap-2.5">
              <ScanText className="w-5 h-5 text-[#5956E9]" />
              Recent OCR Pipeline Activity
            </h2>
            <Link href="/usage" className="text-xs font-bold text-[#5956E9] hover:underline flex items-center gap-1">
              Usage Log <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentScans.length === 0 ? (
              <p className="text-xs text-[#5E6282] py-8 text-center font-medium">No OCR scans processed yet.</p>
            ) : (
              recentScans.map((scan: any) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[rgba(24,30,75,0.06)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#5956E9]/10 flex items-center justify-center text-[#5956E9] text-sm">
                      📄
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#181E4B]">
                        {scan.schools?.name || 'School Document'}
                      </div>
                      <div className="text-[11px] text-[#5E6282] capitalize">
                        {scan.doc_type?.replace('_', ' ')} • {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold capitalize ${
                      scan.status === 'ocr_completed'
                        ? 'bg-[#00A389]/10 text-[#00A389]'
                        : scan.status === 'failed'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-[#5956E9]/10 text-[#5956E9]'
                    }`}
                  >
                    {scan.status?.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
