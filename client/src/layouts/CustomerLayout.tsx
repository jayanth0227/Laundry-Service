import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLaundry } from '../context/LaundryContext';
import {
  Sparkles,
  Phone,
  Clock,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Calendar,
  MapPin,
  ShoppingBag,
  Droplets,
  Home,
  Tag,
  Truck
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartItemsCount } = useLaundry();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // STRICT RBAC: Administrator is strictly forbidden from accessing public customer pages
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/prices', label: 'Prices' },
    { to: '/book', label: 'Book Pickup' },
    { to: '/my-bookings', label: 'My Bookings' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-zinc-900">
      {/* Top Utility Announcement Bar (Hidden on Mobile view) */}
      <div className="hidden md:block bg-zinc-950 text-zinc-300 text-xs py-2 px-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-orange-400">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              Daily Doorstep Pickup: 8:00 AM – 8:00 PM
            </span>
            <span className="hidden md:inline text-zinc-700">|</span>
            <span className="hidden md:flex items-center gap-1 text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              Serving Metro City & Surrounding Areas
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>Plant Helpline:</span>
              <span className="font-bold text-white font-mono">+91 (800) 234-LNDR</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand Mark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black shadow-md shadow-orange-600/30 group-hover:bg-orange-700 transition-colors">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-zinc-950 leading-none">
                AquaClean
              </span>
              <span className="text-[10px] font-black tracking-widest text-orange-600 uppercase mt-0.5">
                Garment Care & Dry Iron
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                    isActive
                      ? 'text-orange-600 bg-orange-50 font-black'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Session Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-zinc-200 hover:border-orange-500 bg-white transition-all text-xs font-bold"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-black">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-zinc-800">{user.name}</span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-zinc-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-zinc-100">
                      <div className="text-xs font-bold text-zinc-950 truncate">{user.name}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{user.email}</div>
                    </div>

                    <Link
                      to="/my-bookings"
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span>My Bookings</span>
                    </Link>

                    <div className="border-t border-zinc-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button
                  variant="secondary"
                  size="sm"
                  className="btn-outline rounded-xl text-xs"
                >
                  <UserIcon className="w-3.5 h-3.5 text-zinc-600 mr-1" />
                  <span>Sign In / Register</span>
                </Button>
              </Link>
            )}

            <Link to="/book">
              <button className="btn-orange px-4 py-2 rounded-xl text-xs font-bold shadow-orange-glow flex items-center gap-1.5 relative">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Book Pickup</span>
                {cartItemsCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-zinc-950 text-white text-[10px] font-black flex items-center justify-center -mr-1">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </Link>
          </div>

          {/* Mobile Right Action: Profile Button (Replaces Hamburger) */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(!profileModalOpen)}
                  className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full border border-zinc-200 bg-white hover:border-orange-500 transition-all text-xs font-bold shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-zinc-800 text-xs truncate max-w-[70px]">{user.name.split(' ')[0]}</span>
                </button>

                {profileModalOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-zinc-200 py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2 space-y-3"
                    onClick={() => setProfileModalOpen(false)}
                  >
                    <div className="border-b border-zinc-100 pb-2">
                      <div className="text-xs font-black text-zinc-950">{user.name}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{user.email}</div>
                      {user.phone && <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{user.phone}</div>}
                    </div>

                    <Link
                      to="/my-bookings"
                      className="w-full text-left py-1.5 text-xs font-bold text-zinc-700 hover:text-orange-600 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-orange-600" />
                      <span>My Bookings</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setProfileModalOpen(false);
                      }}
                      className="w-full text-left pt-2 border-t border-zinc-100 text-xs font-bold text-red-600 flex items-center gap-2 hover:underline"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Body with bottom padding on mobile for bottom nav */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR FOR CUSTOMER */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-lg border-t border-zinc-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around">
        {[
          { to: '/', label: 'Home', icon: Home, matchExact: true },
          { to: '/prices', label: 'Prices', icon: Tag, matchExact: false },
          { to: '/book', label: 'Book', icon: Truck, matchExact: false },
          { to: '/my-bookings', label: 'Bookings', icon: ShoppingBag, matchExact: false },
        ].map((item) => {
          const isActive = item.matchExact 
            ? location.pathname === item.to 
            : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-orange-600' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-orange-50 text-orange-600' : ''}`}>
                <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 leading-none ${isActive ? 'font-black text-orange-600' : 'font-semibold text-zinc-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <footer className="bg-zinc-950 text-white border-t border-zinc-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center font-black">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-base text-white tracking-tight">AquaClean</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Commercial garment care, high-temperature flatbed dry ironing, and allergen-free hygienic laundry with doorstep collection.
            </p>
          </div>

          <div>
            <div className="font-bold text-sm text-white mb-3">Garment Care Services</div>
            <ul className="space-y-2 text-zinc-400">
              <li><Link to="/#services-section" className="hover:text-orange-400 transition-colors">Steam & Dry Ironing</Link></li>
              <li><Link to="/#services-section" className="hover:text-orange-400 transition-colors">Everyday Wash & Fold</Link></li>
              <li><Link to="/#services-section" className="hover:text-orange-400 transition-colors">Executive Dry Cleaning</Link></li>
              <li><Link to="/#services-section" className="hover:text-orange-400 transition-colors">Bedding & Home Linens</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-sm text-white mb-3">Direct Platform Links</div>
            <ul className="space-y-2 text-zinc-400">
              <li><Link to="/#services-section" className="hover:text-orange-400 transition-colors">Services Catalogue</Link></li>
              <li><Link to="/book" className="hover:text-orange-400 transition-colors">Book Doorstep Pickup</Link></li>
              <li><Link to="/my-bookings" className="hover:text-orange-400 transition-colors">My Bookings</Link></li>
              <li><Link to="/login" className="hover:text-orange-400 transition-colors">Customer Portal</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-sm text-white mb-3">Plant Facility Contacts</div>
            <p className="text-zinc-400 text-xs">Central Steam Plant #4, Industrial Zone, Metro City</p>
            <p className="text-zinc-400 text-xs">Dispatch Helpline: +91 98765 43210</p>
            <p className="text-zinc-400 text-xs">Support: contact@aquaclean-laundry.in</p>
          </div>
        </div>

        <div className="border-t border-zinc-900 py-4 px-4 text-center text-[11px] text-zinc-400">
          © 2026 AquaClean Garment Care Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
