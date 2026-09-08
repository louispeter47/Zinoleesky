import React from 'react';
import { MapPin, Globe, TreePine, Waves, Rocket, Skull, Lock, ArrowRight, X, Trophy } from 'lucide-react';
import { RealmId } from '../types/game';
import { REALM_LEVELS } from '../data/realmsData';

interface RealmSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRealm: RealmId;
  onSelectRealm: (realmId: RealmId) => void;
  completedRealms: RealmId[];
}

export const RealmSelectModal: React.FC<RealmSelectModalProps> = ({
  isOpen,
  onClose,
  currentRealm,
  onSelectRealm,
  completedRealms,
}) => {
  if (!isOpen) return null;

  const realmsList: { id: RealmId; icon: React.ElementType; color: string; bg: string }[] = [
    { id: 'forest', icon: TreePine, color: 'text-emerald-400', bg: 'hover:border-emerald-500/50' },
    { id: 'ocean', icon: Waves, color: 'text-cyan-400', bg: 'hover:border-cyan-500/50' },
    { id: 'space', icon: Rocket, color: 'text-indigo-400', bg: 'hover:border-indigo-500/50' },
    { id: 'underworld', icon: Skull, color: 'text-red-400', bg: 'hover:border-red-500/50' },
    { id: 'earth', icon: Globe, color: 'text-amber-400', bg: 'hover:border-amber-500/50' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-stone-100 uppercase font-display">
                Realms of Faith
              </h2>
              <p className="text-xs text-amber-400 font-medium">Traverse the Universe to Discover Purpose</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Realms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto pr-1">
          {realmsList.map(({ id, icon: Icon, color, bg }, index) => {
            const data = REALM_LEVELS[id];
            const isCompleted = completedRealms.includes(id);
            // Realm unlocked if it is forest, or if previous realm is completed
            const prevRealmId = index > 0 ? realmsList[index - 1].id : null;
            const isUnlocked = index === 0 || (prevRealmId && completedRealms.includes(prevRealmId));
            const isCurrent = currentRealm === id;

            return (
              <div
                key={id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectRealm(id);
                    onClose();
                  }
                }}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-400 shadow-lg'
                    : isUnlocked
                    ? `bg-stone-800/60 hover:bg-stone-800 border-stone-700 cursor-pointer ${bg}`
                    : 'bg-stone-950/40 border-stone-800/60 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-stone-900 border border-stone-700">
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <span className="text-xs font-mono text-stone-400 uppercase tracking-wider">
                        Realm {index + 1}
                      </span>
                    </div>

                    {isCompleted ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <Trophy className="w-3 h-3" />
                        <span>Defeated</span>
                      </div>
                    ) : isUnlocked ? (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-stone-500" />
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-stone-100">{data.config.name}</h3>
                  <p className="text-[11px] text-stone-400 line-clamp-2 mt-1">{data.config.subtitle}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-[11px]">
                  <span className="font-mono text-amber-400">{data.config.bpm} BPM</span>
                  {isUnlocked && (
                    <span className="flex items-center gap-1 text-xs font-bold text-stone-200">
                      Travel <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
