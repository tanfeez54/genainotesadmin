'use client';

import { useState, useEffect } from 'react';
import { History, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((result) => {
        setLogs(result.logs || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load audit logs');
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-3xl font-heading font-black text-[#181E4B] tracking-tight">
            Platform Audit Trail
          </h1>
          <span className="text-xs px-3 py-1 rounded-full bg-[#FFF1DA] text-[#DF6951] font-extrabold">
            Immutable Log
          </span>
        </div>
        <p className="text-xs text-[#5E6282] mt-1 font-medium">
          Complete security trail of all administrative actions, school suspensions, and manual updates.
        </p>
      </div>

      <div className="bg-white border border-[rgba(24,30,75,0.08)] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(24,30,75,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#FAF7F2] border-b border-[rgba(24,30,75,0.06)] text-[#181E4B] font-heading font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-4 py-4">Admin Operator</th>
                <th className="px-4 py-4">Action Executed</th>
                <th className="px-4 py-4">Target Entity</th>
                <th className="px-6 py-4">Metadata / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(24,30,75,0.06)] font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#5E6282]">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#5E6282]">
                    No admin actions recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="px-6 py-4 text-[#5E6282] text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-[#181E4B]">{log.platform_admins?.full_name || 'System'}</div>
                      <div className="text-[10px] text-[#5E6282]">{log.platform_admins?.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FFF1DA] text-[#DF6951] font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#181E4B] font-bold">
                      {log.schools?.name || log.target_school_id ? `School: ${log.schools?.name || log.target_school_id}` : 'Platform'}
                    </td>
                    <td className="px-6 py-4 text-[#5E6282] text-[10px] truncate max-w-xs font-mono">
                      {JSON.stringify(log.metadata)}
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
