import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CreditCard, Lock, Mail, User, Briefcase, Shield, Activity, ArrowRight } from 'lucide-react';
import { UserRole } from '@payment-system/shared-types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('customer@payflow.com');
  const [password, setPassword] = useState('PayFlow2025!');
  const [isLoading, setIsLoading] = useState(false);

  const { login, switchDemoRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      toast.success('Login Successful', `Welcome back to PayFlow!`);
      navigate('/');
    } else {
      toast.error('Authentication Failed', res.error || 'Invalid credentials');
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setIsLoading(true);
    const res = await switchDemoRole(role);
    setIsLoading(false);
    if (res.success) {
      toast.success('Switched Role', `Logged in as ${role}`);
      navigate(role === 'OPERATIONS' ? '/operations' : '/');
    } else {
      toast.error('Authentication Error', res.error || 'Failed to sign in with demo credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-4 relative">
      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-emerald-900 rounded-2xl shadow-xl shadow-emerald-950/20 text-white mb-2">
            <CreditCard className="w-8 h-8 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">PayFlow Distributed</h2>
          <p className="text-xs text-slate-500 font-medium">Enterprise Fault-Tolerant Payment Processing Platform</p>
        </div>

        {/* 1-Click Quick Demo Switcher Cards (Light White & Dark Green) */}
        <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
            ⚡ 1-Click Quick Demo Sign-in
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('CUSTOMER')}
              className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <User className="w-3.5 h-3.5 text-emerald-700" /> Customer
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono truncate">customer@payflow.com</p>
            </button>

            <button
              onClick={() => handleQuickLogin('MERCHANT')}
              className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Briefcase className="w-3.5 h-3.5 text-emerald-700" /> Merchant
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono truncate">merchant@payflow.com</p>
            </button>

            <button
              onClick={() => handleQuickLogin('ADMIN')}
              className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Shield className="w-3.5 h-3.5 text-emerald-700" /> Admin
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono truncate">admin@payflow.com</p>
            </button>

            <button
              onClick={() => handleQuickLogin('OPERATIONS')}
              className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Activity className="w-3.5 h-3.5 text-emerald-700" /> Operations
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono truncate">ops@payflow.com</p>
            </button>
          </div>
        </div>

        {/* Regular Sign in Form */}
        <form onSubmit={handleLogin} className="bg-white border border-slate-200/90 p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-700 focus:bg-white transition-colors"
                placeholder="you@payflow.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-700 focus:bg-white transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-900 hover:bg-emerald-950 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-800 hover:text-emerald-950 font-bold">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
