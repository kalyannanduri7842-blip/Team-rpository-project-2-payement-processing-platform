import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { ReceiptModal } from '../../components/ReceiptModal';
import { History, Search, Filter, FileText, RotateCcw, Download } from 'lucide-react';

export const CustomerTransactions: React.FC = () => {
  const { profile } = useAuth();
  const toast = useToast();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [refundTxnId, setRefundTxnId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('REQUESTED_BY_CUSTOMER');
  const [isRefunding, setIsRefunding] = useState(false);

  const fetchTransactions = async () => {
    if (profile?.id) {
      try {
        const res = await api.transactions.list({
          customerId: profile.id,
          status: statusFilter || undefined,
          search: search || undefined,
          limit: 100,
        });
        if (res.success && res.data) {
          setTransactions(res.data);
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [profile, statusFilter, search]);

  const handleOpenReceipt = async (txnId: string) => {
    const res = await api.transactions.getReceipt(txnId);
    if (res.success && res.data) {
      setSelectedReceipt(res.data);
    }
  };

  const handleRequestRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTxnId) return;

    setIsRefunding(true);
    try {
      const res = await api.refunds.create({
        transactionId: refundTxnId,
        reason: refundReason as any,
      });

      if (res.success) {
        toast.success('Refund Issued', 'Refund processed and credited back to your balance.');
        setRefundTxnId(null);
        fetchTransactions();
      } else {
        toast.error('Refund Error', res.error?.message || 'Could not process refund');
      }
    } catch (err: any) {
      toast.error('Refund Exception', err.message);
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-800" /> Transaction Ledger
          </h2>
          <p className="text-xs text-slate-500">Complete immutable record of all processed payments and transfers.</p>
        </div>

        <a
          href={api.reports.exportTransactionsUrl(undefined, profile?.id)}
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
        >
          <Download className="w-4 h-4 text-emerald-800" /> Export CSV Report
        </a>
      </div>

      {/* Filter Bar */}
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
            <option value="PROCESSING">Processing</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No transactions matching your search criteria.
                  </td>
                </tr>
              ) : (
                transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-emerald-50/30 transition-colors text-slate-700">
                    <td className="py-3.5 px-4 font-mono text-slate-500">{txn.id}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-900 font-semibold">{txn.referenceNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">${txn.amount.toFixed(2)} {txn.currency}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{txn.paymentMethodType.replace('_', ' ')}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={txn.status} /></td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(txn.createdAt).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenReceipt(txn.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] border border-emerald-200 transition-all flex items-center gap-1 shadow-2xs"
                        >
                          <FileText className="w-3 h-3 text-emerald-700" /> Receipt
                        </button>
                        {txn.status === 'SUCCESS' && (
                          <button
                            onClick={() => setRefundTxnId(txn.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] border border-amber-200 transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-700" /> Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Request Modal */}
      {refundTxnId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Request / Issue Refund</h3>
            </div>
            <p className="text-xs text-slate-500">
              Initiate a distributed refund for transaction <span className="font-mono text-slate-800 font-medium">{refundTxnId}</span>. Funds will be returned to your wallet balance.
            </p>

            <form onSubmit={handleRequestRefund} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Reason for Refund</label>
                <select
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 transition-all"
                >
                  <option value="REQUESTED_BY_CUSTOMER">Customer Return / Requested</option>
                  <option value="DUPLICATE">Accidental Duplicate Charge</option>
                  <option value="PRODUCT_NOT_RECEIVED">Item Not Received</option>
                  <option value="FRAUDULENT">Suspicious Transaction</option>
                  <option value="OTHER">Other Reason</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundTxnId(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRefunding}
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 transition-all"
                >
                  {isRefunding ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
