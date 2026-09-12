import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { History, Search, Filter, Download } from 'lucide-react';

export const GlobalTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadAll() {
      const res = await api.transactions.list({ search: search || undefined, status: status || undefined, limit: 100 });
      if (res.success && res.data) {
        setTransactions(res.data);
      }
    }
    loadAll();
  }, [search, status]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-800" /> Global System Ledger
          </h2>
          <p className="text-xs text-slate-500">Complete immutable record of all network-wide payments, settlements, and transfers.</p>
        </div>
        <a
          href={api.reports.exportTransactionsUrl()}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-all"
        >
          <Download className="w-4 h-4 text-emerald-800" /> Export System CSV
        </a>
      </div>

      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, Reference Number, Customer ID, or Merchant ID..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 transition-all"
          />
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium transition-all"
        >
          <option value="">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Reference #</th>
                <th className="py-3.5 px-4">Merchant ID</th>
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Amount</th>
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
                  <td className="py-3.5 px-4 font-mono text-slate-500">{txn.merchantId}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{txn.customerId}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">${txn.amount.toFixed(2)}</td>
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
