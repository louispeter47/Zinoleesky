import React, { useRef, useEffect } from 'react';
import { Shirt, Disc3, Check, Lock, Sparkles, X } from 'lucide-react';
import { Outfit } from '../types/game';
import { OUTFITS } from '../data/outfitsData';
import { drawZinoleesky } from '../engine/characterRenderer';

interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOutfit: Outfit;
  onSelectOutfit: (outfit: Outfit) => void;
  vinylCount: number;
}

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  isOpen,
  onClose,
  currentOutfit,
  onSelectOutfit,
  vinylCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render preview of currently viewed / selected outfit
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let timer = 0;

    const renderPreview = () => {
      timer += 0.025;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Warm pedestal light
      ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height - 24, 46, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      drawZinoleesky(ctx, {
        x: canvas.width / 2 - 17,
        y: canvas.height - 84,
        width: 34,
        height: 54,
        vx: 0,
        vy: 0,
        isGrounded: true,
        isSliding: false,
        facing: 'right',
        animTimer: timer,
        isHurt: false,
        invulnerableTimer: 0,
        isAttacking: false,
        attackTimer: 0,
        outfit: currentOutfit,
        rhythmCombo: 5,
      });

      animId = requestAnimationFrame(renderPreview);
    };

    renderPreview();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, currentOutfit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-stone-100 uppercase font-display">
                Zinoleesky's Wardrobe
              </h2>
              <p className="text-xs text-amber-400 font-medium">Signature Video Outfits & Styles</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-xs text-amber-300 font-bold">
              <Disc3 className="w-3.5 h-3.5 animate-spin" />
              <span>{vinylCount} Vinyls</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area: Left Preview Canvas, Right Outfits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 overflow-y-auto pr-1">
          {/* Character Stage Preview */}
          <div className="md:col-span-5 bg-stone-950/80 border border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center relative">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">
              Active Style Preview
            </span>
            <canvas ref={canvasRef} width={200} height={190} className="w-[180px] h-[170px]" />
            <div className="text-center mt-2">
              <h4 className="text-sm font-black text-stone-100">{currentOutfit.name}</h4>
              <p className="text-[11px] text-stone-400">{currentOutfit.subtitle}</p>
            </div>
            <div className="mt-2 w-full p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-[10px] font-mono text-amber-300">
                ⭐ {currentOutfit.perk}
              </span>
            </div>
          </div>

          {/* Outfits Collection */}
          <div className="md:col-span-7 flex flex-col gap-2.5">
            {OUTFITS.map(outfit => {
              const isUnlocked = outfit.unlockedByDefault || vinylCount >= outfit.requiredVinyls;
              const isEquipped = currentOutfit.id === outfit.id;

              return (
                <div
                  key={outfit.id}
                  onClick={() => {
                    if (isUnlocked) {
                      onSelectOutfit(outfit);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isEquipped
                      ? 'bg-amber-500/15 border-amber-400 shadow-md'
                      : isUnlocked
                      ? 'bg-stone-800/60 hover:bg-stone-800 border-stone-700/80 cursor-pointer'
                      : 'bg-stone-950/40 border-stone-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Style color swatch */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-white/20"
                      style={{ backgroundColor: outfit.jacketColor }}
                    >
                      <Sparkles className="w-4 h-4 text-white drop-shadow" />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-100">{outfit.name}</span>
                        {isEquipped && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-[9px] font-black text-stone-950">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-amber-400/90 font-medium">
                        {outfit.inspiration}
                      </span>
                      <span className="text-[10px] text-stone-400 mt-0.5">{outfit.perk}</span>
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectOutfit(outfit);
                        }}
                        disabled={isEquipped}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          isEquipped
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-700 hover:bg-stone-600 text-stone-200'
                        }`}
                      >
                        {isEquipped ? 'Active' : 'Wear'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-950/80 border border-stone-800 text-[11px] text-stone-400 font-medium">
                        <Lock className="w-3.5 h-3.5 text-stone-500" />
                        <span>{outfit.requiredVinyls} Vinyls</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-stone-800 text-center text-xs text-stone-400">
          Tip: Explore big maps and hidden chambers to find rare <strong className="text-amber-400">Golden Vinyl Records</strong> to unlock legendary outfits!
        </div>
      </div>
    </div>
  );
};
