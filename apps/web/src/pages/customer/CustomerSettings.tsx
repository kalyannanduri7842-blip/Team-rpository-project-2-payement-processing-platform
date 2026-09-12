import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Settings, User, Shield, Mail, Phone, MapPin, Save } from 'lucide-react';

export const CustomerSettings: React.FC = () => {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.fullName || 'Alex Reynolds');
  const [phone, setPhone] = useState(user?.phoneNumber || '+1-555-0192');
  const [address, setAddress] = useState(profile?.billingAddress || '742 Evergreen Terrace, Springfield, OR');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings Saved', 'Profile information updated successfully.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-800" /> Account Settings
        </h2>
        <p className="text-xs text-slate-500">Manage your profile, billing address, and security preferences.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Email Address (Read-only)</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              disabled
              value={user?.email || 'customer@payflow.com'}
              className="w-full bg-slate-100/70 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-500 cursor-not-allowed font-medium"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-medium transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-medium transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Billing Address</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-medium transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </form>
    </div>
  );
};
