import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Settings, Key, Globe, Shield, Save, Copy, Check } from 'lucide-react';

export const MerchantSettings: React.FC = () => {
  const { profile } = useAuth();
  const toast = useToast();

  const [businessName, setBusinessName] = useState(profile?.businessName || 'Apex Retailers Inc.');
  const [webhookUrl, setWebhookUrl] = useState(profile?.webhookUrl || 'https://api.apexretailers.com/webhooks/payments');
  const [riskThreshold, setRiskThreshold] = useState(profile?.riskThreshold || 70);
  const [apiKey] = useState(profile?.apiKey || 'pk_live_apex_9a8f7b6c5d4e3f2a1b0c');
  const [copied, setCopied] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.id) {
      try {
        const res = await api.merchants.update(profile.id, {
          businessName,
          webhookUrl,
          riskThreshold,
        });
        if (res.success) {
          toast.success('Settings Saved', 'Merchant profile and webhook config updated.');
        }
      } catch (err: any) {
        toast.error('Error', err.message);
      }
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.info('Copied!', 'API key copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-800" /> Merchant Settings & API Integration
        </h2>
        <p className="text-xs text-slate-500">Configure your store, risk limits, and real-time webhook endpoints.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
        {/* API Key Box */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-emerald-800" /> Live API Key (Bearer Auth)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={apiKey}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
            />
            <button
              type="button"
              onClick={handleCopyKey}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Store / Business Name</label>
          <input
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-800" /> Webhook Notification URL
          </label>
          <input
            type="url"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono transition-all"
            placeholder="https://yourserver.com/webhooks/payment"
          />
          <p className="text-[11px] text-slate-500">Events: PaymentSucceeded, PaymentFailed, RefundCompleted</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-800" /> Fraud Risk Score Threshold
            </label>
            <span className="text-xs font-bold text-emerald-800">{riskThreshold} / 100</span>
          </div>
          <input
            type="range"
            min="30"
            max="90"
            value={riskThreshold}
            onChange={e => setRiskThreshold(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-800 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Payments with simulated risk score above this threshold will automatically be flagged for manual review.
          </p>
        </div>

        <button
          type="submit"
          className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </form>
    </div>
  );
};
