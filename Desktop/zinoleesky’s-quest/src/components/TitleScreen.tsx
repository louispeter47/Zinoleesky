import React from 'react';
import { Play, BookOpen, Shirt, MapPin, Disc3, Sparkles, Music } from 'lucide-react';
import { Outfit } from '../types/game';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenStory: () => void;
  onOpenWardrobe: () => void;
  onOpenRealmSelect: () => void;
  onOpenJukebox: () => void;
  vinylCount: number;
  currentOutfit: Outfit;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenStory,
  onOpenWardrobe,
  onOpenRealmSelect,
  onOpenJukebox,
  vinylCount,
  currentOutfit,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-stone-950 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Background Graphic Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Tag */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-xs font-mono text-amber-400">
        <Music className="w-3.5 h-3.5 animate-pulse" />
        <span>AN AFROBEATS RHYTHMIC PLATFORMER</span>
      </div>

      {/* Main Title Hero */}
      <div className="flex flex-col items-center text-center max-w-2xl my-auto">
        <span className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-emerald-400 mb-2">
          Inspired by Jungle Adventures
        </span>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-stone-100 uppercase font-display drop-shadow-[0_4px_24px_rgba(250,204,21,0.25)]">
          Zinoleesky's <span className="text-amber-400">Quest</span>
        </h1>
        <p className="text-stone-300 text-sm sm:text-base mt-4 max-w-lg leading-relaxed font-normal">
          Traverse mystical forests, cosmic oceans, deep space, and infernal underworlds guided by faith, until reaching the Motherland to discover that your true divine purpose is <strong className="text-amber-400 font-bold">MUSIC</strong>.
        </p>

        {/* Start Game Button */}
        <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-md">
          <button
            onClick={onStartGame}
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-base tracking-wider uppercase transition-all shadow-xl shadow-amber-500/30 active:scale-98 flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Adventure</span>
          </button>

          {/* PC Keyboard Quick Reference Pill */}
          <div className="w-full p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-[11px] text-stone-300 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1">
              <span className="text-amber-400 font-bold">Blast:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 font-mono text-stone-100 text-[10px]">J</kbd>
              <span>or</span>
              <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 font-mono text-stone-100 text-[10px]">X</kbd>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-400 font-bold">Jump:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 font-mono text-stone-100 text-[10px]">Space</kbd>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-stone-400">Move:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 font-mono text-stone-100 text-[10px]">A</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 font-mono text-stone-100 text-[10px]">D</kbd>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-amber-300">Slide:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 font-mono text-stone-100 text-[10px]">S</kbd>
            </span>
          </div>
        </div>

        {/* Secondary Navigation Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 w-full max-w-md">
          <button
            onClick={onOpenStory}
            className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Storyline</span>
          </button>

          <button
            onClick={onOpenWardrobe}
            className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Shirt className="w-3.5 h-3.5 text-cyan-400" />
            <span>Outfits</span>
          </button>

          <button
            onClick={onOpenRealmSelect}
            className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Realms</span>
          </button>

          <button
            onClick={onOpenJukebox}
            className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Disc3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Jukebox</span>
          </button>
        </div>
      </div>

      {/* Bottom Info bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full border-t border-stone-800/80 pt-4 text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <span>Active Outfit:</span>
          <span className="font-bold text-amber-300">{currentOutfit.name}</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <Disc3 className="w-3.5 h-3.5 text-amber-400" />
          <span>{vinylCount} Golden Vinyls Collected</span>
        </div>
      </div>
    </div>
  );
};
