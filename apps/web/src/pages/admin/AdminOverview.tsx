import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { Shield, Users, Store, TrendingUp, ShieldAlert, Activity, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminOverview: React.FC = () => {
  const [summary, setSummary] = useState<any>({
    totalVolume: 0,
    successfulVolume: 0,
    totalPaymentsCount: 0,
    successRate: 100,
    totalRefunded: 0,
  });
  const [trends, setTrends] = useState<any[]>([]);
  const [fraudCount, setFraudCount] = useState(0);
  const [usersCount, setUsersCount] = useState(6);
  const [merchantsCount, setMerchantsCount] = useState(2);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [sumRes, trendRes, fraudRes, merchRes] = await Promise.all([
          api.reports.getSummary(),
          api.reports.getRevenueTrends(),
          api.fraud.getAlerts({ status: 'PENDING_REVIEW' }),
          api.merchants.list(),
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (trendRes.success) setTrends(trendRes.data);
        if (fraudRes.success && fraudRes.data) setFraudCount(fraudRes.data.length);
        if (merchRes.success && merchRes.data) setMerchantsCount(merchRes.data.length);
      } catch (e) {}
    }
    loadAdminData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border border-emerald-800/40 rounded-2xl p-6 relative overflow-hidden shadow-sm text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">System Administration</span>
            <h2 className="text-2xl font-extrabold text-white mt-0.5">Platform Operations & Control</h2>
            <p className="text-xs text-emerald-100/80 mt-1">Global oversight of all merchants, customers, ledger transactions, and risk alerts.</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin/fraud"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 flex items-center gap-1.5 transition-all"
            >
              <ShieldAlert className="w-4 h-4" /> Review Fraud Alerts ({fraudCount})
            </Link>
            <Link
              to="/operations"
              className="px-4 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-4 h-4 text-emerald-300" /> Live SRE Console
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total System Volume"
          value={`$${summary.totalVolume.toFixed(2)}`}
          subtitle={`${summary.totalPaymentsCount} total payments across network`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Registered Users"
          value={usersCount}
          subtitle={`${merchantsCount} registered merchant accounts`}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Platform Success Rate"
          value={`${summary.successRate}%`}
          subtitle="Distributed gateway availability"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Fraud Flags for Review"
          value={fraudCount}
          subtitle="Academic risk engine evaluation"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Global Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Global Transaction Volume ($ USD)</h3>
          <p className="text-xs text-slate-500 mb-4">Total platform volume over last 7 days</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={d => d.slice(-5)} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="volume" stroke="#047857" strokeWidth={2.5} fill="url(#colorAdminRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Daily Platform Retained Fees</h3>
          <p className="text-xs text-slate-500 mb-4">Commission revenue captured across microservices</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={d => d.slice(-5)} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="fees" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
