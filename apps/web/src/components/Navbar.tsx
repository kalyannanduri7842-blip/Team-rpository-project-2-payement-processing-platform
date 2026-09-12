import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  LogOut,
  User,
  Shield,
  Briefcase,
  Activity,
  CheckCheck,
  CreditCard,
} from 'lucide-react';
import { api } from '../services/api';
import { UserRole } from '@payment-system/shared-types';

export const Navbar: React.FC = () => {
  const { user, role, logout, switchDemoRole } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    if (user?.id) {
      try {
        const res = await api.notifications.list(user.id);
        if (res.success && res.data) {
          setNotifications(res.data);
          setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    if (user?.id) {
      await api.notifications.markAllAsRead(user.id);
      fetchNotifs();
    }
  };

  const roleMeta: Record<UserRole, { label: string; icon: any; color: string }> = {
    CUSTOMER: { label: 'Customer Portal', icon: User, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    MERCHANT: { label: 'Merchant Portal', icon: Briefcase, color: 'bg-teal-100 text-teal-900 border-teal-300' },
    ADMIN: { label: 'Admin Portal', icon: Shield, color: 'bg-emerald-900 text-emerald-100 border-emerald-950' },
    OPERATIONS: { label: 'Ops & SRE Portal', icon: Activity, color: 'bg-amber-100 text-amber-900 border-amber-300' },
  };

  const currentRoleMeta = role ? roleMeta[role] : roleMeta['CUSTOMER'];
  const RoleIcon = currentRoleMeta.icon;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
      {/* Brand & Active Role */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-900 flex items-center justify-center shadow-md shadow-emerald-950/20 text-white font-bold">
            <CreditCard className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
              PAYFLOW <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">Distributed</span>
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentRoleMeta.color}`}>
            <RoleIcon className="w-3.5 h-3.5" />
            {currentRoleMeta.label}
          </span>
        </div>
      </div>

      {/* Demo Role Switcher Shortcuts (Dark Green / White Theme) */}
      <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
        <span className="text-[11px] font-bold text-slate-500 px-2 uppercase tracking-wider">Demo Role:</span>
        <button
          onClick={() => switchDemoRole('CUSTOMER')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            role === 'CUSTOMER' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Customer
        </button>
        <button
          onClick={() => switchDemoRole('MERCHANT')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            role === 'MERCHANT' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Merchant
        </button>
        <button
          onClick={() => switchDemoRole('ADMIN')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            role === 'ADMIN' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Admin
        </button>
        <button
          onClick={() => switchDemoRole('OPERATIONS')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            role === 'OPERATIONS' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Operations
        </button>
      </div>

      {/* Right Actions: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in duration-150">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3.5 text-xs transition-colors ${n.isRead ? 'opacity-60 bg-transparent' : 'bg-emerald-50/40'}`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.fullName || 'User'}</p>
            <p className="text-[10px] text-slate-500 font-mono">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
