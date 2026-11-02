import React, { useState, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Tags,
  Search,
  Menu,
  X,
  LogOut,
  Droplets,
  Layers,
  CheckCircle2,
  ChevronRight,
  Clock,
  ChevronDown
} from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { orders, metrics, newOrderAlertCount, services } = useLaundry();
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Active bookings count (orders in progress: not delivered and not cancelled)
  const activeBookingsCount = useMemo(() => {
    return orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  }, [orders]);

  // Badge count: displays active bookings count if any, or total bookings count
  const bookingBadgeCount = activeBookingsCount > 0 ? activeBookingsCount : orders.length;

  const isItemActive = (to: string) => {
    if (to === '/admin') {
      return location.pathname === '/admin';
    }
    if (to === '/admin/bookings') {
      return location.pathname.startsWith('/admin/bookings') || location.pathname.startsWith('/admin/orders');
    }
    return location.pathname.startsWith(to);
  };

  const navItems = [
    { to: '/admin', label: 'Home', icon: LayoutDashboard },
    {
      to: '/admin/bookings',
      label: 'Bookings',
      icon: ClipboardList,
      badge: bookingBadgeCount,
      badgeActive: activeBookingsCount > 0,
    },
    { to: '/admin/services', label: 'Services & Pricing', icon: Tags, badge: services.length },
    { to: '/admin/schedule', label: 'Slot Timings & Availability', icon: Clock },
  ];

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    navigate(`/admin/bookings?search=${encodeURIComponent(globalSearch.trim())}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 text-zinc-900 antialiased font-sans">
      {/* ADMIN HEADER */}
      <header className="sticky top-0 z-40 shadow-sm">
        <div className="bg-zinc-950 text-white border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <Link to="/admin" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black shadow-md shadow-orange-600/30 group-hover:bg-orange-700 transition-colors">
                  <Droplets className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-sm text-white tracking-tight leading-none">
                    AquaClean
                  </span>
                  <span className="text-[9px] font-black tracking-widest text-orange-500 uppercase mt-0.5">
                    Admin Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-500' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                          (item as any).badgeActive !== false
                            ? 'bg-orange-600 text-white'
                            : 'bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action: Small Formal Profile Icon with Dropdown Popup */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfilePopupOpen(!profilePopupOpen)}
                className="flex items-center gap-1.5 p-1 pl-1.5 pr-2.5 rounded-full border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-all text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                title="Admin Account Menu"
              >
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="text-zinc-200 text-xs hidden sm:inline">{user?.name || 'Admin'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Profile Popup Dropdown Modal */}
              {profilePopupOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfilePopupOpen(false)}
                  />

                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-zinc-200 py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2 text-zinc-900 space-y-3"
                    onClick={() => setProfilePopupOpen(false)}
                  >
                    <div className="border-b border-zinc-100 pb-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-zinc-950 truncate">
                          {user?.name || 'Administrator'}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                          Admin
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {user?.email || 'admin@aquaclean.com'}
                      </div>
                      {user?.phone && (
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          {user.phone}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-xs font-bold text-zinc-700">
                      <Link
                        to="/admin"
                        onClick={() => setProfilePopupOpen(false)}
                        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-orange-600" />
                        <span>Home Dashboard</span>
                      </Link>

                      <Link
                        to="/admin/bookings"
                        onClick={() => setProfilePopupOpen(false)}
                        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <ClipboardList className="w-4 h-4 text-orange-600" />
                        <span>Customer Bookings</span>
                      </Link>

                      <Link
                        to="/admin/services"
                        onClick={() => setProfilePopupOpen(false)}
                        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <Tags className="w-4 h-4 text-orange-600" />
                        <span>Services & Pricing</span>
                      </Link>

                      <Link
                        to="/admin/schedule"
                        onClick={() => setProfilePopupOpen(false)}
                        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span>Slot Timings & Hours</span>
                      </Link>
                    </div>

                    <div className="border-t border-zinc-100 pt-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left py-1.5 px-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Content View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-8">
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR FOR ADMIN */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 shadow-xl px-1 py-1.5 flex items-center justify-around text-zinc-400">
        <Link
          to="/admin"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 rounded-xl transition-all ${
            location.pathname === '/admin'
              ? 'text-orange-500 font-black'
              : 'hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          to="/admin/bookings"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 rounded-xl transition-all relative ${
            location.pathname.startsWith('/admin/bookings') || location.pathname.startsWith('/admin/orders')
              ? 'text-orange-500 font-black'
              : 'hover:text-white'
          }`}
        >
          <div className="relative">
            <ClipboardList className="w-5 h-5" />
            {bookingBadgeCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold font-mono flex items-center justify-center border-2 border-zinc-950 shadow-xs animate-in zoom-in-75 ${
                  activeBookingsCount > 0
                    ? 'bg-orange-600 text-white'
                    : 'bg-zinc-700 text-zinc-200'
                }`}
                title={`${activeBookingsCount} active bookings`}
              >
                {bookingBadgeCount}
              </span>
            )}
          </div>
          <span>Bookings</span>
        </Link>

        <Link
          to="/admin/services"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 rounded-xl transition-all ${
            location.pathname.startsWith('/admin/services')
              ? 'text-orange-500 font-black'
              : 'hover:text-white'
          }`}
        >
          <Tags className="w-4 h-4" />
          <span>Services</span>
        </Link>

        <Link
          to="/admin/schedule"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 rounded-xl transition-all ${
            location.pathname.startsWith('/admin/schedule')
              ? 'text-orange-500 font-black'
              : 'hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Slot Timings</span>
        </Link>
      </nav>
    </div>
  );
};
