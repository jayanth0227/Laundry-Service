import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LaundryProvider } from './context/LaundryContext';
import { ToastContainer } from './components/ui/ToastContainer';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ServicesPage } from './pages/customer/ServicesPage';
import { BookingWizardPage } from './pages/customer/BookingWizardPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { AboutContactPage } from './pages/customer/AboutContactPage';

// Admin Pages
import { DashboardOverviewPage } from './pages/admin/DashboardOverviewPage';
import { OrdersManagementPage } from './pages/admin/OrdersManagementPage';
import { ServicesManagementPage } from './pages/admin/ServicesManagementPage';
import { DispatchPage } from './pages/admin/DispatchPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { SettingsPage } from './pages/admin/SettingsPage';

export function App() {
  return (
    <LaundryProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer Facing Web Platform */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="book" element={<BookingWizardPage />} />
            <Route path="track" element={<OrderTrackingPage />} />
            <Route path="contact" element={<AboutContactPage />} />
          </Route>

          {/* Admin Operations Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardOverviewPage />} />
            <Route path="orders" element={<OrdersManagementPage />} />
            <Route path="services" element={<ServicesManagementPage />} />
            <Route path="dispatch" element={<DispatchPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </LaundryProvider>
  );
}

export default App;
