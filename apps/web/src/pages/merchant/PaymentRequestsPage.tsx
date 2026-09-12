import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Send, Copy, Check, Link2, DollarSign, QrCode } from 'lucide-react';

export const PaymentRequestsPage: React.FC = () => {
  const { profile } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('Invoice #4092');
  const [amount, setAmount] = useState('250.00');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const link = `http://localhost:5173/payment?merchantId=${profile?.id}&amount=${amount}&title=${encodeURIComponent(title)}`;
    setGeneratedLink(link);
    toast.success('Payment Request Link Generated!', 'You can now share this URL with your customer.');
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.info('Copied!', 'Payment URL copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Send className="w-5 h-5 text-emerald-800" /> Create Payment Link / Request
        </h2>
        <p className="text-xs text-slate-500">Generate hosted checkout links for your customers with automated settlement routing.</p>
      </div>

      <form onSubmit={handleGenerate} className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Invoice / Item Description</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium transition-all"
            placeholder="e.g. Monthly Consulting Fee"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Requested Amount ($ USD)</label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Link2 className="w-4 h-4" /> Generate Hosted Checkout Link
        </button>
      </form>

      {generatedLink && (
        <div className="bg-white border border-emerald-200 p-5 rounded-2xl shadow-sm space-y-3 animate-in fade-in duration-150">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Shareable Checkout URL</span>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={generatedLink}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
