import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Store, Search, DollarSign } from 'lucide-react';

export const MerchantManagement: React.FC = () => {
  const [merchants, setMerchants] = useState<any[]>([]);

  useEffect(() => {
    async function loadMerchants() {
      const res = await api.merchants.list();
      if (res.success && res.data) {
        setMerchants(res.data);
      }
    }
    loadMerchants();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Store className="w-5 h-5 text-emerald-800" /> Merchant Accounts & Fee Schedules
        </h2>
        <p className="text-xs text-slate-500">Global merchant roster, fee configurations, and cumulative volume tracking.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Merchant ID</th>
                <th className="py-3.5 px-4">Business Name</th>
                <th className="py-3.5 px-4">Commission Fee</th>
                <th className="py-3.5 px-4">Total Revenue</th>
                <th className="py-3.5 px-4">Account Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {merchants.map(m => (
                <tr key={m.id} className="hover:bg-emerald-50/30 transition-colors text-slate-700">
                  <td className="py-3.5 px-4 font-mono text-slate-500">{m.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{m.businessName}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-800">{(m.commissionRate * 100).toFixed(1)}%</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">${m.totalRevenue.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">${m.accountBalance.toFixed(2)}</td>
                  <td className="py-3.5 px-4"><StatusBadge status={m.status} /></td>
                  <td className="py-3.5 px-4 text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
