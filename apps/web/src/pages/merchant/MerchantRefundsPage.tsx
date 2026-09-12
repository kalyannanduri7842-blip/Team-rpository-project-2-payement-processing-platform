import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { RotateCcw, Check, X } from 'lucide-react';

export const MerchantRefundsPage: React.FC = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [refunds, setRefunds] = useState<any[]>([]);

  const fetchRefunds = async () => {
    if (profile?.id) {
      const res = await api.refunds.list({ merchantId: profile.id });
      if (res.success && res.data) {
        setRefunds(res.data);
      }
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [profile]);

  const handleUpdateStatus = async (id: string, status: 'COMPLETED' | 'REJECTED') => {
    try {
      const res = await api.refunds.updateStatus(id, status);
      if (res.success) {
        toast.success(`Refund ${status}`, `Refund status updated to ${status}`);
        fetchRefunds();
      }
    } catch (e: any) {
      toast.error('Error', e.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-emerald-800" /> Customer Refund Management
        </h2>
        <p className="text-xs text-slate-500">Review, approve, or reject customer initiated refund requests.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Refund ID</th>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Refund Amount</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No refunds requested for this merchant.
                  </td>
                </tr>
              ) : (
                refunds.map(r => (
                  <tr key={r.id} className="hover:bg-emerald-50/30 transition-colors text-slate-700">
                    <td className="py-3.5 px-4 font-mono text-slate-500">{r.id}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-900 font-semibold">{r.transactionId}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{r.customerId}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">${r.amount.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{r.reason.replace(/_/g, ' ')}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3.5 px-4 text-right">
                      {r.status === 'REQUESTED' ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'COMPLETED')}
                            className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all shadow-2xs"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all shadow-2xs"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Completed</span>
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
