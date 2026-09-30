'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Cpu,
  History,
  Users,
  LogOut,
  ChevronRight,
  Menu,
  X,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { href: '/dashboard', label: 'Platform Overview', icon: LayoutDashboard },
  { href: '/schools', label: 'Schools Manager', icon: Building2 },
  { href: '/revenue', label: 'Revenue & Billing', icon: DollarSign },
  { href: '/usage', label: 'OCR & AI Costs', icon: Cpu },
  { href: '/audit-logs', label: 'Audit Trail', icon: History },
  { href: '/team', label: 'Platform Team', icon: Users },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        setAdmin(data.admin);
        setIsLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Signed out from Admin Console');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDFB]">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-3xl gradient-jadoo flex items-center justify-center shadow-xl shadow-[#DF6951]/25 mb-4 animate-bounce">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <p className="text-xs font-bold text-[#5E6282] uppercase tracking-wider">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FFFDFB] text-[#181E4B] overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col flex-shrink-0 w-64 bg-white border-r border-[rgba(24,30,75,0.08)] shadow-[4px_0_24px_rgba(24,30,75,0.02)]">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[rgba(24,30,75,0.06)]">
          <div className="w-10 h-10 rounded-2xl gradient-jadoo flex items-center justify-center shadow-md shadow-[#DF6951]/20 ring-2 ring-[#FFF1DA]">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-heading font-black text-lg text-[#181E4B] tracking-tight">
              NoteGen
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#DF6951] bg-[#DF6951]/10 px-2 py-0.5 rounded-full inline-block">
              Super Admin
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FFF1DA] text-[#DF6951] shadow-sm'
                      : 'text-[#5E6282] hover:bg-[#FAF7F2] hover:text-[#181E4B]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#DF6951]' : 'text-[#5E6282]'}`} />
                  {label}
                  {isActive && <ChevronRight className="ml-auto w-3.5 h-3.5 text-[#DF6951]" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Admin User Footnote */}
        <div className="p-4 border-t border-[rgba(24,30,75,0.06)] bg-[#FAF7F2]/60">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white border border-[rgba(24,30,75,0.06)] shadow-xs mb-2">
            <div className="w-8 h-8 rounded-full gradient-jadoo flex items-center justify-center text-white text-xs font-extrabold">
              {admin?.fullName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#181E4B] truncate">{admin?.fullName || 'Super Admin'}</div>
              <div className="text-[10px] text-[#5E6282] capitalize truncate">{admin?.role?.replace('_', ' ') || 'Platform Admin'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-[rgba(24,30,75,0.08)] transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(24,30,75,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl gradient-jadoo flex items-center justify-center shadow-md shadow-[#DF6951]/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-heading font-black text-lg text-[#181E4B]">NoteGen</div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#DF6951] bg-[#DF6951]/10 px-2 py-0.5 rounded-full inline-block">Super Admin</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-[#5E6282] hover:text-[#181E4B] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FFF1DA] text-[#DF6951]'
                      : 'text-[#5E6282] hover:bg-[#FAF7F2] hover:text-[#181E4B]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#DF6951]' : 'text-[#5E6282]'}`} />
                  {label}
                  {isActive && <ChevronRight className="ml-auto w-3.5 h-3.5 text-[#DF6951]" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[rgba(24,30,75,0.06)] bg-[#FAF7F2]/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#FFFDFB]">
        {/* Top bar on Mobile */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-[rgba(24,30,75,0.08)] bg-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#DF6951]" />
            <span className="font-heading font-black text-sm text-[#181E4B]">NoteGen Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-xl text-[#5E6282] hover:text-[#181E4B]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#FFFDFB]">
          {children}
        </main>
      </div>
    </div>
  );
}
