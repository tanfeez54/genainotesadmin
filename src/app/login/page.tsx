'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight, Zap, Copy, Check } from 'lucide-react';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@notegen.internal');
  const [password, setPassword] = useState('AdminPassword123!');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  function fillDefaultCredentials() {
    setEmail('admin@notegen.internal');
    setPassword('AdminPassword123!');
    toast.success('Default admin credentials filled!');
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      toast.success('Authenticated as Platform Admin');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Jadoo warm gradient blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#DF6951]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F1A501]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#DF6951]/5 to-[#F1A501]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-3xl gradient-jadoo flex items-center justify-center shadow-xl shadow-[#DF6951]/25 mb-4 ring-4 ring-[#FFF1DA]">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-[#DF6951] bg-[#DF6951]/10 px-3.5 py-1 rounded-full">
            Admin Console
          </span>
          <h1 className="text-3xl font-heading font-black text-[#181E4B] mt-2 tracking-tight">
            NoteGen <span className="gradient-jadoo-text">Master</span>
          </h1>
          <p className="text-xs text-[#5E6282] mt-1 font-medium">Internal Super Admin Management Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-[rgba(24,30,75,0.08)] rounded-[32px] p-8 sm:p-10 shadow-[0_20px_60px_rgba(24,30,75,0.06)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-bold text-[#181E4B]">Super Admin Sign In</h2>
              <p className="text-xs text-[#5E6282] mt-0.5 font-medium">Restricted platform operator access.</p>
            </div>
            <button
              type="button"
              onClick={fillDefaultCredentials}
              className="px-3 py-1.5 rounded-full bg-[#FFF1DA] text-[#DF6951] hover:bg-[#FFE6BE] text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Click to auto-fill default admin login"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Default Login
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#181E4B] uppercase tracking-wider mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5E6282] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@notegen.internal"
                  className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#181E4B] placeholder:text-[#5E6282]/50 focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#181E4B] uppercase tracking-wider mb-2">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5E6282] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAF7F2] border border-[rgba(24,30,75,0.12)] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#181E4B] placeholder:text-[#5E6282]/50 focus:outline-none focus:border-[#DF6951] focus:ring-4 focus:ring-[#DF6951]/10 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 gradient-jadoo text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-[#DF6951]/25 disabled:opacity-50 text-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Access Platform
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Default Credentials Pill */}
          <div className="mt-6 p-4 rounded-2xl bg-[#FAF7F2] border border-[rgba(24,30,75,0.06)] text-xs">
            <div className="flex items-center justify-between font-bold text-[#181E4B] mb-1.5">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#DF6951]">
                <Zap className="w-3.5 h-3.5 fill-current" /> Default Admin Credentials
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('admin@notegen.internal / AdminPassword123!');
                  setCopied(true);
                  toast.success('Credentials copied');
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="text-[#5E6282] hover:text-[#181E4B] flex items-center gap-1 text-[11px] font-bold cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-[#5E6282]">
              <div>Email: <strong className="text-[#181E4B]">admin@notegen.internal</strong></div>
              <div>Password: <strong className="text-[#181E4B]">AdminPassword123!</strong></div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[11px] text-[#5E6282] font-medium flex items-center justify-center gap-1.5">
              <span>🛡️</span> Multi-Tenant Encrypted Session &amp; Audit Trail
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
