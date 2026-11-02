import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Truck,
  Tags,
  Users,
  Settings,
  Sparkles,
  Search,
  Bell,
  Menu,
  X,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { RoleSwitcher } from '../components/ui/RoleSwitcher';
import { useLaundry } from '../context/LaundryContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { metrics, newOrderAlertCount } = useLaundry();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const navItems = [
    { to: '/admin', label: 'Operations Overview', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Orders Queue', icon: ClipboardList, badge: (metrics?.pendingPickup ?? 0) + newOrderAlertCount },
    { to: '/admin/dispatch', label: 'Dispatch & Routes', icon: Truck, badge: metrics?.readyOrOut },
    { to: '/admin/services', label: 'Services & Rates', icon: Tags },
    { to: '/admin/customers', label: 'Customer CRM', icon: Users },
    { to: '/admin/settings', label: 'Settings & Data', icon: Settings },
  ];

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    navigate(`/admin/orders?search=${encodeURIComponent(globalSearch.trim())}`);
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800 antialiased font-sans">
      {/* Desktop Sidebar - Compact, Restrained, High Contrast */}
      <aside className="hidden lg:flex flex-col w-56 bg-slate-900 border-r border-slate-800 text-slate-300 select-none shrink-0">
        {/* Brand */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-teal-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-tight leading-none">AquaClean</span>
              <span className="text-[10px] text-teal-400 font-mono tracking-wider uppercase mt-0.5">Desk Ops</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Workspaces
          </div>
          {navItems.map((item) => {
            const isActive =
              item.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.to);

            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-700 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Facility Status */}
        <div className="p-3 border-t border-slate-800 text-[11px] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Springfield Plant #4
            </span>
            <span className="text-[10px] text-slate-500 font-mono">v1.2</span>
          </div>
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between p-2 rounded bg-slate-800 text-slate-300 hover:text-white text-xs"
          >
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
              <span>Customer View</span>
            </span>
            <span className="text-[10px] text-slate-500">↗</span>
          </Link>
        </div>
      </aside>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Control Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile drawer toggle */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-1.5 rounded text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Order Lookup Form */}
            <form onSubmit={handleGlobalSearch} className="relative w-48 sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search order ID, phone, customer..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs text-slate-900 bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick stats indicator */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600 border-r border-slate-200 pr-3">
              <span>Active Orders: <strong className="text-slate-900 font-mono">{metrics?.activeOrders ?? 0}</strong></span>
              <span className="text-slate-300">|</span>
              <span>Pickups Due: <strong className="text-amber-700 font-mono">{metrics?.pendingPickup ?? 0}</strong></span>
            </div>

            {/* Role Switcher */}
            <RoleSwitcher />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative w-64 bg-slate-900 text-slate-300 flex flex-col h-full z-10 p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-400" />
                  <span className="font-bold text-white text-sm">AquaClean Admin</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileDrawerOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-700 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-800">
                <Link
                  to="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="block text-center py-2 rounded bg-slate-800 text-xs font-semibold text-teal-400 hover:bg-slate-700"
                >
                  Switch to Customer View
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Sub-page Outlet */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

