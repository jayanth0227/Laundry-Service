import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LaundryProvider } from './context/LaundryContext';
import { ToastContainer } from './components/ui/ToastContainer';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ServicesPage } from './pages/customer/ServicesPage';
import { PricesPage } from './pages/customer/PricesPage';
import { BookingPage } from './pages/customer/BookingPage';
import { BookingConfirmationPage } from './pages/customer/BookingConfirmationPage';
import { MyBookingsPage } from './pages/customer/MyBookingsPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { LoginPage } from './pages/customer/LoginPage';
import { AboutContactPage } from './pages/customer/AboutContactPage';

// Admin Pages
import { AdminHomePage } from './pages/admin/AdminHomePage';
import { DashboardOverviewPage } from './pages/admin/DashboardOverviewPage';
import { OrdersManagementPage } from './pages/admin/OrdersManagementPage';
import { ServicesManagementPage } from './pages/admin/ServicesManagementPage';
import { DispatchPage } from './pages/admin/DispatchPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { ScheduleManagementPage } from './pages/admin/ScheduleManagementPage';

// STRICT RBAC: Admin Portal Route Guard
// Only users with role === 'admin' can access /admin/*
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-zinc-500 font-bold">
        Verifying administrative authorization...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (!isAdmin) {
    // Strictly block non-admin users from admin portal
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// STRICT RBAC: Customer & Public Routes Guard
// Admins are strictly forbidden from viewing or browsing customer public pages
const PublicCustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated && isAdmin) {
    // Redirect admin strictly to operations portal
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

// STRICT RBAC: Customer-Authenticated Route Guard (e.g., My Bookings)
const ProtectedCustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-zinc-500 font-bold">
        Loading...
      </div>
    );
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/my-bookings" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <LaundryProvider>
        <BrowserRouter>
          <Routes>
            {/* Customer Facing Web Platform (Blocked for Administrators) */}
            <Route
              path="/"
              element={
                <PublicCustomerRoute>
                  <CustomerLayout />
                </PublicCustomerRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="prices" element={<PricesPage />} />
              <Route path="services" element={<PricesPage />} />
              <Route path="book" element={<BookingPage />} />
              <Route path="checkout" element={<Navigate to="/book" replace />} />
              <Route path="booking-confirmation" element={<BookingConfirmationPage />} />
              <Route
                path="my-bookings"
                element={
                  <ProtectedCustomerRoute>
                    <MyBookingsPage />
                  </ProtectedCustomerRoute>
                }
              />
              <Route path="track" element={<OrderTrackingPage />} />
              <Route path="contact" element={<AboutContactPage />} />
            </Route>

            {/* Standalone Authentication (Strict Role-Based Redirection) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />

            {/* Admin Operations Portal (Strictly Admin-Only) */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminHomePage />} />
              <Route path="bookings" element={<DashboardOverviewPage />} />
              <Route path="orders" element={<DashboardOverviewPage />} />
              <Route path="services" element={<ServicesManagementPage />} />
              <Route path="schedule" element={<ScheduleManagementPage />} />
              <Route path="settings" element={<ScheduleManagementPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </LaundryProvider>
    </AuthProvider>
  );
}

export default App;
