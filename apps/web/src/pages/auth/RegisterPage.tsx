import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CreditCard, Lock, Mail, User, Building, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await register({
      email,
      password,
      fullName,
      role,
      businessName: role === 'MERCHANT' ? businessName : undefined,
    });
    setIsLoading(false);

    if (res.success) {
      toast.success('Registration Complete', 'Welcome to PayFlow!');
      navigate('/');
    } else {
      toast.error('Registration Failed', res.error || 'Could not complete registration');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-4 relative">
      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-emerald-900 rounded-2xl shadow-xl shadow-emerald-950/20 text-white mb-2">
            <CreditCard className="w-8 h-8 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Create Account</h2>
          <p className="text-xs text-slate-500 font-medium">Join PayFlow Distributed Payment Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
          {/* Role selector tab */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                role === 'CUSTOMER' ? 'bg-emerald-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer Account
            </button>
            <button
              type="button"
              onClick={() => setRole('MERCHANT')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                role === 'MERCHANT' ? 'bg-emerald-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Merchant Account
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white"
                placeholder="Alex Reynolds"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white"
                placeholder="you@domain.com"
              />
            </div>
          </div>

          {role === 'MERCHANT' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Business / Store Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white"
                  placeholder="Apex Retailers Inc."
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-900 hover:bg-emerald-950 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? 'Creating Account...' : 'Complete Sign Up'} <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-800 hover:text-emerald-950 font-bold">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
