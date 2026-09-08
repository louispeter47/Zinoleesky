import {
  RealmId,
  Outfit,
  Platform,
  Trap,
  Enemy,
  Collectible,
  Checkpoint,
  SecretArea,
  Boss,
  Projectile,
  Particle,
} from '../types/game';
import { REALM_LEVELS, RealmLevelData } from '../data/realmsData';
import { drawZinoleesky, PlayerRenderState } from './characterRenderer';
import { audio } from '../audio/afrobeatSynth';

export interface GameEngineCallbacks {
  onScoreChange: (score: number) => void;
  onHeartsChange: (hearts: number) => void;
  onVinylsChange: (vinyls: number) => void;
  onBeatHit: (rating: 'PERFECT' | 'GOOD' | 'MISS', bonus: number) => void;
  onSecretRevealed: (name: string, trackId?: string) => void;
  onCheckpointReached: (name: string) => void;
  onGameOver: () => void;
  onRealmComplete: (realmId: RealmId) => void;
  onBossStateChange: (boss: Boss | null) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  // Realm & State
  public currentRealmId: RealmId = 'forest';
  private levelData!: RealmLevelData;
  public isPaused: boolean = false;
  private isRunning: boolean = false;
  private lastTime: number = 0;

  // Player Stats & Physics
  public player = {
    x: 100,
    y: 800,
    width: 34,
    height: 54,
    vx: 0,
    vy: 0,
    isGrounded: false,
    isSliding: false,
    slideTimer: 0,
    canDoubleJump: true,
    isWallSliding: false,
    wallDir: 0,
    facing: 'right' as 'left' | 'right',
    animTimer: 0,
    invulnerableTimer: 0,
    shootCooldown: 0,
    isAttacking: false,
    attackTimer: 0,
    hearts: 3,
    score: 0,
    vinylsCollected: 0,
    rhythmCombo: 0,
  };

