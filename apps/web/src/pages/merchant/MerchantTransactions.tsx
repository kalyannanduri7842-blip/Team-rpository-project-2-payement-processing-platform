import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { History, Search, Filter, Download } from 'lucide-react';

export const MerchantTransactions: React.FC = () => {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function loadTxns() {
      if (profile?.id) {
        const res = await api.transactions.list({
          merchantId: profile.id,
          status: statusFilter || undefined,
          search: search || undefined,
          limit: 100,
        });
        if (res.success && res.data) {
          setTransactions(res.data);
        }
      }
    }
    loadTxns();
  }, [profile, search, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-800" /> Merchant Ledger & Transactions
          </h2>
          <p className="text-xs text-slate-500">All customer payments and settlement entries recorded in the immutable ledger.</p>
        </div>
        <a
          href={api.reports.exportTransactionsUrl(profile?.id)}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
        >
          <Download className="w-4 h-4 text-emerald-800" /> Export CSV
        </a>
      </div>

      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Transaction ID, Reference, or Payment ID..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium transition-all"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Gross Amount</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map(txn => (
                <tr key={txn.id} className="hover:bg-emerald-50/30 transition-colors text-slate-700">
                  <td className="py-3.5 px-4 font-mono text-slate-500">{txn.id}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-900 font-semibold">{txn.referenceNumber}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{txn.customerId}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">${txn.amount.toFixed(2)} {txn.currency}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{txn.paymentMethodType.replace('_', ' ')}</td>
                  <td className="py-3.5 px-4"><StatusBadge status={txn.status} /></td>
                  <td className="py-3.5 px-4 text-slate-500">{new Date(txn.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
