import React, { useState } from 'react';
import { Sparkles, Check, Droplets, Flame, Wind, Clock, Heart, ShieldCheck } from 'lucide-react';

export const HeroLaundryVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fold' | 'steam' | 'wash'>('fold');

  const visuals = {
    fold: {
      tag: 'Crisp & Neatly Folded',
      title: 'Precision Hand Folding',
      desc: 'Each garment inspected, steam pressed & packed ready for your wardrobe.',
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=1000&q=80',
      badge: '100% Wrinkle Free',
      icon: Sparkles,
      color: 'bg-orange-600',
    },
    steam: {
      tag: 'High-Temperature Dry Iron',
      title: 'Flatbed Steam Pressing',
      desc: '110°C pressurized dry steam removes deep creases without fabric stress.',
      image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1000&q=80',
      badge: 'Zero Fabric Shine',
      icon: Flame,
      color: 'bg-amber-600',
    },
    wash: {
      tag: 'Individual Drum Cycle',
      title: 'Hygienic Dedicated Wash',
      desc: 'Never mixed with other orders. Hypoallergenic plant-based detergents.',
      image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1000&q=80',
      badge: 'Individual Drum',
      icon: Droplets,
      color: 'bg-blue-600',
    },
  };

  const current = visuals[activeTab];

  return (
    <div className="relative mx-auto max-w-lg w-full select-none">
      {/* Warm Ambient Glow Behind Card */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500/20 via-amber-400/20 to-orange-600/10 rounded-3xl blur-2xl transform -rotate-1 pointer-events-none"></div>

      {/* Main Visual Frame */}
      <div className="relative bg-white border border-zinc-200/80 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Visual Canvas with Person Doing Laundry */}
        <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner group">
          <img
            key={activeTab}
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          />

          {/* Soft Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>

          {/* Top Floating Badges (Contained in flex container to eliminate overlapping on mobile) */}
          <div className="absolute top-2.5 sm:top-3 inset-x-2.5 sm:inset-x-3 flex items-center justify-between gap-2 pointer-events-none z-10">
            <div className="bg-white/95 backdrop-blur-md border border-white/60 py-1 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 shadow-sm max-w-[58%] sm:max-w-none">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
              <span className="text-[10px] sm:text-[11px] font-black text-zinc-900 tracking-tight whitespace-nowrap truncate">
                {current.tag}
              </span>
            </div>

            <div className="bg-orange-600/95 backdrop-blur-md text-white py-1 px-2 sm:px-2.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap">
              <current.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-200 animate-spin [animation-duration:6s] shrink-0" />
              <span>{current.badge}</span>
            </div>
          </div>

          {/* Bottom Card Overlay Details */}
          <div className="absolute bottom-3 inset-x-3 text-white space-y-1">
            <div className="text-base font-black tracking-tight drop-shadow-md">
              {current.title}
            </div>
            <p className="text-[11px] text-zinc-200 line-clamp-1 leading-snug drop-shadow-sm font-medium">
              {current.desc}
            </p>
          </div>
        </div>

        {/* Live Interactive Care Treatment Selector */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('fold')}
            className={`py-2 px-1.5 sm:px-2.5 rounded-xl text-center border transition-all ${
              activeTab === 'fold'
                ? 'border-orange-500 bg-orange-50/80 text-orange-700 shadow-xs font-black'
                : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 font-medium'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 ${activeTab === 'fold' ? 'text-orange-600' : 'text-zinc-400'}`} />
            <span className="text-[10px] sm:text-[11px] block leading-tight">Folded Clean</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('steam')}
            className={`py-2 px-1.5 sm:px-2.5 rounded-xl text-center border transition-all ${
              activeTab === 'steam'
                ? 'border-orange-500 bg-orange-50/80 text-orange-700 shadow-xs font-black'
                : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 font-medium'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 ${activeTab === 'steam' ? 'text-orange-600' : 'text-zinc-400'}`} />
            <span className="text-[10px] sm:text-[11px] block leading-tight">Steam Press</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wash')}
            className={`py-2 px-1.5 sm:px-2.5 rounded-xl text-center border transition-all ${
              activeTab === 'wash'
                ? 'border-orange-500 bg-orange-50/80 text-orange-700 shadow-xs font-black'
                : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 font-medium'
            }`}
          >
            <Droplets className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 ${activeTab === 'wash' ? 'text-orange-600' : 'text-zinc-400'}`} />
            <span className="text-[10px] sm:text-[11px] block leading-tight">Hygienic Wash</span>
          </button>
        </div>

        {/* Floating Trust Bar */}
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-xs text-zinc-700 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-black shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[10px] sm:text-[11px] text-zinc-900 leading-tight truncate">Zero Fabric Damage Guarantee</div>
              <div className="text-[9px] sm:text-[10px] text-zinc-500 truncate">Every garment steam treated & tagged</div>
            </div>
          </div>

          <div className="font-mono font-bold text-orange-600 text-[10px] sm:text-[11px] bg-white px-2 py-0.5 sm:py-1 rounded-lg border border-orange-200 shrink-0">
            24h Return
          </div>
        </div>
      </div>
    </div>
  );
};

