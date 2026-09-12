import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { FileText, Search, Shield } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadAudit() {
      const res = await api.monitoring.getAuditLogs({ limit: 100 });
      if (res.success && res.data) {
        setLogs(res.data);
      }
    }
    loadAudit();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-800" /> Platform Security & Audit Trail
        </h2>
        <p className="text-xs text-slate-500">Tamper-evident record of all logins, role modifications, payment creations, and admin actions.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Audit ID</th>
                <th className="py-3.5 px-4">Actor Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Resource</th>
                <th className="py-3.5 px-4">Correlation ID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-emerald-50/30 transition-colors text-slate-700">
                  <td className="py-3.5 px-4 font-mono text-slate-500">{l.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{l.actorEmail}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{l.actorRole}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-900 font-semibold">{l.action}</td>
                  <td className="py-3.5 px-4 text-slate-600">{l.resource}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{l.correlationId}</td>
                  <td className="py-3.5 px-4"><StatusBadge status={l.status} /></td>
                  <td className="py-3.5 px-4 text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
