import React, { useState } from 'react';
import { Play, RotateCcw, Volume2, MapPin, Shirt, Disc3, BookOpen, X, Keyboard } from 'lucide-react';
import { audio } from '../audio/afrobeatSynth';

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenRealmSelect: () => void;
  onOpenWardrobe: () => void;
  onOpenJukebox: () => void;
  onOpenStory: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onResume,
  onRestart,
  onOpenRealmSelect,
  onOpenWardrobe,
  onOpenJukebox,
  onOpenStory,
}) => {
  const [musicVol, setMusicVol] = useState(0.65);
  const [sfxVol, setSfxVol] = useState(0.8);

  if (!isOpen) return null;

  const handleMusicChange = (val: number) => {
    setMusicVol(val);
    audio.setVolumes(val, sfxVol);
  };

  const handleSfxChange = (val: number) => {
    setSfxVol(val);
    audio.setVolumes(musicVol, val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h2 className="text-xl font-black tracking-wide text-stone-100 uppercase font-display">
              Game Paused
            </h2>
            <p className="text-xs text-amber-400 font-medium">Zinoleesky's Quest</p>
          </div>
          <button
            onClick={onResume}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onResume}
            className="col-span-2 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Adventure</span>
          </button>

          <button
            onClick={onRestart}
            className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Level</span>
          </button>

          <button
            onClick={onOpenRealmSelect}
            className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Realms Map</span>
          </button>

          <button
            onClick={onOpenWardrobe}
            className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Shirt className="w-4 h-4 text-cyan-400" />
            <span>Wardrobe</span>
          </button>

          <button
            onClick={onOpenJukebox}
            className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Disc3 className="w-4 h-4 text-amber-400" />
            <span>Jukebox</span>
          </button>

          <button
            onClick={onOpenStory}
            className="col-span-2 py-2.5 px-3 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-stone-700/60"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>Storyline & Purpose Lore</span>
          </button>
        </div>

        {/* Audio Sliders */}
        <div className="bg-stone-950/60 border border-stone-800/80 p-3.5 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-stone-300">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-amber-400" />
              Afrobeats Music Volume
            </span>
            <span className="font-mono text-stone-400">{Math.round(musicVol * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={musicVol}
            onChange={e => handleMusicChange(parseFloat(e.target.value))}
            className="accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-xs font-bold text-stone-300 mt-1">
            <span>Sound Effects (SFX) Volume</span>
            <span className="font-mono text-stone-400">{Math.round(sfxVol * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={sfxVol}
            onChange={e => handleSfxChange(parseFloat(e.target.value))}
            className="accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Controls Quick Reference */}
        <div className="border-t border-stone-800 pt-3 text-[11px] text-stone-400">
          <div className="flex items-center gap-1.5 font-bold text-stone-300 mb-1.5">
            <Keyboard className="w-3.5 h-3.5 text-amber-400" />
            <span>Desktop Controls Guide:</span>
          </div>
          <div className="grid grid-cols-2 gap-y-1 font-mono text-[10px]">
            <div>• <strong className="text-stone-200">A / D or ◀ ▶</strong> : Run</div>
            <div>• <strong className="text-stone-200">Space / W / ▲</strong> : Jump</div>
            <div>• <strong className="text-stone-200">S / ▼</strong> : Slide (Run + Down)</div>
            <div>• <strong className="text-stone-200">J / X / F</strong> : Shoot Notes</div>
            <div>• <strong className="text-stone-200">Shift</strong> : Fast Sprint</div>
            <div>• <strong className="text-stone-200">Walls</strong> : Wall Slide & Jump</div>
          </div>
        </div>
      </div>
    </div>
  );
};
