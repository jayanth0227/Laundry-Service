import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sparkles, Phone, Clock, Search, Menu, X, ArrowRight, ShieldCheck, MapPin, Droplets } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { RoleSwitcher } from '../components/ui/RoleSwitcher';

export const CustomerLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'All Services & Rates' },
    { to: '/track', label: 'Track Order' },
    { to: '/contact', label: 'Coverage & Contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Announcement Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 font-medium text-cyan-400">
              <Clock className="w-3.5 h-3.5" />
              Daily Collection & Return: 8:00 AM – 8:00 PM
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-cyan-500" />
              Direct Route Coverage: Springfield, Eugene & Metro
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Plant Dispatch:</span>
              <span className="font-semibold text-white font-mono">(555) 234-LNDR</span>
            </span>
            <RoleSwitcher />
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - Frosted Glass */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Mark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-glow-cyan group-hover:scale-105 transition-transform">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-slate-900 leading-none">
                AquaClean
              </span>
              <span className="text-[10px] font-bold tracking-widest text-cyan-600 uppercase mt-0.5">
                Garment Care & Iron
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-slate-900 bg-slate-100 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/track">
              <Button variant="secondary" size="sm" className="rounded-full">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Track Order</span>
              </Button>
            </Link>
            <Link to="/#services">
              <Button
                variant="primary"
                size="sm"
                className="gradient-btn-cyan text-white border-0 rounded-full shadow-sm"
                onClick={() => {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
              >
                <span>Select Services</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3">
            <div className="flex flex-col space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                    location.pathname === item.to
                      ? 'bg-cyan-50 text-cyan-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <Link to="/track" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full text-xs">
                  Track Existing Order
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white">
                  <Droplets className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base text-white tracking-tight">AquaClean</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Smart commercial and home garment care. Individual machine drums, high-temp steam pressing, and eco-solvent dry cleaning.
              </p>
              <div className="flex items-center gap-2 text-slate-300 font-medium pt-1">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>100% Garment Care Guarantee</span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
                Core Services
              </h4>
              <ul className="space-y-2">
                <li><Link to="/#services" className="hover:text-white transition-colors">Steam & Dry Ironing</Link></li>
                <li><Link to="/#services" className="hover:text-white transition-colors">Everyday Wash & Fold</Link></li>
                <li><Link to="/#services" className="hover:text-white transition-colors">Executive Shirt Laundering</Link></li>
                <li><Link to="/#services" className="hover:text-white transition-colors">Eco-Solvent Suit Dry Cleaning</Link></li>
                <li><Link to="/#services" className="hover:text-white transition-colors">Sneaker & Footwear Spa</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
                Collection & Hours
              </h4>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex justify-between">
                  <span>Monday – Friday:</span>
                  <span className="text-slate-200">7:00 AM – 9:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday – Sunday:</span>
                  <span className="text-slate-200">8:00 AM – 7:00 PM</span>
                </li>
                <li className="pt-2 text-[11px] text-cyan-400">
                  Guaranteed 24-hour return. Express same-day delivery available.
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
                Central Plant & Dispatch
              </h4>
              <p className="text-slate-400 leading-relaxed mb-3">
                Plant #4, 185 Industrial Parkway<br />
                Springfield Metro, SP 97477
              </p>
              <p className="text-slate-300 font-medium">
                Phone: (555) 234-LNDR (5637)<br />
                Email: dispatch@aquaclean-laundry.com
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>© {new Date().getFullYear()} AquaClean Garment Care Systems. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/services" className="hover:text-slate-300">Service Terms</Link>
              <Link to="/contact" className="hover:text-slate-300">Privacy Policy</Link>
              <Link to="/admin" className="text-cyan-400 hover:text-cyan-300 font-semibold">Admin Panel</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
