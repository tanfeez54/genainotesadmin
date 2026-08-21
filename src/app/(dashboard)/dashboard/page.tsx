'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  ScanText,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Cpu,
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
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800/60 rounded-2xl" />
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
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Platform Overview
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              Live Feed
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tenant health, metrics, and Gemini OCR usage across all schools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/schools"
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            Manage Schools
          </Link>
          <Link
            href="/usage"
            className="px-3.5 py-2 rounded-xl text-xs font-medium gradient-kavion text-white shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 hover:opacity-95 transition-opacity"
          >
            <Cpu className="w-3.5 h-3.5" />
            AI Usage & Costs
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Schools */}
        <div className="bg-[#0f172a]/90 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Schools</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{stats.totalSchools}</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>{stats.activeSchools} active on platform</span>
          </div>
        </div>

        {/* Total Teachers / Staff */}
        <div className="bg-[#0f172a]/90 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Teachers & Staff</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{stats.totalTeachers}</div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Across {stats.totalSchools} registered schools
          </div>
        </div>

        {/* Total OCR Scans */}
        <div className="bg-[#0f172a]/90 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">AI OCR Documents</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <ScanText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{stats.totalScans}</div>
          <div className="text-[11px] text-cyan-400 mt-2 font-mono flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            <span>Gemini Vision Processed</span>
          </div>
        </div>

        {/* Papers Generated */}
        <div className="bg-[#0f172a]/90 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Papers Generated</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{stats.totalPapers}</div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            {stats.totalQuestions} questions in banks
          </div>
        </div>
      </div>

      {/* Grid: Recent Schools & Recent OCR Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Schools */}
        <div className="bg-[#0f172a]/90 border border-slate-800/80 rounded-2xl p-6 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Recently Onboarded Schools
            </h2>
            <Link href="/schools" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentSchools.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No schools onboarded yet.</p>
            ) : (
              recentSchools.map((s: any) => (
                <Link key={s.id} href={`/schools/${s.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div>
                      <div className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{s.contact_email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {s.board || 'CBSE'}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          s.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {s.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Scans */}
        <div className="bg-[#0f172a]/90 border border-slate-800/80 rounded-2xl p-6 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <ScanText className="w-4 h-4 text-cyan-400" />
              Recent OCR Pipeline Activity
            </h2>
            <Link href="/usage" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Usage Log <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentScans.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No OCR scans processed yet.</p>
            ) : (
              recentScans.map((scan: any) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs">
                      📄
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-200">
                        {scan.schools?.name || 'School Document'}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {scan.doc_type?.replace('_', ' ')} • {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono capitalize ${
                      scan.status === 'ocr_completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : scan.status === 'failed'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
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
