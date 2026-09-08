import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Music, Sparkles, ArrowRight, Disc3, Heart } from 'lucide-react';
import { RealmId } from '../types/game';
import { REALM_LEVELS } from '../data/realmsData';

interface VictoryModalProps {
  isOpen: boolean;
  realmId: RealmId;
  score: number;
  vinyls: number;
  onContinue: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  realmId,
  score,
  vinyls,
  onContinue,
}) => {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#facc15', '#4ade80', '#38bdf8', '#f97316', '#e11d48'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const data = REALM_LEVELS[realmId] || REALM_LEVELS.forest;
  const isFinalRealm = realmId === 'earth';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden flex flex-col items-center">
        {/* Glow effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-stone-950 shadow-xl shadow-amber-500/20 mb-4 border border-amber-300">
          <Trophy className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase mb-1">
          {isFinalRealm ? '🌟 ULTIMATE PURPOSE UNLOCKED! 🌟' : 'REALM BOSS DEFEATED'}
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-stone-100 uppercase tracking-wide mb-2 font-display">
          {isFinalRealm ? 'The Afrobeats Destiny' : `${data.config.name} Conquered!`}
        </h2>

        <p className="text-sm text-stone-300 leading-relaxed mb-6 px-2">
          {data.config.storyOutro}
        </p>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-stone-400 uppercase font-mono">Total Score</span>
            <span className="text-lg font-black text-amber-300 mt-0.5">{score}</span>
          </div>
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-stone-400 uppercase font-mono">Golden Vinyls</span>
            <div className="flex items-center gap-1.5 text-lg font-black text-amber-300 mt-0.5">
              <Disc3 className="w-4 h-4 text-amber-400 animate-spin" />
              <span>{vinyls}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-amber-500/25 active:scale-98 flex items-center justify-center gap-2"
        >
          <span>{isFinalRealm ? 'Replay Celebration' : 'Proceed to Next Realm'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
