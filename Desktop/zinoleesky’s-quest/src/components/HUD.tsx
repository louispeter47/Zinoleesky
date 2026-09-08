import React, { useEffect, useState } from 'react';
import { Heart, Disc3, Music, Sparkles, Pause, Volume2, VolumeX, Shield } from 'lucide-react';
import { Boss, Outfit } from '../types/game';
import { audio } from '../audio/afrobeatSynth';

interface HUDProps {
  hearts: number;
  score: number;
  vinyls: number;
  boss: Boss | null;
  outfit: Outfit;
  realmName: string;
  bpm: number;
  beatRating: { text: string; time: number } | null;
  onPause: () => void;
  // Touch handlers
  onDirectionChange: (left: boolean, right: boolean, down: boolean) => void;
  onJump: () => void;
  onAttack: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  hearts,
  score,
  vinyls,
  boss,
  outfit,
  realmName,
  bpm,
  beatRating,
  onPause,
  onDirectionChange,
  onJump,
  onAttack,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [beatPhase, setBeatPhase] = useState(0);

  useEffect(() => {
    let animId: number;
    const updatePhase = () => {
      setBeatPhase(audio.getBeatPhase());
      animId = requestAnimationFrame(updatePhase);
    };
    animId = requestAnimationFrame(updatePhase);
    return () => cancelAnimationFrame(animId);
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audio.setMuted(next);
  };

  return (
    <div id="game-hud" className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Left: Hearts & Player Info */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Hearts */}
          <div className="flex items-center gap-1.5 bg-stone-950/80 backdrop-blur-md border border-stone-800/80 px-3 py-1.5 rounded-full shadow-lg">
            {[0, 1, 2].map(idx => (
              <Heart
                key={idx}
                className={`w-6 h-6 transition-all duration-300 ${
                  idx < hearts
                    ? 'text-red-500 fill-red-500 scale-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                    : 'text-stone-600 fill-stone-800 scale-90'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-stone-300 ml-1">
              {hearts}/3
            </span>
          </div>

          {/* Outfit Badge & Active Perk */}
          <div className="flex items-center gap-1.5 bg-stone-950/80 backdrop-blur-md border border-stone-800/80 px-2.5 py-1 rounded-full text-xs text-amber-300 font-medium">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate max-w-[130px] sm:max-w-none">{outfit.name}</span>
          </div>
        </div>

        {/* Center: Beat Bar & Rhythm Sync Indicator */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="bg-stone-950/85 backdrop-blur-md border border-amber-500/30 px-4 py-1.5 rounded-2xl shadow-xl flex flex-col items-center gap-1 min-w-[160px] sm:min-w-[200px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 tracking-wider">
              <Music className="w-3.5 h-3.5 animate-pulse" />
              <span>AFROBEATS RHYTHM</span>
              <span className="text-[10px] text-stone-400 font-mono">({bpm} BPM)</span>
            </div>

            {/* Rhythmic Beat Pulse Metronome */}
            <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden relative border border-stone-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-75"
                style={{
                  width: `${(1 - beatPhase) * 100}%`,
                  boxShadow: beatPhase < 0.2 ? '0 0 12px #facc15' : 'none',
                }}
              />
              <div
                className="absolute top-0 bottom-0 w-2 bg-white rounded-full transition-transform duration-75"
                style={{ left: `${(1 - beatPhase) * 96}%` }}
              />
            </div>

            {/* Beat hit rating popup */}
            {beatRating && Date.now() - beatRating.time < 800 && (
              <span className="text-xs font-black tracking-widest text-yellow-300 animate-bounce">
                {beatRating.text}!
              </span>
            )}
          </div>
          <span className="text-[10px] text-stone-400 mt-0.5 font-medium">
            {realmName}
          </span>
        </div>

        {/* Right: Scores & Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Vinyls & Score */}
          <div className="bg-stone-950/80 backdrop-blur-md border border-stone-800/80 px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs sm:text-sm">
              <Disc3 className="w-4 h-4 animate-spin text-amber-400" />
              <span>{vinyls}</span>
            </div>
            <div className="w-px h-4 bg-stone-700" />
            <div className="flex items-center gap-1 text-stone-100 font-black text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>{score}</span>
            </div>
          </div>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-stone-950/80 hover:bg-stone-800 border border-stone-800 text-stone-200 transition-colors shadow-lg active:scale-95"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="p-2 rounded-xl bg-stone-950/80 hover:bg-stone-800 border border-stone-800 text-stone-200 transition-colors shadow-lg active:scale-95"
            title="Pause Game"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Boss Health Bar (Only active when in Boss Arena) */}
      {boss && boss.state !== 'defeated' && (
        <div className="self-center w-full max-w-md bg-stone-950/90 backdrop-blur-md border border-red-500/40 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-1 pointer-events-auto animate-in fade-in duration-300">
          <div className="flex justify-between items-center text-xs font-bold text-red-400 px-1">
            <span>{boss.name}</span>
            <span className="text-stone-400 text-[10px]">{boss.title}</span>
          </div>
          <div className="w-full h-3.5 bg-stone-900 rounded-full overflow-hidden border border-red-950">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-500 transition-all duration-300"
              style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-center text-stone-400">
            HP: {Math.max(0, boss.hp)} / {boss.maxHp}
          </div>
        </div>
      )}

      {/* Bottom Virtual Controls & Keyboard hints */}
      <div className="flex items-end justify-between w-full pointer-events-auto pb-1 sm:pb-2 gap-2">
        {/* D-Pad Left / Right / Down (Slide) */}
        <div className="flex items-center gap-2 bg-stone-950/70 backdrop-blur-md p-1.5 rounded-2xl border border-stone-800/80">
          <button
            onPointerDown={() => onDirectionChange(true, false, false)}
            onPointerUp={() => onDirectionChange(false, false, false)}
            onPointerLeave={() => onDirectionChange(false, false, false)}
            className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-stone-800/90 active:bg-amber-600 active:scale-95 text-stone-100 font-bold flex flex-col items-center justify-center border border-stone-700 shadow-md"
            title="Move Left (A / ◀)"
          >
            <span className="text-base">◀</span>
            <span className="text-[9px] text-stone-400 font-mono hidden sm:inline">[A]</span>
          </button>
          <button
            onPointerDown={() => onDirectionChange(false, false, true)}
            onPointerUp={() => onDirectionChange(false, false, false)}
            onPointerLeave={() => onDirectionChange(false, false, false)}
            className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-stone-800/90 active:bg-amber-600 active:scale-95 text-stone-200 font-bold flex flex-col items-center justify-center border border-stone-700 shadow-md text-xs"
            title="Slide under obstacles (S / ▼)"
          >
            <span>▼</span>
            <span className="text-[9px] uppercase font-mono text-amber-300">Slide</span>
            <span className="text-[8px] text-stone-400 font-mono hidden sm:inline">[S]</span>
          </button>
          <button
            onPointerDown={() => onDirectionChange(false, true, false)}
            onPointerUp={() => onDirectionChange(false, false, false)}
            onPointerLeave={() => onDirectionChange(false, false, false)}
            className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-stone-800/90 active:bg-amber-600 active:scale-95 text-stone-100 font-bold flex flex-col items-center justify-center border border-stone-700 shadow-md"
            title="Move Right (D / ▶)"
          >
            <span className="text-base">▶</span>
            <span className="text-[9px] text-stone-400 font-mono hidden sm:inline">[D]</span>
          </button>
        </div>

        {/* Center PC Keyboard Guide Pill (Visible on screens with space) */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-stone-950/75 backdrop-blur-md border border-stone-800/70 text-[11px] text-stone-300 shadow-md">
          <span className="flex items-center gap-1 text-amber-300 font-bold">
            <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-100 font-mono text-[10px]">J</kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-100 font-mono text-[10px]">X</kbd>
            <span className="ml-0.5">Blast Notes</span>
          </span>
          <span className="text-stone-600">•</span>
          <span className="flex items-center gap-1 text-emerald-300 font-medium">
            <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-100 font-mono text-[10px]">Space</kbd>
            <span className="ml-0.5">Jump</span>
          </span>
          <span className="text-stone-600">•</span>
          <span className="flex items-center gap-1 text-stone-300">
            <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-100 font-mono text-[10px]">S</kbd>
            <span className="ml-0.5">Slide</span>
          </span>
        </div>

        {/* Action Buttons: Jump & Afro-Note Attack */}
        <div className="flex items-center gap-3 bg-stone-950/70 backdrop-blur-md p-1.5 rounded-2xl border border-stone-800/80">
          {/* Shoot Afro-Notes Blast */}
          <button
            onPointerDown={onAttack}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 active:from-amber-400 active:scale-95 text-white font-bold flex flex-col items-center justify-center border border-amber-300/60 shadow-lg"
            title="Shoot Afro-Note Blast (J / X / Z)"
          >
            <Music className="w-5 h-5 text-yellow-200" />
            <span className="text-[10px] font-mono font-black tracking-tight uppercase mt-0.5">Blast</span>
            <span className="text-[9px] font-mono text-yellow-200/90 font-bold">[J / X]</span>
          </button>

          {/* Jump */}
          <button
            onPointerDown={onJump}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 active:from-emerald-500 active:scale-95 text-white font-black flex flex-col items-center justify-center border border-emerald-400/50 shadow-lg text-sm"
            title="Jump / Double Jump (Space / W / ▲)"
          >
            <span>▲</span>
            <span className="text-[10px] font-mono tracking-tighter uppercase">Jump</span>
            <span className="text-[9px] font-mono text-emerald-200/90 font-bold">[Space]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
