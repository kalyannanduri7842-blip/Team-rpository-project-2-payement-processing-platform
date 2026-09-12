import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { CreditCard, Plus, Trash2, CheckCircle2, ShieldCheck, Building } from 'lucide-react';

export const PaymentMethodsPage: React.FC = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [methods, setMethods] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New card form
  const [provider, setProvider] = useState('Visa');
  const [last4, setLast4] = useState('4242');
  const [isDefault, setIsDefault] = useState(false);

  const fetchMethods = async () => {
    if (profile?.id) {
      try {
        const res = await api.payments.getPaymentMethods(profile.id);
        if (res.success && res.data) {
          setMethods(res.data);
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetchMethods();
  }, [profile]);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const newMethod = {
      id: `pm_${Date.now()}`,
      customerId: profile?.id,
      type: 'CREDIT_CARD',
      provider,
      last4: last4.slice(-4),
      expiryMonth: 12,
      expiryYear: 2028,
      isDefault,
      createdAt: new Date().toISOString(),
    };

    setMethods([newMethod, ...methods]);
    setShowAddModal(false);
    toast.success('Payment Method Added', `${provider} ending in ${last4} has been registered.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-800" /> Payment Methods & Instruments
          </h2>
          <p className="text-xs text-slate-500">Manage your tokenized credit cards, debit cards, and linked bank accounts.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Payment Method
        </button>
      </div>

      {/* Methods Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map(method => (
          <div
            key={method.id}
            className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between h-44 shadow-sm ${
              method.isDefault
                ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 border-emerald-800/40 text-white shadow-md'
                : 'bg-white border-slate-200/80 text-slate-800'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${method.isDefault ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {method.provider}
                </span>
                <p className={`text-sm font-semibold mt-0.5 ${method.isDefault ? 'text-white' : 'text-slate-900'}`}>
                  {method.type.replace('_', ' ')}
                </p>
              </div>
              {method.isDefault && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700/60 text-emerald-100 border border-emerald-500/40">
                  Default
                </span>
              )}
            </div>

            <div className={`font-mono text-base tracking-widest my-2 ${method.isDefault ? 'text-emerald-100' : 'text-slate-700'}`}>
              •••• •••• •••• {method.last4}
            </div>

            <div className={`flex justify-between items-center text-xs border-t pt-2 ${method.isDefault ? 'text-emerald-300 border-emerald-800/60' : 'text-slate-400 border-slate-100'}`}>
              <span>Exp: {method.expiryMonth || '12'}/{method.expiryYear || '28'}</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Tokenized
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Card / Payment Method</h3>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Card Provider</label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 transition-all"
                >
                  <option value="Visa">Visa</option>
                  <option value="MasterCard">MasterCard</option>
                  <option value="American Express">American Express</option>
                  <option value="Discover">Discover</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Card Number (Last 4 Digits for Demo)</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={last4}
                  onChange={e => setLast4(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono transition-all"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={e => setIsDefault(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-600"
                />
                Set as default payment instrument
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 transition-all"
                >
                  Save Instrument
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
