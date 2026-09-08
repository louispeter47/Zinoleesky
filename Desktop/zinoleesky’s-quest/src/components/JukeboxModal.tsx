import React, { useState } from 'react';
import { Music, Play, Square, Disc3, Lock, Sparkles, X, Volume2 } from 'lucide-react';
import { TrackItem } from '../types/game';
import { EXCLUSIVE_TRACKS } from '../data/tracksData';
import { audio } from '../audio/afrobeatSynth';

interface JukeboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedTrackIds: string[];
}

export const JukeboxModal: React.FC<JukeboxModalProps> = ({
  isOpen,
  onClose,
  unlockedTrackIds,
}) => {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlayTrack = (track: TrackItem) => {
    if (playingTrackId === track.id) {
      audio.stopMusic();
      setPlayingTrackId(null);
    } else {
      audio.stopMusic();
      // Map track to realm synth theme
      let realmId = 'forest';
      if (track.id.includes('ocean')) realmId = 'ocean';
      if (track.id.includes('space')) realmId = 'space';
      if (track.id.includes('underworld')) realmId = 'underworld';
      if (track.id.includes('earth')) realmId = 'earth';

      const bpmNum = parseInt(track.tempo) || 110;
      audio.startMusic(realmId, bpmNum);
      setPlayingTrackId(track.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Disc3 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-stone-100 uppercase font-display">
                Afrobeats Jukebox
              </h2>
              <p className="text-xs text-amber-400 font-medium">Exclusive Tracks Found in Hidden Caves</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (playingTrackId) audio.stopMusic();
              onClose();
            }}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tracks List */}
        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
          {EXCLUSIVE_TRACKS.map(track => {
            const isUnlocked = track.unlocked || unlockedTrackIds.includes(track.id);
            const isPlaying = playingTrackId === track.id;

            return (
              <div
                key={track.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isPlaying
                    ? 'bg-amber-500/15 border-amber-400 shadow-lg'
                    : isUnlocked
                    ? 'bg-stone-800/60 hover:bg-stone-800 border-stone-700'
                    : 'bg-stone-950/40 border-stone-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center text-amber-400">
                    <Music className={`w-5 h-5 ${isPlaying ? 'animate-bounce text-amber-400' : ''}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-stone-100">{track.title}</h4>
                      <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {track.tempo}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">{track.realm}</p>
                    <p className="text-[10px] text-stone-400/80 italic">{track.description}</p>
                  </div>
                </div>

                <div>
                  {isUnlocked ? (
                    <button
                      onClick={() => handlePlayTrack(track)}
                      className={`p-2.5 rounded-xl font-bold transition-transform active:scale-95 flex items-center gap-1.5 text-xs ${
                        isPlaying
                          ? 'bg-amber-500 text-stone-950 shadow-md'
                          : 'bg-stone-700 hover:bg-stone-600 text-stone-100'
                      }`}
                    >
                      {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                      <span className="hidden sm:inline">{isPlaying ? 'Stop' : 'Play'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-500 font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Hidden Area</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-stone-800 text-center text-xs text-stone-400">
          Find hidden secret chambers behind vine curtains to discover exclusive Afrobeats tunes!
        </div>
      </div>
    </div>
  );
};
