import { Outfit } from '../types/game';

export interface PlayerRenderState {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  isSliding: boolean;
  facing: 'left' | 'right';
  animTimer: number;
  isHurt: boolean;
  invulnerableTimer: number;
  isAttacking: boolean;
  attackTimer: number;
  outfit: Outfit;
  rhythmCombo: number;
}

export function drawZinoleesky(ctx: CanvasRenderingContext2D, p: PlayerRenderState) {
  ctx.save();

  // Invulnerability flicker
  if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer * 20) % 2 === 0) {
    ctx.globalAlpha = 0.35;
  }

  // Position at feet center
  const centerX = p.x + p.width / 2;
  const bottomY = p.y + p.height;

  ctx.translate(centerX, bottomY);
  if (p.facing === 'left') {
    ctx.scale(-1, 1);
  }

  const { outfit } = p;
  const isRunning = Math.abs(p.vx) > 0.4 && p.isGrounded && !p.isSliding;
  const runPhase = p.animTimer * 12;

  // Outfit special aura glow
  if (outfit.specialAura) {
    ctx.save();
    ctx.fillStyle = outfit.specialAura;
    ctx.beginPath();
    ctx.ellipse(0, -32, 28, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Rhythm beat aura when combo is high
  if (p.rhythmCombo >= 4) {
    ctx.save();
    const auraPulse = Math.sin(p.animTimer * 10) * 4;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(0, -32, 26 + auraPulse, 36 + auraPulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (p.isSliding) {
    // ---- SLIDING POSE ----
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, -2, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs stretched forward
    ctx.fillStyle = outfit.pantsColor;
    ctx.fillRect(-10, -14, 30, 8);
    // Shoes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(16, -14, 10, 8);

    // Torso leaned back
    ctx.fillStyle = outfit.jacketColor;
    ctx.fillRect(-22, -22, 24, 14);

    // Head
    drawHead(ctx, -20, -30, outfit, p);

    // Arm forward
    ctx.fillStyle = outfit.trimColor;
    ctx.fillRect(-6, -18, 16, 6);
  } else {
    // ---- STANDING / RUNNING / JUMPING POSE ----
    // Ground shadow
    if (p.isGrounded) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, -1, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const bobY = isRunning ? Math.sin(runPhase) * 2.5 : Math.sin(p.animTimer * 2.5) * 1.2;

    // Legs
    const legAngle1 = isRunning ? Math.sin(runPhase) * 0.55 : 0;
    const legAngle2 = isRunning ? Math.sin(runPhase + Math.PI) * 0.55 : 0;

    // Back leg
    ctx.save();
    ctx.translate(isRunning ? -4 : -5, -24 + bobY);
    ctx.rotate(p.isGrounded ? legAngle2 : 0.3);
    ctx.fillStyle = outfit.pantsColor;
    ctx.fillRect(-4, 0, 8, 20);
    // Shoe
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-4, 17, 12, 7);
    ctx.restore();

    // Front leg
    ctx.save();
    ctx.translate(isRunning ? 4 : 5, -24 + bobY);
    ctx.rotate(p.isGrounded ? legAngle1 : -0.2);
    ctx.fillStyle = outfit.pantsColor;
    ctx.fillRect(-4, 0, 8, 20);
    // Shoe
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-3, 17, 13, 7);
    ctx.restore();

    // Torso (Designer Jacket / Shirt)
    ctx.fillStyle = outfit.jacketColor;
    ctx.beginPath();
    // Stylish jacket with curved shoulders
    ctx.roundRect(-12, -45 + bobY, 24, 24, [4, 4, 2, 2]);
    ctx.fill();

    // Jacket Zipper / Trim
    ctx.strokeStyle = outfit.trimColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -45 + bobY);
    ctx.lineTo(0, -21 + bobY);
    ctx.stroke();

    // Gold / Platinum Cuban Chain
    ctx.strokeStyle = outfit.chainColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -42 + bobY, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Sparkling medallion
    ctx.fillStyle = outfit.chainColor;
    ctx.beginPath();
    ctx.arc(0, -35 + bobY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    const armAngle = isRunning ? Math.sin(runPhase + Math.PI) * 0.6 : (p.isAttacking ? -0.8 : 0.1);
    ctx.save();
    ctx.translate(0, -42 + bobY);
    ctx.rotate(armAngle);
    ctx.fillStyle = outfit.jacketColor;
    ctx.fillRect(-3, 0, 7, 18);
    // Hand
    ctx.fillStyle = '#78350f'; // Warm skin tone
    ctx.fillRect(-2, 17, 5, 5);

    // If attacking, glowing musical note in hand
    if (p.isAttacking) {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(1, 23, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Head and Hair
    drawHead(ctx, 0, -48 + bobY, outfit, p);
  }

  ctx.restore();
}

function drawHead(ctx: CanvasRenderingContext2D, x: number, y: number, outfit: Outfit, p: PlayerRenderState) {
  ctx.save();
  ctx.translate(x, y);

  // Head base (Warm skin tone)
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.ellipse(0, -7, 10, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Signature Hair Style
  if (outfit.hairStyle === 'bleached-dreads') {
    // Dark roots with bleached tips
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-10, -18, 20, 8);
    // Bleached blonde locs falling to the side & back
    ctx.fillStyle = '#fde047';
    // Individual loc strands
    [-9, -5, -1, 3, 7].forEach((hx, i) => {
      ctx.fillRect(hx, -20 - (i % 2) * 2, 3.5, 9);
    });
    // Swaying back dreadlocks
    ctx.fillRect(-12, -14, 4, 10);
    ctx.fillRect(-14, -10, 3.5, 8);
  } else if (outfit.hairStyle === 'cyber-buzz') {
    // Frosted silver buzzcut with glowing neon side fade
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(0, -14, 11, 7, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (outfit.hairStyle === 'golden-fade') {
    // Retro fedora or golden wave fade
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(0, -14, 11, 6, 0, Math.PI, 0);
    ctx.fill();
    // Vintage Fedora brim
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-13, -15, 26, 4);
    ctx.fillRect(-9, -23, 18, 9);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-9, -17, 18, 3);
  } else if (outfit.hairStyle === 'royal-locks') {
    // Regal dreadlocks with golden crown band
    ctx.fillStyle = '#1c1917';
    [-10, -6, -2, 2, 6, 9].forEach((hx, i) => {
      ctx.fillStyle = i % 2 === 0 ? '#f59e0b' : '#1c1917';
      ctx.fillRect(hx, -22, 3.5, 12);
    });
    // Gold crown band
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-11, -16, 22, 3.5);
  }

  // Signature Designer Sunglasses
  ctx.fillStyle = outfit.glassesColor;
  ctx.beginPath();
  // Sleek rectangular frame
  ctx.roundRect(-8, -9, 17, 6.5, 2);
  ctx.fill();

  // Sunglasses reflection highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, -8);
  ctx.lineTo(-2, -4);
  ctx.moveTo(3, -8);
  ctx.lineTo(6, -4);
  ctx.stroke();

  // Earring bling
  ctx.fillStyle = outfit.chainColor;
  ctx.beginPath();
  ctx.arc(-9, -4, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
