import React, { useState } from 'react';
import { Flame, Droplets, Zap, Sparkles } from 'lucide-react';

export const AnimatedWashingMachine: React.FC = () => {
  const [cycleMode, setCycleMode] = useState<'steam' | 'wash' | 'express' | 'delicate'>('wash');

  const cycleDetails = {
    wash: { name: 'HYPO WASH & DRY', temp: '40°C Cold Wash', time: '24:00', rpm: '1200 RPM', color: 'text-orange-500' },
    steam: { name: 'HIGH STEAM IRON', temp: '110°C Steam', time: '18:30', rpm: 'Wrinkle Press', color: 'text-amber-500' },
    express: { name: 'EXPRESS 6-HOUR', temp: '60°C Sanitized', time: '06:00', rpm: '1400 RPM Turbo', color: 'text-red-500' },
    delicate: { name: 'SILK & DELICATES', temp: '30°C Gentle', time: '35:00', rpm: '400 RPM Soft', color: 'text-emerald-500' },
  };

  const current = cycleDetails[cycleMode];

  return (
    <div className="relative mx-auto max-w-sm sm:max-w-md w-full select-none">
      {/* Outer Washing Machine Chassis */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 rounded-3xl border-2 border-zinc-800 shadow-2xl space-y-4">
        {/* Top Control Panel */}
        <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                ACTIVE FACILITY DRUM
              </span>
            </div>
            <div className="text-white font-mono font-black text-lg tracking-wider mt-0.5">
              {current.time}
            </div>
          </div>

          <div className="text-right">
            <div className={`text-xs font-black uppercase tracking-wider ${current.color}`}>
              {current.name}
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              {current.temp} • {current.rpm}
            </div>
          </div>
        </div>

        {/* Circular Door Frame with Glass Drum */}
        <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[300px] mx-auto rounded-full bg-gradient-to-tr from-zinc-800 via-zinc-700 to-zinc-800 p-4 shadow-inner flex items-center justify-center border-4 border-zinc-900">
          {/* Glass Door Inner Bezel */}
          <div className="relative w-full h-full rounded-full bg-zinc-950 overflow-hidden flex items-center justify-center border border-zinc-700/50">
            {/* Water layer with swirl animation */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-cyan-900/30 to-blue-900/60 wash-drum">
              {/* Washing soap bubbles */}
              <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-white/40 blur-[1px] animate-bubble"></div>
              <div className="absolute top-1/2 right-1/4 w-6 h-6 rounded-full bg-white/30 blur-[1px] animate-bubble" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-1/4 left-1/3 w-5 h-5 rounded-full bg-white/35 blur-[1px] animate-bubble" style={{ animationDelay: '1.8s' }}></div>
            </div>

            {/* Agitating Garments Silhouette inside Drum */}
            <div className="relative z-10 wash-drum flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-orange-500/40 flex items-center justify-center">
                <div className="p-3 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/30 shadow-orange-glow">
                  {cycleMode === 'steam' ? (
                    <Flame className="w-10 h-10 animate-bounce" />
                  ) : cycleMode === 'express' ? (
                    <Zap className="w-10 h-10 animate-pulse" />
                  ) : (
                    <Droplets className="w-10 h-10 animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            {/* Glass Glare Reflection Curved Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-full"></div>
            {/* Door Handle Latch */}
            <div className="absolute right-3 w-3 h-8 rounded-full bg-zinc-600 border border-zinc-500 shadow-md"></div>
          </div>
        </div>

        {/* Machine Interactive Cycle Presets */}
        <div className="pt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-2">
            Click to Preview Cycle Treatment
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-xs">
            <button
              onClick={() => setCycleMode('wash')}
              className={`p-2 rounded-xl text-center font-bold transition-all ${
                cycleMode === 'wash'
                  ? 'bg-orange-600 text-white shadow-orange-glow'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 mx-auto mb-1 text-white" />
              <span className="text-[10px] block">Wash & Fold</span>
            </button>

            <button
              onClick={() => setCycleMode('steam')}
              className={`p-2 rounded-xl text-center font-bold transition-all ${
                cycleMode === 'steam'
                  ? 'bg-orange-600 text-white shadow-orange-glow'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 mx-auto mb-1 text-white" />
              <span className="text-[10px] block">Steam Iron</span>
            </button>

            <button
              onClick={() => setCycleMode('express')}
              className={`p-2 rounded-xl text-center font-bold transition-all ${
                cycleMode === 'express'
                  ? 'bg-orange-600 text-white shadow-orange-glow'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 mx-auto mb-1 text-white" />
              <span className="text-[10px] block">Express 6h</span>
            </button>

            <button
              onClick={() => setCycleMode('delicate')}
              className={`p-2 rounded-xl text-center font-bold transition-all ${
                cycleMode === 'delicate'
                  ? 'bg-orange-600 text-white shadow-orange-glow'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 mx-auto mb-1 text-white" />
              <span className="text-[10px] block">Delicates</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

