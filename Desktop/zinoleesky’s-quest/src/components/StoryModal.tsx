import React, { useState } from 'react';
import { Compass, Music, Flame, Sparkles, ChevronRight, ChevronLeft, Globe, TreePine, Waves, Rocket, Skull } from 'lucide-react';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHAPTERS = [
  {
    realm: 'The Origin & The Calling',
    title: 'A Faith-Guided Pilgrim',
    icon: Compass,
    color: 'text-amber-400',
    bg: 'from-amber-950/40 to-stone-900/60',
    story:
      'In search of his true divine calling, a young artist named Zinoleesky set out into the unknown. He carried no map—only unwavering faith, an inner rhythm in his chest, and an acoustic melody humming in his spirit.',
    quote: '"Faith is the substance of things hoped for, the evidence of beats unseen."',
  },
  {
    realm: 'Realm I: The Whispering Forest',
    title: 'Echoes of Ancient Vines',
    icon: TreePine,
    color: 'text-emerald-400',
    bg: 'from-emerald-950/40 to-stone-900/60',
    story:
      'His first trial was the Whispering Forest—a labyrinth inspired by the legendary Jungle Adventures. Ancient talking drums hung from majestic baobabs, demanding rhythmic jumping and swift slides to overcome the giant Goliath Ape.',
    quote: '"Every rustle in the leaves is percussion waiting to be freed."',
  },
  {
    realm: 'Realm II: The Cosmic Ocean',
    title: 'Depths of Bioluminescence',
    icon: Waves,
    color: 'text-cyan-400',
    bg: 'from-cyan-950/40 to-stone-900/60',
    story:
      'Descending into deep oceanic abysses, Zinoleesky encountered underwater currents pulsating with heavy sub-bass log drums. Facing the Siren Leviathan, his rhythm held true, turning pressure into harmony.',
    quote: '"When the waters rise, let the bass carry your feet."',
  },
  {
    realm: 'Realm III: Deep Celestial Space',
    title: 'Zero-Gravity Starlight Beats',
    icon: Rocket,
    color: 'text-indigo-400',
    bg: 'from-indigo-950/40 to-stone-900/60',
    story:
      'Catapulted beyond the stars, he bounded over floating asteroids and rhythmic zero-gravity bounce pads. Here, futuristic cosmic synths blended with African polyrhythms, shattering the Astral Titan of Discord.',
    quote: '"Even across infinite galaxies, the groove is universal."',
  },
  {
    realm: 'Realm IV: The Underworld',
    title: 'Trials of Fire & Faith',
    icon: Skull,
    color: 'text-red-400',
    bg: 'from-red-950/40 to-stone-900/60',
    story:
      'In the obsidian caverns of the Underworld, shadow spirits and lava geysers attempted to extinguish his faith. But with every Afro-Note blast and steady heartbeat, the darkness yielded to his steadfast spirit.',
    quote: '"Darkness cannot conquer light, and silence cannot silence true rhythm."',
  },
  {
    realm: 'Realm V: Motherland Earth (Africa)',
    title: 'The Great Discovery: MUSIC',
    icon: Globe,
    color: 'text-yellow-400',
    bg: 'from-yellow-950/40 to-stone-900/60',
    story:
      'Finally, his long journey brought him home to the golden savannahs and electric streets of Africa. The people rejoiced, the djembe drums roared, and his soul was awakened with crystalline clarity: HIS PURPOSE WAS ALWAYS MUSIC & AFROBEATS!',
    quote: '"My purpose is found. Through Afrobeats, we heal, celebrate, and unite the world."',
  },
];

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!isOpen) return null;

  const current = CHAPTERS[currentIdx];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-wide text-stone-100 uppercase font-display">
                  Zinoleesky's Quest
                </h2>
                <p className="text-xs text-amber-400 font-medium">The Story of Faith & Purpose</p>
              </div>
            </div>
            <div className="text-xs text-stone-400 font-mono">
              {currentIdx + 1} / {CHAPTERS.length}
            </div>
          </div>

          {/* Chapter Content */}
          <div className={`p-5 rounded-2xl bg-gradient-to-b ${current.bg} border border-stone-800 mb-6 transition-all duration-300`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-5 h-5 ${current.color}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${current.color}`}>
                {current.realm}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-stone-100 mb-3">{current.title}</h3>
            <p className="text-stone-300 text-sm leading-relaxed mb-4">{current.story}</p>
            <div className="border-l-2 border-amber-400 pl-3 py-0.5 text-xs italic text-amber-200/90 font-serif">
              {current.quote}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-stone-800 text-xs font-bold text-stone-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <div className="flex gap-1.5">
            {CHAPTERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIdx ? 'w-6 bg-amber-400' : 'bg-stone-700 hover:bg-stone-600'
                }`}
              />
            ))}
          </div>

          {currentIdx < CHAPTERS.length - 1 ? (
            <button
              onClick={() => setCurrentIdx(prev => Math.min(CHAPTERS.length - 1, prev + 1))}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Begin Quest
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
