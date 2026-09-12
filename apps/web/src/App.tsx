import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Customer Pages
import { CustomerOverview } from './pages/customer/CustomerOverview';
import { MakePaymentPage } from './pages/customer/MakePaymentPage';
import { CustomerTransactions } from './pages/customer/CustomerTransactions';
import { PaymentMethodsPage } from './pages/customer/PaymentMethodsPage';
import { RefundRequestsPage } from './pages/customer/RefundRequestsPage';
import { CustomerSettings } from './pages/customer/CustomerSettings';

// Merchant Pages
import { MerchantOverview } from './pages/merchant/MerchantOverview';
import { MerchantTransactions } from './pages/merchant/MerchantTransactions';
import { PaymentRequestsPage } from './pages/merchant/PaymentRequestsPage';
import { MerchantRefundsPage } from './pages/merchant/MerchantRefundsPage';
import { SettlementsPage } from './pages/merchant/SettlementsPage';
import { MerchantAnalytics } from './pages/merchant/MerchantAnalytics';
import { MerchantSettings } from './pages/merchant/MerchantSettings';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { UserManagement } from './pages/admin/UserManagement';
import { MerchantManagement } from './pages/admin/MerchantManagement';
import { GlobalTransactions } from './pages/admin/GlobalTransactions';
import { FraudAlertsPage } from './pages/admin/FraudAlertsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

// Operations Pages
import { OperationsDashboard } from './pages/operations/OperationsDashboard';
import { ServicesHealthPage } from './pages/operations/ServicesHealthPage';
import { QueueInspectorPage } from './pages/operations/QueueInspectorPage';
import { ChaosSimulatorPage } from './pages/operations/ChaosSimulatorPage';
import { LiveLogStreamPage } from './pages/operations/LiveLogStreamPage';

// Role-based Root Dispatcher
const RoleHome: React.FC = () => {
  const { role } = useAuth();
  if (role === 'MERCHANT') return <MerchantOverview />;
  if (role === 'ADMIN') return <AdminOverview />;
  if (role === 'OPERATIONS') return <OperationsDashboard />;
  return <CustomerOverview />;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center text-emerald-800 text-sm font-bold animate-pulse">
        Initializing PayFlow Distributed Platform...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Layout Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dynamic Root */}
        <Route index element={<RoleHome />} />

        {/* Customer Routes */}
        <Route path="payment" element={<MakePaymentPage />} />
        <Route path="transactions" element={<CustomerTransactions />} />
        <Route path="methods" element={<PaymentMethodsPage />} />
        <Route path="refunds" element={<RefundRequestsPage />} />
        <Route path="settings" element={<CustomerSettings />} />

        {/* Merchant Routes */}
        <Route path="merchant/transactions" element={<MerchantTransactions />} />
        <Route path="merchant/requests" element={<PaymentRequestsPage />} />
        <Route path="merchant/refunds" element={<MerchantRefundsPage />} />
        <Route path="merchant/settlements" element={<SettlementsPage />} />
        <Route path="merchant/analytics" element={<MerchantAnalytics />} />
        <Route path="merchant/settings" element={<MerchantSettings />} />

        {/* Admin Routes */}
        <Route path="admin/users" element={<UserManagement />} />
        <Route path="admin/merchants" element={<MerchantManagement />} />
        <Route path="admin/transactions" element={<GlobalTransactions />} />
        <Route path="admin/fraud" element={<FraudAlertsPage />} />
        <Route path="admin/audit-logs" element={<AuditLogsPage />} />

        {/* Operations Routes */}
        <Route path="operations" element={<OperationsDashboard />} />
        <Route path="operations/services" element={<ServicesHealthPage />} />
        <Route path="operations/queues" element={<QueueInspectorPage />} />
        <Route path="operations/chaos" element={<ChaosSimulatorPage />} />
        <Route path="operations/logs" element={<LiveLogStreamPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
