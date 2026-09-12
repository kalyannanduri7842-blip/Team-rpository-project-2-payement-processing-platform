import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Users, Search, Shield, User, Briefcase, Activity } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([
    { id: 'usr_demo_customer', email: 'customer@payflow.com', role: 'CUSTOMER', fullName: 'Alex Reynolds (Customer)', isActive: true, createdAt: '2025-01-10' },
    { id: 'usr_demo_merchant', email: 'merchant@payflow.com', role: 'MERCHANT', fullName: 'Sarah Chen (Apex Retailers)', isActive: true, createdAt: '2025-01-05' },
    { id: 'usr_demo_admin', email: 'admin@payflow.com', role: 'ADMIN', fullName: 'Marcus Vance (Admin)', isActive: true, createdAt: '2025-01-01' },
    { id: 'usr_demo_ops', email: 'ops@payflow.com', role: 'OPERATIONS', fullName: 'Elena Rostova (Ops Lead)', isActive: true, createdAt: '2025-01-01' },
    { id: 'usr_merchant_cloud', email: 'cloud@payflow.com', role: 'MERCHANT', fullName: 'David Miller (CloudByte SaaS)', isActive: true, createdAt: '2025-01-12' },
    { id: 'usr_customer_john', email: 'john.doe@payflow.com', role: 'CUSTOMER', fullName: 'John Doe', isActive: true, createdAt: '2025-01-20' },
  ]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) || u.fullName.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-800" /> Platform User Directory & RBAC
        </h2>
        <p className="text-xs text-slate-500">Manage user accounts, roles, and access permissions.</p>
      </div>

      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium transition-all"
        >
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="MERCHANT">Merchant</option>
          <option value="ADMIN">Administrator</option>
          <option value="OPERATIONS">Operations / SRE</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">User ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-emerald-50/30 transition-colors text-slate-700">
                  <td className="py-3.5 px-4 font-mono text-slate-500">{u.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{u.fullName}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={u.isActive ? 'ACTIVE' : 'SUSPENDED'} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
