'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Plus,
  ChevronRight,
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-heading font-black text-[#181E4B] tracking-tight">
              Schools Manager
            </h1>
            <span className="text-xs px-3 py-1 rounded-full bg-[#FFF1DA] text-[#DF6951] font-extrabold">
              {schools.length} Total
            </span>
          </div>
          <p className="text-xs text-[#5E6282] mt-1 font-medium">
            Manage all tenant schools, inspect academic stats, toggle active/suspended status.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-2xl text-xs font-bold gradient-jadoo text-white shadow-md shadow-[#DF6951]/25 flex items-center gap-2 hover:opacity-95 transition-all self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Onboard New School
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#5E6282] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by school name, email, or board..."
            className="w-full bg-white border border-[rgba(24,30,75,0.12)] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#181E4B] placeholder:text-[#5E6282]/50 focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10 font-medium shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'active', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#FFF1DA] text-[#DF6951] shadow-xs'
                  : 'bg-white text-[#5E6282] hover:bg-[#FAF7F2] hover:text-[#181E4B] border border-[rgba(24,30,75,0.08)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#FAF7F2] border-b border-[rgba(24,30,75,0.06)] text-[#181E4B] font-heading font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">School Name</th>
                <th className="px-4 py-4">Board / Classes</th>
                <th className="px-4 py-4">Teachers</th>
                <th className="px-4 py-4">Questions</th>
                <th className="px-4 py-4">Papers</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(24,30,75,0.06)] font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#5E6282]">
                    Loading schools data...
                  </td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#5E6282]">
                    No schools matching your search.
                  </td>
                </tr>
              ) : (
                schools.map((s) => {
                  const teacherCount = s.school_users?.[0]?.count || s.num_teachers || 0;
                  const questionCount = s.questions?.[0]?.count || 0;
                  const paperCount = s.question_papers?.[0]?.count || 0;

                  return (
                    <tr key={s.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/schools/${s.id}`} className="font-bold text-[#181E4B] hover:text-[#DF6951] transition-colors">
                          {s.name}
                        </Link>
                        <div className="text-[11px] text-[#5E6282] mt-0.5">{s.contact_email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-[#181E4B] bg-[#FAF7F2] border border-[rgba(24,30,75,0.08)] px-2.5 py-0.5 rounded-full text-[10px]">
                          {s.board || 'CBSE'}
                        </span>
                        <div className="text-[10px] text-[#5E6282] mt-1">{s.classes_range || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4 font-bold text-[#181E4B]">{teacherCount}</td>
                      <td className="px-4 py-4 font-bold text-[#181E4B]">{questionCount}</td>
                      <td className="px-4 py-4 font-bold text-[#181E4B]">{paperCount}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            s.is_active
                              ? 'bg-[#00A389]/10 text-[#00A389]'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {s.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/schools/${s.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FFF1DA] hover:text-[#DF6951] text-[#181E4B] border border-[rgba(24,30,75,0.12)] text-[11px] transition-all font-bold shadow-2xs"
                        >
                          Inspect <ChevronRight className="w-3.5 h-3.5 text-[#DF6951]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(24,30,75,0.06)]">
              <h2 className="text-lg font-heading font-black text-[#181E4B] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#DF6951]/10 flex items-center justify-center text-[#DF6951]">
                  <Building2 className="w-4 h-4" />
                </div>
                Sales-Assisted School Onboarding
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#5E6282] hover:text-[#181E4B] text-lg font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#181E4B] font-bold uppercase tracking-wider mb-1.5">School Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Greenwood International Academy"
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-4 py-2.5 text-[#181E4B] font-medium focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#181E4B] font-bold uppercase tracking-wider mb-1.5">Contact Email *</label>
                  <input
                    type="email"
                    placeholder="principal@greenwood.edu"
                    value={modalData.contact_email}
                    onChange={(e) => setModalData({ ...modalData, contact_email: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-4 py-2.5 text-[#181E4B] font-medium focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#181E4B] font-bold uppercase tracking-wider mb-1.5">Principal / Admin Name</label>
                  <input
                    type="text"
                    placeholder="Dr. R. Sharma"
                    value={modalData.principal_name}
                    onChange={(e) => setModalData({ ...modalData, principal_name: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-4 py-2.5 text-[#181E4B] font-medium focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#181E4B] font-bold uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={modalData.phone}
                    onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-4 py-2.5 text-[#181E4B] font-medium focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10"
                  />
                </div>
                <div>
                  <label className="block text-[#181E4B] font-bold uppercase tracking-wider mb-1.5">Board</label>
                  <input
                    type="text"
                    placeholder="CBSE / ICSE / State"
                    value={modalData.board}
                    onChange={(e) => setModalData({ ...modalData, board: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-4 py-2.5 text-[#181E4B] font-medium focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#181E4B] font-bold uppercase tracking-wider mb-1.5">Classes Range</label>
                  <input
                    type="text"
                    placeholder="e.g. Nursery - 10th"
                    value={modalData.classes_range}
                    onChange={(e) => setModalData({ ...modalData, classes_range: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-4 py-2.5 text-[#181E4B] font-medium focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10"
                  />
                </div>
                <div>
                  <label className="block text-[#181E4B] font-bold uppercase tracking-wider mb-1.5">School Address</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={modalData.address}
                    onChange={(e) => setModalData({ ...modalData, address: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-4 py-2.5 text-[#181E4B] font-medium focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[rgba(24,30,75,0.06)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-white border border-[rgba(24,30,75,0.12)] text-[#181E4B] hover:bg-[#FAF7F2] font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl gradient-jadoo text-white font-bold shadow-md shadow-[#DF6951]/25 hover:opacity-95 disabled:opacity-50 cursor-pointer transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(24,30,75,0.06)]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#00A389]/10 border border-[#00A389]/20 flex items-center justify-center">
                  <MailCheck className="w-5 h-5 text-[#00A389]" />
                </div>
                <div>
                  <h2 className="text-base font-heading font-black text-[#181E4B]">School Onboarded Successfully!</h2>
                  <p className="text-[11px] text-[#5E6282] font-medium">Invitation email dispatched to recipient.</p>
                </div>
              </div>
              <button onClick={() => setSuccessInfo(null)} className="text-[#5E6282] hover:text-[#181E4B] text-lg font-bold p-1">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-[#FAF7F2] border border-[rgba(24,30,75,0.06)] rounded-2xl p-4">
              <div className="flex justify-between">
                <span className="text-[#5E6282] font-medium">School Name:</span>
                <span className="font-bold text-[#181E4B]">{successInfo.schoolName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E6282] font-medium">Admin Email:</span>
                <span className="font-bold text-[#DF6951]">{successInfo.email}</span>
              </div>
              {successInfo.otp && (
                <div className="flex justify-between items-center pt-2 border-t border-[rgba(24,30,75,0.06)]">
                  <span className="text-[#5E6282] font-medium">6-Digit Activation Code:</span>
                  <span className="font-bold text-[#00A389] tracking-widest text-sm bg-white px-3 py-1 rounded-xl border border-[#00A389]/20">
                    {successInfo.otp}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#181E4B] block uppercase tracking-wider">
                Direct Set-Password Activation Link (Valid for 7 days):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={successInfo.activationUrl}
                  className="flex-1 bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl px-3.5 py-2.5 text-xs text-[#181E4B] font-medium select-all"
                />
                <button
                  onClick={handleCopyActivationLink}
                  className="px-4 py-2.5 rounded-2xl bg-[#181E4B] hover:bg-[#2A3370] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {hasCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-[rgba(24,30,75,0.06)]">
              <button
                onClick={() => setSuccessInfo(null)}
                className="px-5 py-2.5 rounded-2xl bg-white border border-[rgba(24,30,75,0.12)] text-[#181E4B] hover:bg-[#FAF7F2] text-xs font-bold cursor-pointer transition-all"
              >
                Close
              </button>
              <a
                href={successInfo.activationUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-2xl gradient-jadoo text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#DF6951]/25 hover:opacity-95 cursor-pointer transition-all"
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
