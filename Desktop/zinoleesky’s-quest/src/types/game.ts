export type RealmId = 'forest' | 'ocean' | 'space' | 'underworld' | 'earth';

export interface Outfit {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  inspiration: string; // e.g. "Inspired by 'Kilofeshe' music video"
  jacketColor: string;
  trimColor: string;
  pantsColor: string;
  glassesColor: string;
  hairStyle: 'bleached-dreads' | 'golden-fade' | 'cyber-buzz' | 'royal-locks';
  chainColor: string;
  specialAura?: string;
  perk: string;
  perkType: 'speed' | 'magnet' | 'projectile' | 'defense' | 'rhythm';
  unlockedByDefault?: boolean;
  requiredVinyls: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'note' | 'vinyl' | 'fruit' | 'heart' | 'faith_crystal' | 'secret_track';
  collected: boolean;
  secretArea?: boolean;
  trackId?: string;
  value: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  activated: boolean;
  name: string;
}

export interface Trap {
  id: string;
  type: 'spikes' | 'rhythm_spikes' | 'pendulum' | 'falling_rock' | 'fire_jet' | 'rolling_boulder';
  x: number;
  y: number;
  width: number;
  height: number;
  speed?: number;
  angle?: number;
  range?: number;
  timer?: number;
  active?: boolean;
  beatSynced?: boolean;
  originX?: number;
  originY?: number;
}

export interface Enemy {
  id: string;
  type: 'monkey' | 'snail' | 'slime' | 'drone' | 'shadow_spirit' | 'bat';
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  patrolMinX: number;
  patrolMaxX: number;
  hp: number;
  isDead: boolean;
  facing: 'left' | 'right';
  shootCooldown?: number;
  projectileType?: 'coconut' | 'acid' | 'laser' | 'fireball';
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'floating' | 'crumbling' | 'bounce_drum' | 'ice' | 'vine';
  crumbleTimer?: number;
  isCrumbling?: boolean;
  isFallen?: boolean;
  originalY?: number;
  respawnTimer?: number;
}

export interface SecretArea {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  curtainBounds: { x: number; y: number; width: number; height: number };
  revealed: boolean;
  name: string;
  trackUnlock?: string;
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  hp: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  phase: number;
  attackTimer: number;
  invulnerableTimer: number;
  facing: 'left' | 'right';
  state: 'idle' | 'charging' | 'jumping' | 'attacking' | 'stunned' | 'defeated';
  arenaBounds: { minX: number; maxX: number };
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isPlayer: boolean;
  lifetime: number;
  type: 'music_note' | 'vinyl_disc' | 'coconut' | 'acid' | 'laser' | 'fireball';
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'sparkle' | 'smoke' | 'note' | 'feather' | 'star' | 'bubble';
}

export interface RealmConfig {
  id: RealmId;
  name: string;
  subtitle: string;
  theme: string;
  storyIntro: string;
  storyOutro: string;
  bpm: number;
  worldWidth: number;
  worldHeight: number;
  skyGradient: [string, string, string];
  groundColor: string;
  accentColor: string;
  boss: Omit<Boss, 'hp' | 'attackTimer' | 'invulnerableTimer' | 'facing' | 'state'>;
}

export interface TrackItem {
  id: string;
  title: string;
  realm: string;
  tempo: string;
  description: string;
  unlocked: boolean;
  secretFoundIn?: string;
}
