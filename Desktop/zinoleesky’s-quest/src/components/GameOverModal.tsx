import React from 'react';
import { RotateCcw, Heart, Flame } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  onRespawn: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, onRespawn }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-xl shadow-red-600/20 mb-4 border border-red-400">
          <Heart className="w-8 h-8 text-red-100 fill-red-100" />
        </div>

        <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase mb-1">
          Health Depleted
        </span>

        <h2 className="text-2xl font-black text-stone-100 uppercase tracking-wide mb-2 font-display">
          Hold Onto Faith
        </h2>

        <p className="text-sm text-stone-300 leading-relaxed mb-6 px-2">
          Every great journey meets adversity. The sacred drum flame burns at your last checkpoint—ready to restore your 3 hearts and reignite the groove!
        </p>

        <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-300">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Respawn at Activated Faith Totem</span>
        </div>

        <button
          onClick={onRespawn}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm tracking-wide transition-all shadow-lg shadow-red-600/20 active:scale-98 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Respawn with 3 Hearts</span>
        </button>
      </div>
    </div>
  );
};
