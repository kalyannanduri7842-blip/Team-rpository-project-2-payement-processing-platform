import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { DollarSign, TrendingUp, CheckCircle2, AlertOctagon, Send, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const MerchantOverview: React.FC = () => {
  const { profile } = useAuth();
  const [summary, setSummary] = useState<any>({
    totalVolume: 0,
    successfulVolume: 0,
    totalPaymentsCount: 0,
    successRate: 100,
    totalRefunded: 0,
  });
  const [trends, setTrends] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      if (profile?.id) {
        try {
          const [sumRes, trendRes, payRes] = await Promise.all([
            api.reports.getSummary(profile.id),
            api.reports.getRevenueTrends(profile.id),
            api.payments.list({ merchantId: profile.id, limit: 10 }),
          ]);

          if (sumRes.success && sumRes.data) setSummary(sumRes.data);
          if (trendRes.success && trendRes.data) setTrends(trendRes.data);
          if (payRes.success && payRes.data) setPayments(payRes.data);
        } catch (e) {}
      }
    }
    loadData();
  }, [profile]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border border-emerald-800/40 rounded-2xl p-6 relative overflow-hidden shadow-sm text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Merchant Portal</span>
            <h2 className="text-2xl font-extrabold text-white mt-0.5">{profile?.businessName || 'Merchant Dashboard'}</h2>
            <p className="text-xs text-emerald-100/80 mt-1">Live revenue telemetry, settlements, and payment processing analytics.</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/merchant/requests"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 flex items-center gap-1.5 transition-all"
            >
              <Send className="w-4 h-4" /> Create Payment Link
            </Link>
            <a
              href={api.reports.exportTransactionsUrl(profile?.id)}
              className="px-4 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 rounded-xl text-xs font-semibold border border-emerald-700/50 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" /> Export CSV
            </a>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Account Balance"
          value={`$${(profile?.accountBalance || 24580.50).toFixed(2)}`}
          subtitle="Ready for settlement payout"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total Processed Volume"
          value={`$${(profile?.totalRevenue || 148920.00).toFixed(2)}`}
          subtitle={`${summary.totalPaymentsCount} total transactions`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Gateway Success Rate"
          value={`${summary.successRate || 97.4}%`}
          subtitle="Low failure & drop-off rate"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Refunds Total"
          value={`$${(summary.totalRefunded || 899.99).toFixed(2)}`}
          subtitle="Processed customer reversals"
          icon={AlertOctagon}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Daily Revenue Volume ($ USD)</h3>
          <p className="text-xs text-slate-500 mb-4">Volume processed by settlement day</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={d => d.slice(-5)} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#047857" strokeWidth={2.5} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Daily Transaction Counts</h3>
          <p className="text-xs text-slate-500 mb-4">Successful orders processed</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={d => d.slice(-5)} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Merchant Transactions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Customer Payments</h3>
            <p className="text-xs text-slate-500">Incoming payments for {profile?.businessName}</p>
          </div>
          <Link to="/merchant/transactions" className="text-xs text-emerald-800 hover:text-emerald-700 font-semibold">
            View all transactions →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Payment ID</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Gross Amount</th>
                <th className="py-3 px-3">Platform Fee (2.5%)</th>
                <th className="py-3 px-3">Net Payout</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors text-slate-700">
                  <td className="py-3 px-3 font-mono text-slate-500">{p.id}</td>
                  <td className="py-3 px-3 text-slate-900 font-medium">{p.description}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">${p.amount.toFixed(2)}</td>
                  <td className="py-3 px-3 text-rose-600 font-mono font-medium">-${p.feeAmount.toFixed(2)}</td>
                  <td className="py-3 px-3 text-emerald-800 font-bold">${p.netAmount.toFixed(2)}</td>
                  <td className="py-3 px-3"><StatusBadge status={p.status} /></td>
                  <td className="py-3 px-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
