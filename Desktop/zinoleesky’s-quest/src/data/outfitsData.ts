import { Outfit } from '../types/game';

export const OUTFITS: Outfit[] = [
  {
    id: 'lagos-street',
    name: 'Lagos Street Star',
    subtitle: 'Classic Streetwear & Gold Chains',
    description: 'Zinoleesky’s iconic yellow varsity jacket, heavy iced chain, and dark designer shades.',
    inspiration: 'Signature daily look and street-pop breakthrough era',
    jacketColor: '#eab308', // Yellow
    trimColor: '#1e293b',   // Navy
    pantsColor: '#334155',  // Dark denim
    glassesColor: '#0f172a', // Jet black shades
    hairStyle: 'bleached-dreads',
    chainColor: '#fbbf24',  // Solid Gold
    specialAura: undefined,
    perk: 'Standard Balanced Movement',
    perkType: 'speed',
    unlockedByDefault: true,
    requiredVinyls: 0,
  },
  {
    id: 'kilofeshe-chrome',
    name: 'Kilofeshe Chrome',
    subtitle: 'Futuristic Metallic Puffer',
    description: 'A heavy metallic silver puffer jacket with reflective cyberpunk eyewear and speed boost.',
    inspiration: 'Inspired by the viral "Kilofeshe" Amapiano fusion music video',
    jacketColor: '#cbd5e1', // Chrome / silver
    trimColor: '#06b6d4',   // Neon Cyan
    pantsColor: '#1e293b',
    glassesColor: '#06b6d4', // Cyan cyber shades
    hairStyle: 'cyber-buzz',
    chainColor: '#e2e8f0',  // Platinum
    specialAura: 'rgba(6, 182, 212, 0.4)',
    perk: '+35% Faster Afro-Note projectile velocity',
    perkType: 'projectile',
    unlockedByDefault: false,
    requiredVinyls: 3,
  },
  {
    id: 'loving-you-silk',
    name: 'Loving You Retro',
    subtitle: '90s Floral Vintage Silk & Fedora',
    description: 'Luxurious patterned floral silk with a classic brimmed fedora and magnetic charm.',
    inspiration: 'Inspired by the upbeat romantic "Loving You" retro music video aesthetic',
    jacketColor: '#f43f5e', // Rose floral
    trimColor: '#fde047',   // Gold pattern
    pantsColor: '#f8fafc',  // Cream trousers
    glassesColor: '#b91c1c', // Ruby tint
    hairStyle: 'golden-fade',
    chainColor: '#fbbf24',
    specialAura: 'rgba(244, 63, 94, 0.35)',
    perk: 'Magnetic Charm: Collects nearby Golden Notes automatically',
    perkType: 'magnet',
    unlockedByDefault: false,
    requiredVinyls: 6,
  },
  {
    id: 'ma-pariwo-noir',
    name: 'Ma Pariwo Noir',
    subtitle: 'Midnight Trench & Ruby Shades',
    description: 'A stylish long midnight trench coat with brooding crimson-tinted glasses for intense stealth.',
    inspiration: 'Inspired by the sultry midnight vibes of the "Ma Pariwo" visualizer',
    jacketColor: '#18181b', // Obsidian Black
    trimColor: '#dc2626',   // Deep Crimson
    pantsColor: '#09090b',
    glassesColor: '#ef4444', // Dark Red
    hairStyle: 'bleached-dreads',
    chainColor: '#e2e8f0',  // White gold
    specialAura: 'rgba(239, 68, 68, 0.4)',
    perk: 'Iron Will: +1.5s extended invulnerability upon taking damage',
    perkType: 'defense',
    unlockedByDefault: false,
    requiredVinyls: 10,
  },
  {
    id: 'afrobeats-king',
    name: 'Afrobeats King',
    subtitle: 'Royal Kente Bomber & Golden Aura',
    description: 'The crowning majestic outfit symbolizing Zinoleesky discovering his divine purpose in African music.',
    inspiration: 'The Grand Purpose Unlocked: Celebrating authentic African rhythm & royalty',
    jacketColor: '#d97706', // Royal Amber
    trimColor: '#15803d',   // Emerald Kente
    pantsColor: '#78350f',  // Rich bronze
    glassesColor: '#f59e0b', // Gold-rimmed shades
    hairStyle: 'royal-locks',
    chainColor: '#fef08a',  // Crown jewels
    specialAura: 'rgba(245, 158, 11, 0.55)',
    perk: 'Master of Rhythm: +50% wider Perfect Beat window & double beat jump height',
    perkType: 'rhythm',
    unlockedByDefault: false,
    requiredVinyls: 14,
  },
];
