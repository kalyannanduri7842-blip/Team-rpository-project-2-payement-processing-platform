import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { DollarSign, ArrowUpRight, CheckCircle2, Clock, Calendar, Zap } from 'lucide-react';

export const SettlementsPage: React.FC = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [settlements, setSettlements] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSettlements = async () => {
    if (profile?.id) {
      const res = await api.merchants.getSettlements(profile.id);
      if (res.success && res.data) {
        setSettlements(res.data);
      }
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [profile]);

  const handleTriggerPayout = async () => {
    if (!profile?.id) return;
    setIsProcessing(true);
    try {
      const res = await api.merchants.triggerSettlement(profile.id);
      if (res.success) {
        toast.success('Payout Initiated', `Settled $${res.data.amount.toFixed(2)} to your bank.`);
        fetchSettlements();
      } else {
        toast.error('Payout Error', res.error?.message || 'Settlement failed');
      }
    } catch (e: any) {
      toast.error('Payout Exception', e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-800" /> Merchant Settlements & Payouts
          </h2>
          <p className="text-xs text-slate-500">Automated daily ACH clearing and on-demand merchant account settlements.</p>
        </div>

        <button
          onClick={handleTriggerPayout}
          disabled={isProcessing}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4" /> {isProcessing ? 'Clearing Payout...' : 'Request Instant Payout'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unsettled Balance</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">${(profile?.accountBalance || 24580.50).toFixed(2)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Available for automatic overnight sweep</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settlement Cadence</span>
          <h3 className="text-2xl font-bold text-emerald-800 mt-1">T+1 Daily</h3>
          <p className="text-[11px] text-slate-500 mt-1">Direct ACH batch to linked account</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Commission</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{((profile?.commissionRate || 0.025) * 100).toFixed(1)}%</h3>
          <p className="text-[11px] text-slate-500 mt-1">Automatic fee deduction per transaction</p>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Settlement History</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Settlement ID</th>
                <th className="py-3.5 px-4">Gross Batch Amount</th>
                <th className="py-3.5 px-4">Fees Retained</th>
                <th className="py-3.5 px-4">Net Deposited</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Payout Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlements.map(s => (
                <tr key={s.id} className="hover:bg-emerald-50/30 transition-colors text-slate-700">
                  <td className="py-3.5 px-4 font-mono text-slate-500">{s.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">${s.amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-rose-600 font-mono font-medium">-${s.feeDeducted.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-bold">${s.netPayout.toFixed(2)}</td>
                  <td className="py-3.5 px-4"><StatusBadge status={s.status} /></td>
                  <td className="py-3.5 px-4 text-slate-500">{new Date(s.payoutDate || s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
