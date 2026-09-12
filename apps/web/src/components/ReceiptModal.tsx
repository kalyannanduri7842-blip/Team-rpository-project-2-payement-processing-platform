import React from 'react';
import { X, Download, CheckCircle2, Building, User, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  receipt: any | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-hidden relative text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Official Payment Receipt</h3>
              <p className="text-xs text-slate-500">{receipt.receiptNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-6 text-center py-5 bg-emerald-50/60 rounded-xl border border-emerald-100">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Total Amount Paid</span>
          <h2 className="text-3xl font-extrabold text-emerald-950 mt-1">
            ${receipt.amount.toFixed(2)} <span className="text-sm font-semibold text-emerald-800">{receipt.currency}</span>
          </h2>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">
            {receipt.status}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date & Time</span>
            <span className="font-semibold text-slate-800">{new Date(receipt.date).toLocaleString()}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Merchant</span>
            <span className="font-bold text-slate-900">{receipt.merchant.businessName}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Customer</span>
            <span className="font-medium text-slate-800">{receipt.customer.name} ({receipt.customer.email})</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Payment Method</span>
            <span className="font-medium text-slate-800">{receipt.paymentMethod.replace('_', ' ')}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Reference #</span>
            <span className="font-mono font-bold text-slate-800">{receipt.referenceNumber}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-medium">Distributed Ledger Verified</p>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download / Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
