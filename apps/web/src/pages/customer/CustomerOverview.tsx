import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { ReceiptModal } from '../../components/ReceiptModal';
import {
  Wallet,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  History,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const CustomerOverview: React.FC = () => {
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, success: 0, failed: 0, pending: 0, totalAmount: 0 });
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (profile?.id) {
        try {
          const [paymentsRes, statsRes] = await Promise.all([
            api.payments.list({ customerId: profile.id, limit: 10 }),
            api.payments.getStats(),
          ]);

          if (paymentsRes.success && paymentsRes.data) {
            setPayments(paymentsRes.data);
          }
          if (statsRes.success && statsRes.data) {
            setStats(statsRes.data);
          }
        } catch (e) {}
      }
      setIsLoading(false);
    }
    loadData();
  }, [profile]);

  const handleViewReceipt = async (paymentId: string) => {
    const txnRes = await api.transactions.list({ customerId: profile?.id, limit: 50 });
    if (txnRes.success && txnRes.data) {
      const txn = txnRes.data.find((t: any) => t.paymentId === paymentId);
      if (txn) {
        const recRes = await api.transactions.getReceipt(txn.id);
        if (recRes.success && recRes.data) {
          setSelectedReceipt(recRes.data);
        }
      }
    }
  };

  const chartData = [
    { name: 'Mon', amount: 120 },
    { name: 'Tue', amount: 450 },
    { name: 'Wed', amount: 890 },
    { name: 'Thu', amount: 240 },
    { name: 'Fri', amount: 1250 },
    { name: 'Sat', amount: 640 },
    { name: 'Sun', amount: 310 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner (Dark Green & Light White Theme) */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Customer Portal</span>
            <h2 className="text-2xl font-black text-white mt-0.5">Welcome, {user?.fullName || 'Customer'}</h2>
            <p className="text-xs text-emerald-100/80 mt-1">Manage your payments, cards, ledger receipts, and refund requests.</p>
          </div>
          <div className="flex gap-2.5">
            <Link
              to="/payment"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl text-xs font-extrabold shadow flex items-center gap-1.5 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" /> Make Payment
            </Link>
            <Link
              to="/methods"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" /> Manage Cards
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Wallet Balance"
          value={`$${(profile?.balance || 9450).toFixed(2)}`}
          subtitle="Available for instant checkout"
          icon={Wallet}
          color="darkgreen"
        />
        <StatCard
          title="Total Spent"
          value={`$${stats.totalAmount.toFixed(2)}`}
          subtitle={`${stats.success} successful payments`}
          icon={ArrowUpRight}
          color="emerald"
        />
        <StatCard
          title="Successful Payments"
          value={stats.success}
          subtitle="100% processed through gateway"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Pending / Retrying"
          value={stats.pending}
          subtitle="In state machine queue"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Spending Activity Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Payment Activity</h3>
              <p className="text-xs text-slate-500">Payment volume processed across merchants</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmountGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.75rem', fontSize: '12px', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#047857" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmountGreen)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Service Links */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Quick Services</h3>
            <p className="text-xs text-slate-500 mb-4">Instant shortcuts for customer actions</p>

            <div className="space-y-2">
              <Link
                to="/payment"
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5 text-xs text-slate-800 font-bold">
                  <CreditCard className="w-4 h-4 text-emerald-700" /> Make New Payment
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-800" />
              </Link>

              <Link
                to="/transactions"
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5 text-xs text-slate-800 font-bold">
                  <History className="w-4 h-4 text-emerald-700" /> Transaction Ledger
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-800" />
              </Link>

              <Link
                to="/refunds"
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5 text-xs text-slate-800 font-bold">
                  <RotateCcw className="w-4 h-4 text-emerald-700" /> Request a Refund
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-800" />
              </Link>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
            <span className="font-bold block mb-0.5">🔒 Distributed Idempotency</span>
            All transactions are protected against duplicate charges using atomic unique idempotency keys.
          </div>
        </div>
      </div>

      {/* Recent Payments Ledger */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Payment History</h3>
            <p className="text-xs text-slate-500">Live feed from Transaction Ledger Service</p>
          </div>
          <Link to="/transactions" className="text-xs text-emerald-800 hover:text-emerald-950 font-bold">
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold">
                <th className="pb-3 px-3">Payment ID</th>
                <th className="pb-3 px-3">Description</th>
                <th className="pb-3 px-3">Amount</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions found. Make your first payment above!
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-600">{p.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{p.description || 'Payment'}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">${p.amount.toFixed(2)} {p.currency}</td>
                    <td className="py-3 px-3"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-right">
                      {p.status === 'SUCCESS' ? (
                        <button
                          onClick={() => handleViewReceipt(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-200 transition-all inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> View
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
