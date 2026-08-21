'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Plus,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Filter,
  Users,
  FileSpreadsheet,
  ScanText,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  MailCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolsManagerPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Manual onboard modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    name: '',
    contact_email: '',
    phone: '',
    board: 'CBSE',
    address: '',
    classes_range: 'Nursery - 10th',
    principal_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Onboard Success Modal
  const [successInfo, setSuccessInfo] = useState<{
    schoolName: string;
    email: string;
    otp?: string;
    activationUrl: string;
  } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, [search, statusFilter]);

  async function fetchSchools() {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('q', search);
      if (statusFilter !== 'all') query.set('status', statusFilter);

      const res = await fetch(`/api/schools?${query.toString()}`);
      const data = await res.json();
      if (data.schools) setSchools(data.schools);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load schools');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateSchool(e: React.FormEvent) {
    e.preventDefault();
    if (!modalData.name || !modalData.contact_email) {
      toast.error('Name and Contact Email are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create school');

      toast.success('School onboarded and invite link generated!');
      setShowModal(false);

      if (data.activationUrl) {
        setSuccessInfo({
          schoolName: modalData.name,
          email: modalData.contact_email,
          otp: data.otp,
          activationUrl: data.activationUrl,
        });
      }

      setModalData({
        name: '',
        contact_email: '',
        phone: '',
        board: 'CBSE',
        address: '',
        classes_range: 'Nursery - 10th',
        principal_name: '',
      });
      fetchSchools();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error creating school');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCopyActivationLink() {
    if (!successInfo?.activationUrl) return;
    navigator.clipboard.writeText(successInfo.activationUrl);
    setHasCopied(true);
    toast.success('Activation link copied to clipboard!');
    setTimeout(() => setHasCopied(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Schools Manager
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              {schools.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage all tenant schools, inspect academic stats, toggle active/suspended status.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-medium gradient-kavion text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:opacity-95 transition-opacity self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Onboard New School
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by school name, email, or board..."
            className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'active', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-[#0f172a] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">School Name</th>
                <th className="px-4 py-3.5">Board / Classes</th>
                <th className="px-4 py-3.5">Teachers</th>
                <th className="px-4 py-3.5">Questions</th>
                <th className="px-4 py-3.5">Papers</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-mono">
                    Loading schools data...
                  </td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No schools matching your search.
                  </td>
                </tr>
              ) : (
                schools.map((s) => {
                  const teacherCount = s.school_users?.[0]?.count || s.num_teachers || 0;
                  const questionCount = s.questions?.[0]?.count || 0;
                  const paperCount = s.question_papers?.[0]?.count || 0;

                  return (
                    <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/schools/${s.id}`} className="font-semibold text-slate-100 hover:text-indigo-400 transition-colors">
                          {s.name}
                        </Link>
                        <div className="text-[11px] text-slate-500 mt-0.5">{s.contact_email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                          {s.board || 'CBSE'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">{s.classes_range || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-300">{teacherCount}</td>
                      <td className="px-4 py-4 font-mono text-slate-300">{questionCount}</td>
                      <td className="px-4 py-4 font-mono text-slate-300">{paperCount}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full ${
                            s.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {s.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/schools/${s.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-300 text-slate-300 border border-slate-700/60 text-[11px] transition-all font-medium"
                        >
                          Inspect <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Onboard Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Sales-Assisted School Onboarding
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">School Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Greenwood International Academy"
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Email *</label>
                  <input
                    type="email"
                    placeholder="principal@greenwood.edu"
                    value={modalData.contact_email}
                    onChange={(e) => setModalData({ ...modalData, contact_email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Principal / Admin Name</label>
                  <input
                    type="text"
                    placeholder="Dr. R. Sharma"
                    value={modalData.principal_name}
                    onChange={(e) => setModalData({ ...modalData, principal_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={modalData.phone}
                    onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Board</label>
                  <input
                    type="text"
                    placeholder="CBSE / ICSE / State"
                    value={modalData.board}
                    onChange={(e) => setModalData({ ...modalData, board: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Classes Range</label>
                  <input
                    type="text"
                    placeholder="e.g. Nursery - 10th"
                    value={modalData.classes_range}
                    onChange={(e) => setModalData({ ...modalData, classes_range: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">School Address</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={modalData.address}
                    onChange={(e) => setModalData({ ...modalData, address: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl gradient-kavion text-white font-medium shadow-md hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Onboarding...' : 'Create & Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboard Success & Direct Activation Link Modal */}
      {successInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <MailCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">School Onboarded Successfully!</h2>
                  <p className="text-[11px] text-slate-400">Invitation email dispatched to recipient.</p>
                </div>
              </div>
              <button onClick={() => setSuccessInfo(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-slate-400">School Name:</span>
                <span className="font-semibold text-white">{successInfo.schoolName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admin Email:</span>
                <span className="font-mono text-indigo-400">{successInfo.email}</span>
              </div>
              {successInfo.otp && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-slate-400">6-Digit Activation Code:</span>
                  <span className="font-mono text-emerald-400 font-bold tracking-widest text-sm bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    {successInfo.otp}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Direct Set-Password Activation Link (Valid for 7 days):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={successInfo.activationUrl}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-300 select-all"
                />
                <button
                  onClick={handleCopyActivationLink}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {hasCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                onClick={() => setSuccessInfo(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
              <a
                href={successInfo.activationUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl gradient-kavion text-white text-xs font-medium flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Activation Page
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
