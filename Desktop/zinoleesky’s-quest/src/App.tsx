import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from './engine/gameEngine';
import { RealmId, Outfit, Boss } from './types/game';
import { OUTFITS } from './data/outfitsData';
import { REALM_LEVELS } from './data/realmsData';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { StoryModal } from './components/StoryModal';
import { WardrobeModal } from './components/WardrobeModal';
import { JukeboxModal } from './components/JukeboxModal';
import { RealmSelectModal } from './components/RealmSelectModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseMenu } from './components/PauseMenu';
import { BannerNotification } from './components/BannerNotification';

const STORAGE_KEY = 'zinoleesky_quest_save_v1';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Persistence State
  const [vinyls, setVinyls] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).vinyls || 0;
    } catch {}
    return 0;
  });

  const [currentOutfit, setCurrentOutfit] = useState<Outfit>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const id = JSON.parse(saved).outfitId;
        const found = OUTFITS.find(o => o.id === id);
        if (found) return found;
      }
    } catch {}
    return OUTFITS[0];
  });

  const [completedRealms, setCompletedRealms] = useState<RealmId[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).completedRealms || [];
    } catch {}
    return [];
  });

  const [unlockedTrackIds, setUnlockedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).unlockedTrackIds || ['track-forest'];
    } catch {}
    return ['track-forest'];
  });

  // Gameplay Reactive State
  const [currentRealm, setCurrentRealm] = useState<RealmId>('forest');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hearts, setHearts] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [beatRating, setBeatRating] = useState<{ text: string; time: number } | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'secret' | 'checkpoint'; time: number } | null>(null);

  // Modals
  const [isStoryOpen, setIsStoryOpen] = useState<boolean>(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState<boolean>(false);
  const [isJukeboxOpen, setIsJukeboxOpen] = useState<boolean>(false);
  const [isRealmSelectOpen, setIsRealmSelectOpen] = useState<boolean>(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);

  // Save progress helper
  const saveProgress = useCallback((vCount: number, outId: string, compRealms: RealmId[], tracks: string[]) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          vinyls: vCount,
          outfitId: outId,
          completedRealms: compRealms,
          unlockedTrackIds: tracks,
        })
      );
    } catch {}
  }, []);

  // Initialize Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(
      canvasRef.current,
      {
        onScoreChange: s => setScore(s),
        onHeartsChange: h => setHearts(h),
        onVinylsChange: v => {
          setVinyls(prev => {
            const next = prev + 1;
            saveProgress(next, currentOutfit.id, completedRealms, unlockedTrackIds);
            return next;
          });
        },
        onBeatHit: (rating, bonus) => {
          setBeatRating({ text: rating, time: Date.now() });
        },
        onSecretRevealed: (name, trackId) => {
          setNotification({ text: name, type: 'secret', time: Date.now() });
          if (trackId && !unlockedTrackIds.includes(trackId)) {
            setUnlockedTrackIds(prev => {
              const updated = [...prev, trackId];
              saveProgress(vinyls, currentOutfit.id, completedRealms, updated);
              return updated;
            });
          }
        },
        onCheckpointReached: name => {
          setNotification({ text: `Checkpoint: ${name}`, type: 'checkpoint', time: Date.now() });
        },
        onGameOver: () => {
          setIsGameOverOpen(true);
        },
        onRealmComplete: realmId => {
          setCompletedRealms(prev => {
            const nextRealms = prev.includes(realmId) ? prev : [...prev, realmId];
            saveProgress(vinyls, currentOutfit.id, nextRealms, unlockedTrackIds);
            return nextRealms;
          });
          setIsVictoryOpen(true);
        },
        onBossStateChange: b => {
          setBoss(b ? { ...b } : null);
        },
      },
      currentOutfit
    );

    engineRef.current = engine;

    const handleWindowResize = () => {
      engine.handleResize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      engine.stop();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current || !isPlaying) return;
      const k = engineRef.current.keys;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          k.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          k.right = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          k.down = true;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          e.preventDefault();
          if (!k.jump) {
            k.jump = true;
            engineRef.current.triggerJump();
          }
          break;
        case 'KeyJ':
        case 'KeyX':
        case 'KeyF':
        case 'KeyZ':
        case 'KeyK':
          e.preventDefault();
          engineRef.current.triggerAttack();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          k.sprint = true;
          break;
        case 'Escape':
          togglePause();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current || !isPlaying) return;
      const k = engineRef.current.keys;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          k.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          k.right = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          k.down = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          k.jump = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          k.sprint = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  // Pause / Resume Handlers
  const togglePause = () => {
    if (!engineRef.current) return;
    const next = !isPaused;
    setIsPaused(next);
    engineRef.current.isPaused = next;
  };

  // Start / Select Realm
  const startAdventure = (realmId: RealmId = currentRealm) => {
    if (!engineRef.current) return;
    setCurrentRealm(realmId);
    setIsPlaying(true);
    setIsPaused(false);
    engineRef.current.isPaused = false;
    engineRef.current.loadRealm(realmId);
    engineRef.current.start();
  };

  const handleSelectOutfit = (outfit: Outfit) => {
    setCurrentOutfit(outfit);
    if (engineRef.current) {
      engineRef.current.setOutfit(outfit);
    }
    saveProgress(vinyls, outfit.id, completedRealms, unlockedTrackIds);
  };

  const handleNextRealm = () => {
    setIsVictoryOpen(false);
    const realmsOrder: RealmId[] = ['forest', 'ocean', 'space', 'underworld', 'earth'];
    const curIdx = realmsOrder.indexOf(currentRealm);
    const nextIdx = (curIdx + 1) % realmsOrder.length;
    startAdventure(realmsOrder[nextIdx]);
  };

  // Virtual Touch Handlers
  const handleTouchDirection = (left: boolean, right: boolean, down: boolean) => {
    if (!engineRef.current) return;
    engineRef.current.keys.left = left;
    engineRef.current.keys.right = right;
    engineRef.current.keys.down = down;
  };

  const handleTouchJump = () => {
    if (!engineRef.current) return;
    engineRef.current.triggerJump();
  };

  const handleTouchAttack = () => {
    if (!engineRef.current) return;
    engineRef.current.triggerAttack();
  };

  const currentLevelConfig = REALM_LEVELS[currentRealm]?.config || REALM_LEVELS.forest.config;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none">
      {/* Primary HTML5 Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none cursor-crosshair"
      />

      {/* Floating HUD (Only shown during active gameplay) */}
      {isPlaying && (
        <HUD
          hearts={hearts}
          score={score}
          vinyls={vinyls}
          boss={boss}
          outfit={currentOutfit}
          realmName={currentLevelConfig.name}
          bpm={currentLevelConfig.bpm}
          beatRating={beatRating}
          onPause={togglePause}
          onDirectionChange={handleTouchDirection}
          onJump={handleTouchJump}
          onAttack={handleTouchAttack}
        />
      )}

      {/* Top Banner Alert (Secret discovered / Checkpoint reached) */}
      <BannerNotification notification={notification} />

      {/* Start / Welcome Screen */}
      {!isPlaying && (
        <TitleScreen
          onStartGame={() => startAdventure(currentRealm)}
          onOpenStory={() => setIsStoryOpen(true)}
          onOpenWardrobe={() => setIsWardrobeOpen(true)}
          onOpenRealmSelect={() => setIsRealmSelectOpen(true)}
          onOpenJukebox={() => setIsJukeboxOpen(true)}
          vinylCount={vinyls}
          currentOutfit={currentOutfit}
        />
      )}

      {/* Pause Menu */}
      <PauseMenu
        isOpen={isPaused}
        onResume={togglePause}
        onRestart={() => startAdventure(currentRealm)}
        onOpenRealmSelect={() => {
          setIsPaused(false);
          setIsRealmSelectOpen(true);
        }}
        onOpenWardrobe={() => {
          setIsPaused(false);
          setIsWardrobeOpen(true);
        }}
        onOpenJukebox={() => {
          setIsPaused(false);
          setIsJukeboxOpen(true);
        }}
        onOpenStory={() => {
          setIsPaused(false);
          setIsStoryOpen(true);
        }}
      />

      {/* Storyline Lore Modal */}
      <StoryModal isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />

      {/* Outfits / Wardrobe Modal */}
      <WardrobeModal
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
        currentOutfit={currentOutfit}
        onSelectOutfit={handleSelectOutfit}
        vinylCount={vinyls}
      />

      {/* Afrobeats Jukebox Modal */}
      <JukeboxModal
        isOpen={isJukeboxOpen}
        onClose={() => setIsJukeboxOpen(false)}
        unlockedTrackIds={unlockedTrackIds}
      />

      {/* Realm Selection Modal */}
      <RealmSelectModal
        isOpen={isRealmSelectOpen}
        onClose={() => setIsRealmSelectOpen(false)}
        currentRealm={currentRealm}
        onSelectRealm={realmId => startAdventure(realmId)}
        completedRealms={completedRealms}
      />

      {/* Victory Modal */}
      <VictoryModal
        isOpen={isVictoryOpen}
        realmId={currentRealm}
        score={score}
        vinyls={vinyls}
        onContinue={handleNextRealm}
      />

      {/* Game Over / Checkpoint Respawn Modal */}
      <GameOverModal
        isOpen={isGameOverOpen}
        onRespawn={() => setIsGameOverOpen(false)}
      />
    </div>
  );
}
