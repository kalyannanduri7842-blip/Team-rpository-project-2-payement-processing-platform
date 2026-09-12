import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CreditCard,
  History,
  RotateCcw,
  Wallet,
  Settings,
  DollarSign,
  Send,
  BarChart3,
  Users,
  Store,
  ShieldAlert,
  FileText,
  Activity,
  Server,
  Layers,
  Flame,
  Terminal,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const customerLinks = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/payment', label: 'Make Payment', icon: CreditCard },
    { to: '/transactions', label: 'Transactions', icon: History },
    { to: '/methods', label: 'Payment Methods', icon: Wallet },
    { to: '/refunds', label: 'Refund Requests', icon: RotateCcw },
    { to: '/settings', label: 'Account Settings', icon: Settings },
  ];

  const merchantLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/merchant/transactions', label: 'Transactions', icon: History },
    { to: '/merchant/requests', label: 'Payment Links', icon: Send },
    { to: '/merchant/refunds', label: 'Refunds', icon: RotateCcw },
    { to: '/merchant/settlements', label: 'Settlements', icon: DollarSign },
    { to: '/merchant/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/merchant/settings', label: 'Settings & API Keys', icon: Settings },
  ];

  const adminLinks = [
    { to: '/', label: 'System Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/merchants', label: 'Merchants Roster', icon: Store },
    { to: '/admin/transactions', label: 'Global Ledger', icon: History },
    { to: '/admin/fraud', label: 'Fraud & Risk Center', icon: ShieldAlert },
    { to: '/admin/audit-logs', label: 'Audit Trail', icon: FileText },
    { to: '/operations', label: 'SRE Console', icon: Activity },
  ];

  const opsLinks = [
    { to: '/operations', label: 'Cluster Topology', icon: Activity },
    { to: '/operations/services', label: 'Services Health (10)', icon: Server },
    { to: '/operations/queues', label: 'Queue & DLQ', icon: Layers },
    { to: '/operations/chaos', label: 'Chaos Simulator', icon: Flame },
    { to: '/operations/logs', label: 'Live Log Stream', icon: Terminal },
  ];

  let links = customerLinks;
  if (role === 'MERCHANT') links = merchantLinks;
  if (role === 'ADMIN') links = adminLinks;
  if (role === 'OPERATIONS') links = opsLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-4 shadow-sm">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Navigation Menu</p>
        {links.map(link => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/' || link.to === '/operations'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Cluster Status Box */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-950">Cluster Health</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          </div>
          <p className="text-xs font-extrabold text-emerald-900 mt-1">10 Microservices Active</p>
          <div className="mt-2 text-[10px] text-emerald-700 flex justify-between font-mono">
            <span>Gateway :4000</span>
            <span className="font-bold">100% UP</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
