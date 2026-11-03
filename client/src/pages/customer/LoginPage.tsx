import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Droplets,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Check
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const { login, register, loading, isAuthenticated, isAdmin } = useAuth();

  // STRICT RBAC: If already logged in, redirect strictly by role
  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to={redirectPath.startsWith('/admin') ? '/' : redirectPath} replace />;
    }
  }

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');



  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        const dest = redirectPath.startsWith('/admin') ? '/' : redirectPath;
        navigate(dest, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await register(name, email, password, phone, address);
      navigate('/', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-zinc-50 to-white flex flex-col justify-between selection:bg-orange-100 selection:text-orange-950">
      {/* Top Application Bar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-6 py-3 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 hover:bg-orange-50 text-zinc-700 hover:text-orange-600 border border-zinc-200/90 hover:border-orange-200 text-xs font-bold transition-all shadow-2xs group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-600 transition-colors" />
            <span className="whitespace-nowrap">Back to Home</span>
          </Link>

          {/* Brand Mark in Header */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black shadow-xs shadow-orange-600/30 group-hover:bg-orange-700 transition-colors">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-black text-sm tracking-tight text-zinc-950 leading-none">
                AquaClean
              </span>
              <span className="text-[9px] font-black tracking-widest text-orange-600 uppercase mt-0.5">
                Portal Access
              </span>
            </div>
          </Link>

          {/* Secure Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-800 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>256-Bit SSL Secure</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-md space-y-4 sm:space-y-5">
          {/* Brand Hero Badge */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-600/25 border-2 border-white ring-4 ring-orange-100">
                <Droplets className="w-7 h-7 text-white" />
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                {activeTab === 'login' ? 'AquaClean Portal Login' : 'Create Customer Account'}
              </h1>
              <p className="text-xs text-zinc-500 font-medium mt-1 max-w-xs mx-auto">
                {activeTab === 'login'
                  ? 'Sign in to access your orders, live plant tracking, and dashboard.'
                  : 'Register your details for scheduled doorstep laundry collection.'}
              </p>
            </div>
          </div>

          {/* Auth Card Container */}
          <div className="bg-white border-2 border-zinc-200/90 rounded-3xl shadow-xl shadow-zinc-200/60 p-5 sm:p-7 space-y-4">
            {/* Segmented Tab Selector */}
            <div className="flex bg-zinc-100/90 p-1 rounded-2xl border border-zinc-200/90">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/70'
                    : 'text-zinc-500 hover:text-zinc-950 font-bold'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/70'
                    : 'text-zinc-500 hover:text-zinc-950 font-bold'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>

            {/* Error Message Notice */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-bold leading-snug">{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-zinc-800 font-black mb-1.5 flex items-center justify-between">
                    <span>Registered Email</span>
                  </label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-zinc-400 group-focus-within:text-orange-600 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border-2 border-zinc-200 hover:border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 bg-white transition-all [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-800 font-black mb-1.5 flex items-center justify-between">
                    <span>Password</span>
                  </label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-zinc-400 group-focus-within:text-orange-600 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl border-2 border-zinc-200 hover:border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 bg-white transition-all [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 rounded-lg transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={loading}
                  className="w-full btn-orange justify-center font-black text-xs py-3.5 rounded-2xl shadow-md shadow-orange-600/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
                >
                  <span>{loading ? 'Authenticating Securely...' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-800 font-black mb-1">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="w-4 h-4 text-zinc-400 group-focus-within:text-orange-600 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-zinc-200 hover:border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-800 font-black mb-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-zinc-400 group-focus-within:text-orange-600 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-zinc-200 hover:border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-800 font-black mb-1">Phone Number (For Pickup SMS)</label>
                  <div className="relative group">
                    <Phone className="w-4 h-4 text-zinc-400 group-focus-within:text-orange-600 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-zinc-200 hover:border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-800 font-black mb-1">Pickup Address</label>
                  <div className="relative group">
                    <MapPin className="w-4 h-4 text-zinc-400 group-focus-within:text-orange-600 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Apartment, Street, Landmark"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-zinc-200 hover:border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-800 font-black mb-1">Password</label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-zinc-400 group-focus-within:text-orange-600 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl border-2 border-zinc-200 hover:border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 rounded-lg transition-colors cursor-pointer"
                      aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={loading}
                  className="w-full btn-orange justify-center font-black text-xs py-3.5 rounded-2xl shadow-md shadow-orange-600/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
                >
                  <span>{loading ? 'Creating Account...' : 'Complete Customer Registration'}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            )}
          </div>

          {/* Trust Badges & Guarantee Footnote */}
          <div className="p-3.5 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs space-y-2 text-center">
            <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-zinc-600 flex-wrap">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                256-Bit SSL
              </span>
              <span className="text-zinc-300">•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                ISO 9001 Fabric Care
              </span>
              <span className="text-zinc-300">•</span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Doorstep Return
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full bg-white/80 border-t border-zinc-200/80 py-3 px-4 text-center text-[11px] text-zinc-500 font-medium">
        <p>AquaClean Commercial Laundry & Dry Iron Facility • Plant Hotline: <span className="font-mono font-bold text-zinc-700">+91 (800) 234-LNDR</span></p>
      </footer>
    </div>
  );
};
