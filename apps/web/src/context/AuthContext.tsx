import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@payment-system/shared-types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; name: string; password: string }> = {
  CUSTOMER: { email: 'customer@payflow.com', name: 'Alex Reynolds (Customer)', password: 'PayFlow2025!' },
  MERCHANT: { email: 'merchant@payflow.com', name: 'Apex Retailers (Merchant)', password: 'PayFlow2025!' },
  ADMIN: { email: 'admin@payflow.com', name: 'Marcus Vance (Platform Admin)', password: 'PayFlow2025!' },
  OPERATIONS: { email: 'ops@payflow.com', name: 'Elena Rostova (Lead SRE)', password: 'PayFlow2025!' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.auth.me();
          if (res?.offline || res?.html) {
            // Backend returned HTML or is down — clear bad session quietly
            localStorage.removeItem('access_token');
            setToken(null);
            setUser(null);
            setProfile(null);
          } else if (res.success && res.data) {
            setUser(res.data.user);
            setProfile(res.data.profile);
          } else {
            // Re-authenticate default customer
            await login('customer@payflow.com', 'PayFlow2025!');
          }
        } catch (e) {
          await login('customer@payflow.com', 'PayFlow2025!');
        }
      } else {
        // Auto-login default demo customer so localhost:5173 works immediately on 1st click
        await login('customer@payflow.com', 'PayFlow2025!');
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password = 'PayFlow2025!') => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.data) {
        localStorage.setItem('access_token', res.data.tokens.accessToken);
        setToken(res.data.tokens.accessToken);
        setUser(res.data.user);
        setProfile(res.data.profile);
        return { success: true };
      }
      // Retry with fallback password if needed
      if (password === 'PayFlow2025!') {
        const retryRes = await api.auth.login({ email, password: 'Password123!' });
        if (retryRes.success && retryRes.data) {
          localStorage.setItem('access_token', retryRes.data.tokens.accessToken);
          setToken(retryRes.data.tokens.accessToken);
          setUser(retryRes.data.user);
          setProfile(retryRes.data.profile);
          return { success: true };
        }
      }
      return { success: false, error: res.error?.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.auth.register(data);
      if (res.success && res.data) {
        localStorage.setItem('access_token', res.data.tokens.accessToken);
        setToken(res.data.tokens.accessToken);
        setUser(res.data.user);
        setProfile(res.data.profile);
        return { success: true };
      }
      return { success: false, error: res.error?.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const switchDemoRole = async (targetRole: UserRole): Promise<{ success: boolean; error?: string }> => {
    const cred = DEMO_CREDENTIALS[targetRole];
    if (cred) {
      return await login(cred.email, cred.password);
    }
    return { success: false, error: 'Role not found' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: user?.role || null,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