  // Level Entities
  public platforms: Platform[] = [];
  public traps: Trap[] = [];
  public enemies: Enemy[] = [];
  public collectibles: Collectible[] = [];
  public checkpoints: Checkpoint[] = [];
  public secretAreas: SecretArea[] = [];
  public boss: Boss | null = null;
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];

  // Active Checkpoint
  private activeCheckpoint: { x: number; y: number } | null = null;

  // Camera
  public camera = { x: 0, y: 0, width: 800, height: 600, targetX: 0, targetY: 0 };

  // Current Outfit
  public currentOutfit: Outfit;

  // Input states
  public keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    sprint: false,
  };

  // Boss Arena State
  public isInBossArena: boolean = false;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks, initialOutfit: Outfit) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;
    this.currentOutfit = initialOutfit;
    this.handleResize();
  }

  public setOutfit(outfit: Outfit) {
    this.currentOutfit = outfit;
  }

  public loadRealm(realmId: RealmId) {
    this.currentRealmId = realmId;
    const rawData = REALM_LEVELS[realmId] || REALM_LEVELS.forest;
    this.levelData = rawData;

    // Deep clone state for replayability
    this.platforms = JSON.parse(JSON.stringify(rawData.platforms));
    this.traps = JSON.parse(JSON.stringify(rawData.traps));
    this.enemies = JSON.parse(JSON.stringify(rawData.enemies));
    this.collectibles = JSON.parse(JSON.stringify(rawData.collectibles));
    this.checkpoints = JSON.parse(JSON.stringify(rawData.checkpoints));
    this.secretAreas = JSON.parse(JSON.stringify(rawData.secretAreas));

    // Reset Boss
    this.boss = {
      ...rawData.config.boss,
      hp: rawData.config.boss.maxHp,
      attackTimer: 180,
      invulnerableTimer: 0,
      facing: 'left',
      state: 'idle',
    };
    this.isInBossArena = false;

    // Set spawn
    this.player.x = rawData.spawnPoint.x;
    this.player.y = rawData.spawnPoint.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.hearts = 3;
    this.player.invulnerableTimer = 0;
    this.activeCheckpoint = { x: rawData.spawnPoint.x, y: rawData.spawnPoint.y };

    this.projectiles = [];
    this.particles = [];

    this.callbacks.onHeartsChange(this.player.hearts);
    this.callbacks.onBossStateChange(null);

    // Start synthesized Afrobeats soundtrack
    audio.startMusic(realmId, rawData.config.bpm);
  }

  public start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  public stop() {
    this.isRunning = false;
    audio.stopMusic();
  }

  public handleResize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.clientWidth || window.innerWidth;
    this.canvas.height = this.canvas.clientHeight || window.innerHeight;
    this.camera.width = this.canvas.width;
    this.camera.height = this.canvas.height;
  }

  // --- Main Loop ---
  private loop(now: number) {
    if (!this.isRunning) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    if (!this.isPaused) {
      this.update(dt);
    }
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  // --- Update Physics & Logic ---
  private update(dt: number) {
    const p = this.player;
    const outfit = this.currentOutfit;

    // Movement speeds
    const baseSpeed = outfit.perkType === 'speed' ? 360 : 310;
    const maxSpeed = this.keys.sprint ? baseSpeed * 1.3 : baseSpeed;
    const accel = p.isGrounded ? 1800 : 900;
    const friction = p.isGrounded ? 0.82 : 0.94;
    const gravity = 1350;

    p.animTimer += dt;

    // Horizontal Movement
    if (this.keys.left && !p.isSliding) {
      p.vx -= accel * dt;
      p.facing = 'left';
    } else if (this.keys.right && !p.isSliding) {
      p.vx += accel * dt;
      p.facing = 'right';
    } else {
      p.vx *= friction;
    }

    p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));

    // Slide Mechanic
    if (this.keys.down && p.isGrounded && !p.isSliding && Math.abs(p.vx) > 120) {
      p.isSliding = true;
      p.slideTimer = 0.45;
      p.height = 32;
      p.y += 22;
      p.vx = (p.facing === 'right' ? 1 : -1) * (maxSpeed * 1.35);
      this.addSlideSparks();
    }

    if (p.isSliding) {
      p.slideTimer -= dt;
      p.vx *= 0.96;
      if (p.slideTimer <= 0) {
        p.isSliding = false;
        p.height = 54;
        p.y -= 22;
      }
    }

    // Gravity
    p.vy += gravity * dt;
    p.vy = Math.min(p.vy, 950);

    // Wall slide
    p.isWallSliding = false;
    if (!p.isGrounded && p.vy > 0) {
      // Check left/right wall contact
      const wallCheckDist = 6;
      const onLeftWall = this.checkSolidCollision(p.x - wallCheckDist, p.y, p.width, p.height);
      const onRightWall = this.checkSolidCollision(p.x + wallCheckDist, p.y, p.width, p.height);

      if (onLeftWall && this.keys.left) {
        p.isWallSliding = true;
        p.wallDir = -1;
        p.vy = Math.min(p.vy, 180);
      } else if (onRightWall && this.keys.right) {
        p.isWallSliding = true;
        p.wallDir = 1;
        p.vy = Math.min(p.vy, 180);
      }
    }

    // Apply movement & collisions
    this.movePlayerX(p.vx * dt);
    this.movePlayerY(p.vy * dt);

    // Invulnerability timer
    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer -= dt;
    }

    // Shoot cooldown
    if (p.shootCooldown > 0) p.shootCooldown -= dt;
    if (p.isAttacking) {
      p.attackTimer -= dt;
      if (p.attackTimer <= 0) p.isAttacking = false;
    }

    // Out of bounds death check
    if (p.y > this.levelData.config.worldHeight + 100) {
      this.takeDamage(true);
    }

    // Update Platforms (crumbling & bounce)
    this.updatePlatforms(dt);

    // Update Traps
    this.updateTraps(dt);

    // Update Enemies
    this.updateEnemies(dt);

    // Update Boss
    this.updateBoss(dt);

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Collectibles & Checkpoints
    this.updateCollectibles();
    this.updateCheckpoints();

    // Update Particles
    this.updateParticles(dt);

    // Update Camera
    this.updateCamera();
  }

  // --- Player Actions ---
  public triggerJump() {
    const p = this.player;
    const outfit = this.currentOutfit;

    // Check rhythm beat sync
    const accuracy = audio.checkBeatAccuracy();
    const isBeatBoost = accuracy.rating === 'PERFECT' || (outfit.perkType === 'rhythm' && accuracy.rating === 'GOOD');

    if (p.isGrounded) {
      const jumpPower = isBeatBoost ? -680 : -580;
      p.vy = jumpPower;
      p.isGrounded = false;
      p.canDoubleJump = true;
      audio.playJump(false, isBeatBoost);

      if (isBeatBoost) {
        p.rhythmCombo++;
        p.score += accuracy.scoreBonus * 2;
        this.callbacks.onScoreChange(p.score);
        this.callbacks.onBeatHit('PERFECT', accuracy.scoreBonus);
        this.addBeatSparks(p.x + p.width / 2, p.y + p.height);
      }
    } else if (p.isWallSliding) {
      // Wall jump
      p.vy = -540;
      p.vx = -p.wallDir * 320;
      p.facing = p.wallDir === -1 ? 'right' : 'left';
      p.isWallSliding = false;
      p.canDoubleJump = true;
      audio.playJump(true, false);
    } else if (p.canDoubleJump) {
      p.vy = -520;
      p.canDoubleJump = false;
      audio.playJump(true, false);
      this.addDoubleJumpNotes(p.x + p.width / 2, p.y + p.height);
    }
  }

  public triggerAttack() {
    const p = this.player;
    if (p.shootCooldown > 0) return;

    p.isAttacking = true;
    p.attackTimer = 0.2;
    p.shootCooldown = 0.28;

    const outfit = this.currentOutfit;
    const speedMult = outfit.perkType === 'projectile' ? 1.4 : 1.0;
    const dir = p.facing === 'right' ? 1 : -1;

    audio.playShootNote();

    this.projectiles.push({
      x: p.x + (dir === 1 ? p.width + 4 : -12),
      y: p.y + p.height / 2 - 6,
      vx: dir * 560 * speedMult,
      vy: 0,
      radius: 9,
      isPlayer: true,
      lifetime: 1.8,
      type: 'music_note',
      color: outfit.trimColor || '#facc15',
    });

    // Recoil particle
    this.particles.push({
      x: p.x + p.width / 2,
      y: p.y + p.height / 2,
      vx: -dir * 60,
      vy: (Math.random() - 0.5) * 40,
      color: '#facc15',
      size: 4,
      alpha: 1,
      life: 0,
      maxLife: 0.3,
      type: 'sparkle',
    });
  }

  // --- Collision & Movement ---
  private movePlayerX(dx: number) {
    const p = this.player;
    p.x += dx;

    // Arena constraint if boss fight is active
    if (this.isInBossArena && this.boss) {
      p.x = Math.max(this.boss.arenaBounds.minX, Math.min(this.boss.arenaBounds.maxX - p.width, p.x));
    }

    // World left bound
    if (p.x < 0) p.x = 0;

    for (const plat of this.platforms) {
      if (plat.isFallen) continue;
      if (this.checkAABB(p.x, p.y, p.width, p.height, plat.x, plat.y, plat.width, plat.height)) {
        if (dx > 0) {
          p.x = plat.x - p.width;
          p.vx = 0;
        } else if (dx < 0) {
          p.x = plat.x + plat.width;
          p.vx = 0;
        }
      }
    }
  }

  private movePlayerY(dy: number) {
    const p = this.player;
    p.y += dy;
    p.isGrounded = false;

    for (const plat of this.platforms) {
      if (plat.isFallen) continue;
      if (this.checkAABB(p.x, p.y, p.width, p.height, plat.x, plat.y, plat.width, plat.height)) {
        if (dy > 0) {
          // Landing on top of platform
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
          p.canDoubleJump = true;

          // Bounce Drum handling!
          if (plat.type === 'bounce_drum') {
            p.vy = -860;
            p.isGrounded = false;
            audio.playBounceDrum();
            this.addDrumBounceEffect(plat.x + plat.width / 2, plat.y);
          }

          // Crumbling stone platform handling
          if (plat.type === 'crumbling' && !plat.isCrumbling) {
            plat.isCrumbling = true;
            plat.crumbleTimer = 0.55;
            plat.originalY = plat.y;
          }
        } else if (dy < 0) {
          // Hitting platform from below
          p.y = plat.y + plat.height;
          p.vy = 0;
        }
      }
    }
  }

  private checkSolidCollision(x: number, y: number, w: number, h: number): boolean {
    for (const plat of this.platforms) {
      if (plat.isFallen) continue;
      if (this.checkAABB(x, y, w, h, plat.x, plat.y, plat.width, plat.height)) {
        return true;
      }
    }
    return false;
  }

  private checkAABB(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  // --- Platforms (Crumbling & Bounce) ---
  private updatePlatforms(dt: number) {
    for (const plat of this.platforms) {
      if (plat.type === 'crumbling') {
        if (plat.isCrumbling && !plat.isFallen) {
          plat.crumbleTimer! -= dt;
          // Shake effect
          plat.y = plat.originalY! + (Math.random() - 0.5) * 4;
          if (plat.crumbleTimer! <= 0) {
            plat.isFallen = true;
            plat.respawnTimer = 3.5;
            this.addRubbleParticles(plat.x + plat.width / 2, plat.y, plat.width);
          }
        } else if (plat.isFallen) {
          plat.respawnTimer! -= dt;
          if (plat.respawnTimer! <= 0) {
            plat.isFallen = false;
            plat.isCrumbling = false;
            plat.y = plat.originalY!;
          }
        }
      }
    }
  }

  // --- Traps ---
  private updateTraps(dt: number) {
    const p = this.player;
    const beatPhase = audio.getBeatPhase();

    for (const trap of this.traps) {
      if (trap.type === 'pendulum') {
        trap.angle = (trap.angle || 0) + (trap.speed || 2) * dt;
        const currentAngle = Math.sin(trap.angle) * 1.1;
        const length = trap.range || 160;
        trap.x = trap.originX! + Math.sin(currentAngle) * length;
        trap.y = trap.originY! + Math.cos(currentAngle) * length;

        if (this.checkAABB(p.x, p.y, p.width, p.height, trap.x - 16, trap.y - 16, 32, 32)) {
          this.takeDamage();
        }
      } else if (trap.type === 'rhythm_spikes') {
        // Spikes extend on beats 0..0.4, retract otherwise
        trap.active = beatPhase < 0.45;
        if (trap.active && this.checkAABB(p.x, p.y, p.width, p.height, trap.x, trap.y, trap.width, trap.height)) {
          this.takeDamage();
        }
      } else if (trap.type === 'spikes') {
        if (this.checkAABB(p.x, p.y, p.width, p.height, trap.x, trap.y, trap.width, trap.height)) {
          this.takeDamage();
        }
      }
    }
  }

  // --- Enemies ---
  private updateEnemies(dt: number) {
    const p = this.player;

    for (const e of this.enemies) {
      if (e.isDead) continue;

      // Patrol
      e.x += e.vx;
      if (e.x > e.patrolMaxX) {
        e.x = e.patrolMaxX;
        e.vx = -Math.abs(e.vx);
        e.facing = 'left';
      } else if (e.x < e.patrolMinX) {
        e.x = e.patrolMinX;
        e.vx = Math.abs(e.vx);
        e.facing = 'right';
      }

      // Shoot projectile
      if (e.shootCooldown !== undefined) {
        e.shootCooldown -= dt * 60;
        if (e.shootCooldown <= 0) {
          e.shootCooldown = 120 + Math.random() * 40;
          const distToPlayer = Math.hypot(p.x - e.x, p.y - e.y);
          if (distToPlayer < 650) {
            const dirX = p.x > e.x ? 1 : -1;
            this.projectiles.push({
              x: e.x + (dirX === 1 ? e.width + 4 : -8),
              y: e.y + e.height / 2,
              vx: dirX * 240,
              vy: -60,
              radius: 7,
              isPlayer: false,
              lifetime: 3,
              type: e.projectileType || 'coconut',
              color: '#fbbf24',
            });
          }
        }
      }

      // Player vs Enemy Collision
      if (this.checkAABB(p.x, p.y, p.width, p.height, e.x, e.y, e.width, e.height)) {
        // Stomp mechanic (Mario / Jungle Adventures)
        const isStomping = p.vy > 0 && p.y + p.height - p.vy * dt <= e.y + 14;
        if (isStomping) {
          e.hp -= 1;
          p.vy = -540; // Bounce
          audio.playEnemyDefeat();
          this.addScore(150);
          this.addRubbleParticles(e.x + e.width / 2, e.y + e.height / 2, 20);

          if (e.hp <= 0) {
            e.isDead = true;
          }
        } else {
          this.takeDamage();
        }
      }
    }
  }

  // --- Boss Battle AI ---
  private updateBoss(dt: number) {
    if (!this.boss) return;
    const b = this.boss;
    const p = this.player;

    // Trigger Arena lock when player steps in
    if (!this.isInBossArena && p.x >= b.arenaBounds.minX) {
      this.isInBossArena = true;
      this.callbacks.onBossStateChange(b);
    }

    if (!this.isInBossArena) return;

    // Invulnerability timer
    if (b.invulnerableTimer > 0) {
      b.invulnerableTimer -= dt;
    }

    b.attackTimer -= dt * 60;
    b.facing = p.x > b.x ? 'right' : 'left';

    // State machine
    if (b.state === 'idle') {
      if (b.attackTimer <= 0) {
        b.attackTimer = 140;
        const attackRoll = Math.random();
        if (attackRoll < 0.45) {
          // Charge attack
          b.state = 'charging';
          b.vx = (b.facing === 'right' ? 1 : -1) * 320;
        } else {
          // Jump attack
          b.state = 'jumping';
          b.vy = -680;
          b.vx = (b.facing === 'right' ? 1 : -1) * 220;
        }
      }
    } else if (b.state === 'charging') {
      b.x += b.vx * dt;
      if (b.x <= b.arenaBounds.minX || b.x + b.width >= b.arenaBounds.maxX) {
        b.state = 'idle';
        b.vx = 0;
        b.attackTimer = 70;
      }
    } else if (b.state === 'jumping') {
      b.vy += 1200 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Land on arena ground
      if (b.y >= 840) {
        b.y = 840;
        b.vy = 0;
        b.vx = 0;
        b.state = 'idle';
        b.attackTimer = 60;

        // Ground pound shockwaves
        audio.playBossHit();
        this.addDrumBounceEffect(b.x + b.width / 2, b.y + b.height);
        this.projectiles.push(
          { x: b.x, y: b.y + b.height - 12, vx: -280, vy: 0, radius: 10, isPlayer: false, lifetime: 2.5, type: 'fireball', color: '#f97316' },
          { x: b.x + b.width, y: b.y + b.height - 12, vx: 280, vy: 0, radius: 10, isPlayer: false, lifetime: 2.5, type: 'fireball', color: '#f97316' }
        );
      }
    }

    // Boss vs Player Collision
    if (this.checkAABB(p.x, p.y, p.width, p.height, b.x, b.y, b.width, b.height)) {
      // Stomp check on boss head
      const isStomping = p.vy > 0 && p.y + p.height - p.vy * dt <= b.y + 24;
      if (isStomping && b.invulnerableTimer <= 0) {
        this.damageBoss(1);
        p.vy = -620;
      } else {
        this.takeDamage();
      }
    }
  }

  public damageBoss(amount: number = 1) {
    if (!this.boss || this.boss.invulnerableTimer > 0) return;
    const b = this.boss;
    b.hp -= amount;
    b.invulnerableTimer = 1.0;
    audio.playBossHit();
    this.addRubbleParticles(b.x + b.width / 2, b.y + b.height / 2, 40);

    this.callbacks.onBossStateChange({ ...b });

    if (b.hp <= 0) {
      b.state = 'defeated';
      audio.playVictoryFanfare();
      this.addVictoryBurst(b.x + b.width / 2, b.y + b.height / 2);
      this.callbacks.onRealmComplete(this.currentRealmId);
    }
  }

  // --- Projectiles ---
  private updateProjectiles(dt: number) {
    const p = this.player;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.lifetime -= dt;

      if (proj.lifetime <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (proj.isPlayer) {
        // Check hit against enemies
        let hit = false;
        for (const e of this.enemies) {
          if (!e.isDead && this.checkAABB(proj.x - proj.radius, proj.y - proj.radius, proj.radius * 2, proj.radius * 2, e.x, e.y, e.width, e.height)) {
            e.hp -= 1;
            hit = true;
            audio.playEnemyDefeat();
            this.addScore(100);
            this.addRubbleParticles(e.x + e.width / 2, e.y + e.height / 2, 16);
            if (e.hp <= 0) e.isDead = true;
            break;
          }
        }

        // Check hit against boss
        if (!hit && this.boss && this.boss.state !== 'defeated' && this.isInBossArena) {
          const b = this.boss;
          if (this.checkAABB(proj.x - proj.radius, proj.y - proj.radius, proj.radius * 2, proj.radius * 2, b.x, b.y, b.width, b.height)) {
            this.damageBoss(1);
            hit = true;
          }
        }

        if (hit) {
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        // Enemy projectile hits player
        if (this.checkAABB(proj.x - proj.radius, proj.y - proj.radius, proj.radius * 2, proj.radius * 2, p.x, p.y, p.width, p.height)) {
          this.takeDamage();
          this.projectiles.splice(i, 1);
          continue;
        }
      }
    }
  }

  // --- Collectibles & Secrets ---
  private updateCollectibles() {
    const p = this.player;
    const outfit = this.currentOutfit;
    const isMagnet = outfit.perkType === 'magnet';

    for (const c of this.collectibles) {
      if (c.collected) continue;

      // Magnet perk
      if (isMagnet && (c.type === 'note' || c.type === 'fruit')) {
        const dx = (p.x + p.width / 2) - c.x;
        const dy = (p.y + p.height / 2) - c.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 10) {
          c.x += (dx / dist) * 260 * 0.016;
          c.y += (dy / dist) * 260 * 0.016;
        }
      }

      // Pickup
      if (this.checkAABB(p.x, p.y, p.width, p.height, c.x - 14, c.y - 14, 28, 28)) {
        c.collected = true;
        this.addScore(c.value);

        if (c.type === 'note') {
          audio.playCollectNote(p.rhythmCombo);
        } else if (c.type === 'vinyl') {
          p.vinylsCollected++;
          audio.playCollectVinyl();
          this.callbacks.onVinylsChange(p.vinylsCollected);
          this.addBeatSparks(c.x, c.y);
        } else if (c.type === 'heart') {
          if (p.hearts < 3) {
            p.hearts++;
            this.callbacks.onHeartsChange(p.hearts);
          }
          audio.playCollectVinyl();
        } else if (c.type === 'secret_track' || c.type === 'faith_crystal') {
          audio.playSecretRevealed();
          this.callbacks.onSecretRevealed('Exclusive Music Track & Faith Relic Discovered!', c.trackId);
          this.addVictoryBurst(c.x, c.y);
        }
      }
    }

    // Check Secret Areas
    for (const s of this.secretAreas) {
      if (!s.revealed) {
        if (this.checkAABB(p.x, p.y, p.width, p.height, s.curtainBounds.x, s.curtainBounds.y, s.curtainBounds.width, s.curtainBounds.height)) {
          s.revealed = true;
          audio.playSecretRevealed();
          this.callbacks.onSecretRevealed(s.name, s.trackUnlock);
          this.addVictoryBurst(s.bounds.x + s.bounds.width / 2, s.bounds.y + s.bounds.height / 2);
        }
      }
    }
  }

  // --- Checkpoints ---
  private updateCheckpoints() {
    const p = this.player;
    for (const cp of this.checkpoints) {
      if (!cp.activated && this.checkAABB(p.x, p.y, p.width, p.height, cp.x - 20, cp.y - 40, 40, 60)) {
        cp.activated = true;
        this.activeCheckpoint = { x: cp.x, y: cp.y };
        audio.playCheckpoint();
        this.callbacks.onCheckpointReached(cp.name);
        this.addBeatSparks(cp.x, cp.y);
      }
    }
  }

  // --- Damage & Respawn System (3 Hearts & Checkpoints) ---
  public takeDamage(instantKill: boolean = false) {
    const p = this.player;
    if (p.invulnerableTimer > 0 && !instantKill) return;

    p.hearts -= 1;
    this.callbacks.onHeartsChange(p.hearts);
    audio.playDamage();

    // Extra invulnerability perk with Ma Pariwo Noir outfit
    const extraInvuln = this.currentOutfit.perkType === 'defense' ? 1.5 : 0;
    p.invulnerableTimer = 1.8 + extraInvuln;
    p.rhythmCombo = 0;

    // Knockback
    p.vy = -340;
    p.vx = (p.facing === 'right' ? -1 : 1) * 220;

    this.addRubbleParticles(p.x + p.width / 2, p.y + p.height / 2, 25);

    if (p.hearts <= 0 || instantKill) {
      this.respawnAtCheckpoint();
    }
  }

  private respawnAtCheckpoint() {
    const p = this.player;
    p.hearts = 3;
    this.callbacks.onHeartsChange(p.hearts);

    if (this.activeCheckpoint) {
      p.x = this.activeCheckpoint.x;
      p.y = this.activeCheckpoint.y;
    } else {
      p.x = this.levelData.spawnPoint.x;
      p.y = this.levelData.spawnPoint.y;
    }

    p.vx = 0;
    p.vy = 0;
    p.invulnerableTimer = 2.0;
    this.callbacks.onGameOver();
  }

  private addScore(pts: number) {
    this.player.score += pts;
    this.callbacks.onScoreChange(this.player.score);
  }

  // --- Camera ---
  private updateCamera() {
    const p = this.player;
    const targetX = p.x + p.width / 2 - this.camera.width * 0.45;
    const targetY = p.y + p.height / 2 - this.camera.height * 0.55;

    // Smooth lerp
    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.y += (targetY - this.camera.y) * 0.1;

    // Clamp
    this.camera.x = Math.max(0, Math.min(this.levelData.config.worldWidth - this.camera.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.levelData.config.worldHeight - this.camera.height, this.camera.y));
  }

  // --- Particles & FX ---
  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life += dt;
      pt.alpha = 1 - pt.life / pt.maxLife;

      if (pt.life >= pt.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private addSlideSparks() {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.player.x + (this.player.facing === 'right' ? 0 : this.player.width),
        y: this.player.y + this.player.height,
        vx: (Math.random() - 0.5) * 120,
        vy: -Math.random() * 80,
        color: '#fbbf24',
        size: 3,
        alpha: 1,
        life: 0,
        maxLife: 0.35,
        type: 'sparkle',
      });
    }
  }

  private addBeatSparks(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * 160,
        vy: Math.sin(angle) * 160,
        color: '#facc15',
        size: 4.5,
        alpha: 1,
        life: 0,
        maxLife: 0.5,
        type: 'note',
      });
    }
  }

  private addDoubleJumpNotes(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: (Math.random() - 0.5) * 60,
        vy: -80 - Math.random() * 60,
        color: '#38bdf8',
        size: 4,
        alpha: 1,
        life: 0,
        maxLife: 0.45,
        type: 'note',
      });
    }
  }

  private addDrumBounceEffect(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 180,
        vy: -Math.random() * 120,
        color: '#f97316',
        size: 5,
        alpha: 1,
        life: 0,
        maxLife: 0.4,
        type: 'smoke',
      });
    }
  }

  private addRubbleParticles(x: number, y: number, spread: number) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 100,
        vy: Math.random() * 120,
        color: '#78716c',
        size: 4,
        alpha: 1,
        life: 0,
        maxLife: 0.6,
        type: 'smoke',
      });
    }
  }

  private addVictoryBurst(x: number, y: number) {
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const speed = 140 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? '#facc15' : '#4ade80',
        size: 5,
        alpha: 1,
        life: 0,
        maxLife: 0.8,
        type: 'star',
      });
    }
  }

  // --- RENDERING ---
  public render() {
    const ctx = this.ctx;
    const cfg = this.levelData.config;

    // 1. Parallax Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    skyGrad.addColorStop(0, cfg.skyGradient[0]);
    skyGrad.addColorStop(0.6, cfg.skyGradient[1]);
    skyGrad.addColorStop(1, cfg.skyGradient[2]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. Parallax Backdrop (Mountains / Distant Foliage / Lagos Skyline / Stars)
    this.renderParallaxBackdrop(ctx);

    // 3. World Entities (Transformed by Camera)
    ctx.save();
    ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

    // Secret Areas Backdrop
    this.renderSecretAreas(ctx);

    // Checkpoints
    this.renderCheckpoints(ctx);

    // Platforms
    this.renderPlatforms(ctx);

    // Traps
    this.renderTraps(ctx);

    // Collectibles
    this.renderCollectibles(ctx);

    // Enemies
    this.renderEnemies(ctx);

    // Boss
    if (this.boss && this.isInBossArena) {
      this.renderBoss(ctx, this.boss);
    }

    // Projectiles
    this.renderProjectiles(ctx);

    // Zinoleesky Character
    const renderState: PlayerRenderState = {
      x: this.player.x,
      y: this.player.y,
      width: this.player.width,
      height: this.player.height,
      vx: this.player.vx,
      vy: this.player.vy,
      isGrounded: this.player.isGrounded,
      isSliding: this.player.isSliding,
      facing: this.player.facing,
      animTimer: this.player.animTimer,
      isHurt: this.player.invulnerableTimer > 0,
      invulnerableTimer: this.player.invulnerableTimer,
      isAttacking: this.player.isAttacking,
      attackTimer: this.player.attackTimer,
      outfit: this.currentOutfit,
      rhythmCombo: this.player.rhythmCombo,
    };
    drawZinoleesky(ctx, renderState);

    // Particles
    this.renderParticles(ctx);

    ctx.restore();
  }

  private renderParallaxBackdrop(ctx: CanvasRenderingContext2D) {
    const camX = this.camera.x;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const realm = this.currentRealmId;

    if (realm === 'forest') {
      // Distant Jungle canopy layers
      ctx.fillStyle = 'rgba(6, 78, 59, 0.45)';
      for (let i = -1; i < 4; i++) {
        const x = (i * 450 - (camX * 0.2) % 450);
        ctx.beginPath();
        ctx.arc(x, h - 220, 260, 0, Math.PI * 2);
        ctx.fill();
      }
      // Mid canopy
      ctx.fillStyle = 'rgba(5, 150, 105, 0.35)';
      for (let i = -1; i < 5; i++) {
        const x = (i * 320 - (camX * 0.4) % 320);
        ctx.beginPath();
        ctx.arc(x, h - 140, 190, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (realm === 'ocean') {
      // Bioluminescent deep bubbles & sea rays
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      for (let i = 0; i < 8; i++) {
        const x = (i * 180 + Math.sin(this.player.animTimer + i) * 30 - (camX * 0.25) % 180);
        ctx.beginPath();
        ctx.arc(x, (i * 90 + this.player.animTimer * 20) % h, 14 + (i % 3) * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (realm === 'space') {
      // Distant stars & nebulas
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 25; i++) {
        const sx = ((i * 123) - (camX * 0.1) % w + w) % w;
        const sy = (i * 87) % h;
        ctx.beginPath();
        ctx.arc(sx, sy, (i % 3 === 0 ? 2 : 1), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (realm === 'underworld') {
      // Fiery stalactites & magma glow
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, h);
      ctx.lineTo(w, h - 120);
      ctx.lineTo(0, h - 90);
      ctx.fill();
    } else {
      // Earth: African Golden Savannah & Lagos Skyline
      ctx.fillStyle = 'rgba(120, 53, 15, 0.4)';
      // Distant skyline buildings
      for (let i = -1; i < 6; i++) {
        const x = (i * 240 - (camX * 0.2) % 240);
        const bh = 120 + (i % 3) * 60;
        ctx.fillRect(x, h - bh - 60, 90, bh);
      }
      // Acacia tree silhouettes
      ctx.fillStyle = 'rgba(69, 26, 3, 0.55)';
      for (let i = -1; i < 4; i++) {
        const tx = (i * 500 - (camX * 0.35) % 500);
        ctx.beginPath();
        ctx.ellipse(tx, h - 150, 90, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(tx - 6, h - 150, 12, 100);
      }
    }
  }

  private renderPlatforms(ctx: CanvasRenderingContext2D) {
    const cfg = this.levelData.config;

    for (const plat of this.platforms) {
      if (plat.isFallen) continue;

      if (plat.type === 'bounce_drum') {
        // Afro-Djembe Drum
        ctx.save();
        ctx.fillStyle = '#b45309'; // Rich wood
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, [6, 6, 2, 2]);
        ctx.fill();

        // Drum head (parchment leather)
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.ellipse(plat.x + plat.width / 2, plat.y + 6, plat.width / 2 - 2, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Drum ropes / tribal laces
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(plat.x + 8, plat.y + 8);
        ctx.lineTo(plat.x + plat.width / 2, plat.y + plat.height - 4);
        ctx.lineTo(plat.x + plat.width - 8, plat.y + 8);
        ctx.stroke();
        ctx.restore();
      } else if (plat.type === 'crumbling') {
        ctx.fillStyle = plat.isCrumbling ? '#e11d48' : '#78716c';
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 4);
        ctx.fill();
        // Cracks
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(plat.x + 10, plat.y + 4);
        ctx.lineTo(plat.x + 25, plat.y + 18);
        ctx.moveTo(plat.x + plat.width - 20, plat.y + 4);
        ctx.lineTo(plat.x + plat.width - 35, plat.y + 18);
        ctx.stroke();
      } else {
        // Standard Ground or Floating Platform
        ctx.fillStyle = cfg.groundColor;
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, [6, 6, 0, 0]);
        ctx.fill();

        // Lush grass/trim on top
        ctx.fillStyle = cfg.accentColor;
        ctx.fillRect(plat.x, plat.y, plat.width, 6);

        // Hanging grass/vines fringe
        ctx.fillStyle = cfg.accentColor;
        for (let vx = plat.x + 8; vx < plat.x + plat.width - 8; vx += 18) {
          ctx.beginPath();
          ctx.moveTo(vx, plat.y + 6);
          ctx.lineTo(vx + 5, plat.y + 14);
          ctx.lineTo(vx + 10, plat.y + 6);
          ctx.fill();
        }
      }
    }
  }

  private renderTraps(ctx: CanvasRenderingContext2D) {
    for (const trap of this.traps) {
      if (trap.type === 'spikes' || trap.type === 'rhythm_spikes') {
        const isUp = trap.type === 'spikes' || trap.active;
        if (!isUp) continue;

        ctx.fillStyle = trap.type === 'rhythm_spikes' ? '#ef4444' : '#d1d5db';
        const spikeW = 16;
        for (let sx = trap.x; sx < trap.x + trap.width; sx += spikeW) {
          ctx.beginPath();
          ctx.moveTo(sx, trap.y + trap.height);
          ctx.lineTo(sx + spikeW / 2, trap.y);
          ctx.lineTo(sx + spikeW, trap.y + trap.height);
          ctx.fill();
        }
      } else if (trap.type === 'pendulum') {
        // Chain
        ctx.strokeStyle = '#71717a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(trap.originX!, trap.originY!);
        ctx.lineTo(trap.x, trap.y);
        ctx.stroke();

        // Blade / Spiked ball
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(trap.x, trap.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  private renderCollectibles(ctx: CanvasRenderingContext2D) {
    const time = this.player.animTimer;

    for (const c of this.collectibles) {
      if (c.collected) continue;
      const floatY = Math.sin(time * 4 + c.x * 0.05) * 5;
      const drawY = c.y + floatY;

      if (c.type === 'note') {
        // Golden Musical Note
        ctx.save();
        ctx.translate(c.x, drawY);
        ctx.fillStyle = '#facc15';
        // Note head
        ctx.beginPath();
        ctx.ellipse(-4, 4, 6, 4.5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Stem & flag
        ctx.fillRect(1, -12, 2.5, 16);
        ctx.beginPath();
        ctx.moveTo(3, -12);
        ctx.quadraticCurveTo(12, -8, 6, -2);
        ctx.lineTo(3, -7);
        ctx.fill();
        ctx.restore();
      } else if (c.type === 'vinyl') {
        // Golden Vinyl Record (Rare collectible)
        ctx.save();
        ctx.translate(c.x, drawY);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Center label
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (c.type === 'fruit') {
        // Ripe Tropical Fruit (Mango/Pineapple)
        ctx.save();
        ctx.translate(c.x, drawY);
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Green leaf
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(3, -12, 4, 8, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (c.type === 'heart') {
        // Heart Papaya (Restores Health)
        ctx.save();
        ctx.translate(c.x, drawY);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.bezierCurveTo(-10, -8, -14, 2, 0, 12);
        ctx.bezierCurveTo(14, 2, 10, -8, 0, 4);
        ctx.fill();
        ctx.restore();
      } else if (c.type === 'secret_track' || c.type === 'faith_crystal') {
        // Sparkling Faith Crystal / Secret Track Box
        ctx.save();
        ctx.translate(c.x, drawY);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(12, 0);
        ctx.lineTo(0, 16);
        ctx.lineTo(-12, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  private renderCheckpoints(ctx: CanvasRenderingContext2D) {
    for (const cp of this.checkpoints) {
      // Faith Drum Totem
      ctx.save();
      ctx.translate(cp.x, cp.y);

      // Base stone drum
      ctx.fillStyle = '#44403c';
      ctx.fillRect(-14, -20, 28, 40);

      // Glowing Faith Flame if activated
      if (cp.activated) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, -28 + Math.sin(this.player.animTimer * 10) * 3, 10, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(0, -26, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#78716c';
        ctx.beginPath();
        ctx.arc(0, -22, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderSecretAreas(ctx: CanvasRenderingContext2D) {
    for (const s of this.secretAreas) {
      if (!s.revealed) {
        // Concealing vine curtain / rock wall
        ctx.fillStyle = 'rgba(20, 83, 45, 0.95)';
        ctx.fillRect(s.curtainBounds.x, s.curtainBounds.y, s.curtainBounds.width, s.curtainBounds.height);
        // Mysterious vine patterns
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 3;
        for (let y = s.curtainBounds.y; y < s.curtainBounds.y + s.curtainBounds.height; y += 16) {
          ctx.beginPath();
          ctx.moveTo(s.curtainBounds.x, y);
          ctx.lineTo(s.curtainBounds.x + s.curtainBounds.width, y + 8);
          ctx.stroke();
        }
      }
    }
  }

  private renderEnemies(ctx: CanvasRenderingContext2D) {
    for (const e of this.enemies) {
      if (e.isDead) continue;
      ctx.save();
      ctx.translate(e.x + e.width / 2, e.y + e.height / 2);
      if (e.facing === 'left') ctx.scale(-1, 1);

      if (e.type === 'monkey') {
        // Jungle Monkey
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(0, 4, 18, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(10, -8, 12, 0, Math.PI * 2);
        ctx.fill();
        // Ear & face
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(12, -8, 6, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-14, 0, 10, 0, Math.PI);
        ctx.stroke();
      } else if (e.type === 'drone') {
        // Cosmic Drone
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eye
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(6, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'shadow_spirit') {
        // Underworld Spirit
        ctx.fillStyle = 'rgba(220, 38, 38, 0.85)';
        ctx.beginPath();
        ctx.arc(0, -4, 16, 0, Math.PI * 2);
        ctx.fill();
        // Glowing red eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(2, -6, 3, 3);
        ctx.fillRect(8, -6, 3, 3);
      } else {
        // Snail or Slime
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.ellipse(0, 6, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, -4, 4, 4);
      }
      ctx.restore();
    }
  }

  private renderBoss(ctx: CanvasRenderingContext2D, b: Boss) {
    ctx.save();
    ctx.translate(b.x + b.width / 2, b.y + b.height / 2);
    if (b.facing === 'left') ctx.scale(-1, 1);

    if (b.invulnerableTimer > 0 && Math.floor(b.invulnerableTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    if (this.currentRealmId === 'forest') {
      // Goliath Ape Boss
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.roundRect(-45, -50, 90, 100, 16);
      ctx.fill();
      // Face
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.arc(20, -25, 24, 0, Math.PI * 2);
      ctx.fill();
      // Red eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(24, -30, 6, 5);
      // Giant fists
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(35, 20, 18, 0, Math.PI * 2);
      ctx.arc(-35, 20, 18, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.currentRealmId === 'ocean') {
      // Siren Leviathan
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(0, 0, 55, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(25, -15, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.currentRealmId === 'space') {
      // Astral Mecha-Titan
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.roundRect(-45, -50, 90, 100, 8);
      ctx.fill();
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.currentRealmId === 'underworld') {
      // Lord of Despair
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.roundRect(-50, -55, 100, 110, 12);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, -25, 14, 6);
    } else {
      // Rhythm Guardian of Africa
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(-48, -50, 96, 100, 14);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, -10, 24, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D) {
    for (const p of this.projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
