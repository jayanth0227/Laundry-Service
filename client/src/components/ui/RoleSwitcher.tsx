import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const RoleSwitcher: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex items-center bg-slate-900/90 border border-slate-700 p-0.5 rounded-full text-xs font-semibold text-slate-300 shadow-sm backdrop-blur-sm">
      <button
        onClick={() => {
          if (isAdmin) navigate('/');
        }}
        className={`relative flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
          !isAdmin
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-glow-cyan font-bold'
            : 'hover:text-white hover:bg-slate-800'
        }`}
        title="View customer facing website & direct booking"
      >
        <User className="w-3.5 h-3.5" />
        <span>Customer View</span>
      </button>

      <button
        onClick={() => {
          if (!isAdmin) navigate('/admin');
        }}
        className={`relative flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
          isAdmin
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-glow-cyan font-bold'
            : 'hover:text-white hover:bg-slate-800'
        }`}
        title="Open back-office operations dispatch dashboard"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Admin Panel</span>
      </button>
    </div>
  );
};
