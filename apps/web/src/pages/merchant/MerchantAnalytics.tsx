import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BarChart3, Download, PieChart as PieIcon } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const MerchantAnalytics: React.FC = () => {
  const { profile } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      if (profile?.id) {
        const [sumRes, trendRes] = await Promise.all([
          api.reports.getSummary(profile.id),
          api.reports.getRevenueTrends(profile.id),
        ]);
        if (sumRes.success) setSummary(sumRes.data);
        if (trendRes.success) setTrends(trendRes.data);
      }
    }
    loadStats();
  }, [profile]);

  const methodData = [
    { name: 'Credit Cards', value: 68, color: '#064e3b' },
    { name: 'Debit Cards', value: 20, color: '#059669' },
    { name: 'Bank Transfer (ACH)', value: 8, color: '#10b981' },
    { name: 'Digital Wallets', value: 4, color: '#34d399' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-800" /> Merchant Financial Analytics
          </h2>
          <p className="text-xs text-slate-500">Aggregated reporting telemetry from Reporting Service.</p>
        </div>
        <a
          href={api.reports.exportTransactionsUrl(profile?.id)}
          className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download Complete Report
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Payment Methods Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={methodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {methodData.map(m => (
              <div key={m.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-slate-700 font-medium">{m.name} ({m.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Platform Fee Retained ($ USD)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={d => d.slice(-5)} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="fees" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
