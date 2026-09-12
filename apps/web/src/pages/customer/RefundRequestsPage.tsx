import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { RotateCcw, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const RefundRequestsPage: React.FC = () => {
  const { profile } = useAuth();
  const [refunds, setRefunds] = useState<any[]>([]);

  useEffect(() => {
    async function loadRefunds() {
      if (profile?.id) {
        try {
          const res = await api.refunds.list({ customerId: profile.id });
          if (res.success && res.data) {
            setRefunds(res.data);
          }
        } catch (e) {}
      }
    }
    loadRefunds();
  }, [profile]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-emerald-800" /> Refund Requests & Reversals
        </h2>
        <p className="text-xs text-slate-500">Track all initiated and processed refunds across merchants.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Refund ID</th>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No refunds requested yet.
                  </td>
                </tr>
              ) : (
                refunds.map(r => (
                  <tr key={r.id} className="hover:bg-emerald-50/30 transition-colors text-slate-700">
                    <td className="py-3.5 px-4 font-mono text-slate-500">{r.id}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-900 font-semibold">{r.transactionId}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">+${r.amount.toFixed(2)} {r.currency}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{r.reason.replace(/_/g, ' ')}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
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
