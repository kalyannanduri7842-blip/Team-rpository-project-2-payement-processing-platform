import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/StatusBadge';
import { ShieldAlert, ShieldCheck, Check, X, AlertTriangle } from 'lucide-react';

export const FraudAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const toast = useToast();

  const fetchAlerts = async () => {
    const res = await api.fraud.getAlerts();
    if (res.success && res.data) {
      setAlerts(res.data);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id: string, status: 'RESOLVED_APPROVED' | 'RESOLVED_REJECTED') => {
    try {
      const res = await api.fraud.resolveAlert(id, status, 'Reviewed and verified by Administrator');
      if (res.success) {
        toast.success('Alert Resolved', `Marked as ${status === 'RESOLVED_APPROVED' ? 'Approved' : 'Blocked'}`);
        fetchAlerts();
      }
    } catch (e: any) {
      toast.error('Resolution Error', e.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-800" /> Fraud & Risk Monitoring Console
        </h2>
        <p className="text-xs text-slate-500">Real-time risk scoring, anomalous velocity checks, and flagged high-value transactions.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Alert ID</th>
                <th className="py-3.5 px-4">Payment ID</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Triggered Heuristics</th>
                <th className="py-3.5 px-4">Review Status</th>
                <th className="py-3.5 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No fraud alerts detected. Network operating normally.
                  </td>
                </tr>
              ) : (
                alerts.map(a => (
                  <tr key={a.id} className="hover:bg-emerald-50/30 transition-colors text-slate-700">
                    <td className="py-3.5 px-4 font-mono text-slate-500">{a.id}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-900 font-semibold">{a.paymentId}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">{a.riskScore} / 100</td>
                    <td className="py-3.5 px-4"><StatusBadge status={a.riskLevel} /></td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {a.triggeredRules?.map((rule: string) => (
                          <span key={rule} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-mono border border-amber-200">
                            {rule}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><StatusBadge status={a.status} /></td>
                    <td className="py-3.5 px-4 text-right">
                      {a.status === 'PENDING_REVIEW' ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleResolve(a.id, 'RESOLVED_APPROVED')}
                            className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all shadow-2xs"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleResolve(a.id, 'RESOLVED_REJECTED')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all shadow-2xs"
                          >
                            <X className="w-3 h-3" /> Block
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-medium">Resolved</span>
                      )}
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
};
