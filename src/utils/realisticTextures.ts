import * as THREE from 'three';
import { DragonSkinStyle } from '../types';

/**
 * Generates photorealistic procedural PBR textures directly via HTML5 Canvas.
 * No heavy external image assets required — instant, lightweight, and responsive.
 */

// Helper to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

/**
 * Organic reptilian dragon scale bump & detail map
 */
export function createScaleTexture(primaryHex: string, secondaryHex: string, emissiveHex?: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const [pr, pg, pb] = hexToRgb(primaryHex);
  const [sr, sg, sb] = hexToRgb(secondaryHex);

  // Background deep tone
  ctx.fillStyle = `rgb(${Math.floor(pr * 0.6)}, ${Math.floor(pg * 0.6)}, ${Math.floor(pb * 0.6)})`;
  ctx.fillRect(0, 0, size, size);

  const scaleSize = 16;
  const cols = size / scaleSize;
  const rows = size / scaleSize;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const offsetX = (y % 2) * (scaleSize / 2);
      const cx = x * scaleSize + offsetX;
      const cy = y * scaleSize;

      // Radial gradient for each 3D rounded scale
      const grad = ctx.createRadialGradient(cx + 4, cy + 4, 1, cx + 8, cy + 8, scaleSize);
      grad.addColorStop(0, `rgb(${Math.min(255, sr + 40)}, ${Math.min(255, sg + 40)}, ${Math.min(255, sb + 40)})`);
      grad.addColorStop(0.4, `rgb(${sr}, ${sg}, ${sb})`);
      grad.addColorStop(0.85, `rgb(${pr}, ${pg}, ${pb})`);
      grad.addColorStop(1, `rgb(${Math.floor(pr * 0.35)}, ${Math.floor(pg * 0.35)}, ${Math.floor(pb * 0.35)})`);

      ctx.beginPath();
      ctx.ellipse(cx + scaleSize / 2, cy + scaleSize / 2, scaleSize * 0.48, scaleSize * 0.58, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Subtle bright specular edge on top of each scale
      ctx.strokeStyle = `rgba(255, 255, 255, 0.18)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Micro-grain noise overlay
  const imgData = ctx.getImageData(0, 0, size, size);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    d[i] = Math.max(0, Math.min(255, d[i] + noise));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + noise));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Organic grass texture with subtle blade tufts and soil speckles
 */
export function createGrassTexture(baseHex: string = '#2d5a27', deepHex: string = '#1b3b18'): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const [br, bg, bb] = hexToRgb(baseHex);
  const [dr, dg, db] = hexToRgb(deepHex);

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  // Mottled soil and humus patches
  for (let i = 0; i < 400; i++) {
    const px = Math.random() * size;
    const py = Math.random() * size;
    const rad = 4 + Math.random() * 28;
    const grad = ctx.createRadialGradient(px, py, 1, px, py, rad);
    grad.addColorStop(0, `rgba(${dr}, ${dg}, ${db}, 0.5)`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Micro grass blades strokes
  for (let i = 0; i < 6000; i++) {
    const bx = Math.random() * size;
    const by = Math.random() * size;
    const len = 3 + Math.random() * 6;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    const shade = Math.random() > 0.5 ? 25 : -20;

    ctx.strokeStyle = `rgb(${Math.max(0, Math.min(255, br + shade))}, ${Math.max(0, Math.min(255, bg + shade + 15))}, ${Math.max(0, Math.min(255, bb + shade))})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(angle) * len, by + Math.sin(angle) * len);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

/**
 * Realistic craggy weathered rock texture with fissures and mineral noise
 */
export function createStoneTexture(baseHex: string = '#2c2e38'): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const [br, bg, bb] = hexToRgb(baseHex);
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  // Large stone strata
  for (let i = 0; i < 50; i++) {
    const sy = Math.random() * size;
    ctx.fillStyle = `rgba(0, 0, 0, ${0.15 + Math.random() * 0.25})`;
    ctx.fillRect(0, sy, size, 8 + Math.random() * 20);
  }

  // Cracks and fissures
  ctx.strokeStyle = 'rgba(15, 15, 20, 0.6)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 25; i++) {
    let cx = Math.random() * size;
    let cy = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let s = 0; s < 6; s++) {
      cx += (Math.random() - 0.5) * 45;
      cy += (Math.random() - 0.5) * 45;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Mineral specks
  const imgData = ctx.getImageData(0, 0, size, size);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const grain = (Math.random() - 0.5) * 40;
    d[i] = Math.max(0, Math.min(255, d[i] + grain));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + grain));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

/**
 * Flagged cobblestone paving texture for walkways and the sanctuary
 */
export function createCobbleTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#1c1c24'; // mortar
  ctx.fillRect(0, 0, size, size);

  const stoneW = 40;
  const stoneH = 24;
  const cols = size / stoneW;
  const rows = size / stoneH;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (stoneW / 2);
    for (let c = -1; c < cols + 1; c++) {
      const x = c * stoneW + offset + 2;
      const y = r * stoneH + 2;
      const w = stoneW - 4;
      const h = stoneH - 4;

      const stoneVal = Math.floor(45 + Math.random() * 30);
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, `rgb(${stoneVal + 20}, ${stoneVal + 20}, ${stoneVal + 26})`);
      grad.addColorStop(1, `rgb(${stoneVal - 15}, ${stoneVal - 15}, ${stoneVal - 10})`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 3);
      ctx.fill();

      // Bevel highlight
      ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

/**
 * Animated water caustics and wave ripple texture
 */
export function createWaterTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#0369a1';
  ctx.fillRect(0, 0, size, size);

  // Soft caustics networks
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.45)';
  ctx.lineWidth = 3;
  ctx.filter = 'blur(3px)';

  for (let i = 0; i < 20; i++) {
    const cx = (i % 5) * 50 + 25;
    const cy = Math.floor(i / 5) * 50 + 25;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 22, 16, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.filter = 'none';

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Glowing volcanic magma with dark obsidian crust and incandescent veins
 */
export function createLavaTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Hot molten core
  const grad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 2);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.3, '#f97316');
  grad.addColorStop(0.7, '#ea580c');
  grad.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Obsidian crust islands
  ctx.fillStyle = '#1c110f';
  for (let i = 0; i < 36; i++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const rad = 10 + Math.random() * 22;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/**
 * Majestic atmospheric sky dome gradient texture with sun glow and horizon haze
 */
export function createAtmosphericSkyTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Vertical sky gradient from upper zenith (deep twilight celestial navy) down to golden-blue horizon
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0.0, '#080d1a'); // Deep cosmic zenith
  grad.addColorStop(0.3, '#10203a'); // Upper celestial navy
  grad.addColorStop(0.55, '#1e3a5f'); // Atmospheric sapphire
  grad.addColorStop(0.75, '#2a4d70'); // Soft twilight blue
  grad.addColorStop(0.88, '#4a4254'); // Horizon purple dusk
  grad.addColorStop(0.96, '#d97706'); // Warm sunlit haze
  grad.addColorStop(1.0, '#1c1917'); // Lower planetary boundary
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Radiant Golden Sun Disc & Atmospheric Halo
  const sunX = size * 0.72;
  const sunY = size * 0.42;

  // Wide corona
  const coronaGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 140);
  coronaGrad.addColorStop(0, 'rgba(255, 235, 190, 0.75)');
  coronaGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.35)');
  coronaGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.12)');
  coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
  ctx.fill();

  // Brilliant Sun core
  const coreGrad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 24);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.5, '#fef08a');
  coreGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 24, 0, Math.PI * 2);
  ctx.fill();

  // Crystal clear sky across the horizon without clouds ("tira as nuvens")
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Photorealistic organic dragon wing membrane texture with branching veins,
 * skin tension folds, and translucent gradient tones.
 */
export function createWingLeatherTexture(primaryHex: string, accentHex: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const [pr, pg, pb] = hexToRgb(primaryHex);
  const [ar, ag, ab] = hexToRgb(accentHex);

  // Deep leathery gradient base (denser near wing arm, translucent near trailing edge)
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, `rgb(${Math.floor(pr * 0.7)}, ${Math.floor(pg * 0.7)}, ${Math.floor(pb * 0.7)})`);
  grad.addColorStop(0.5, `rgb(${ar}, ${ag}, ${ab})`);
  grad.addColorStop(1, `rgb(${Math.floor(ar * 0.6 + 30)}, ${Math.floor(ag * 0.6 + 20)}, ${Math.floor(ab * 0.6 + 10)})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Branching vascular veins
  ctx.strokeStyle = `rgba(${Math.min(255, ar + 50)}, ${Math.max(0, ag - 20)}, ${Math.max(0, ab - 20)}, 0.45)`;
  ctx.lineWidth = 2.2;
  for (let v = 0; v < 14; v++) {
    let vx = (v / 14) * size * 0.8 + 20;
    let vy = 10;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    const branches = 6 + Math.floor(Math.random() * 4);
    for (let b = 0; b < branches; b++) {
      vx += (Math.random() - 0.4) * 50;
      vy += size / branches;
      ctx.lineTo(vx, vy);
    }
    ctx.stroke();
  }

  // Organic tension stress folds radiating from wing roots
  ctx.strokeStyle = `rgba(0, 0, 0, 0.22)`;
  ctx.lineWidth = 1.2;
  for (let f = 0; f < 30; f++) {
    const fx = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(fx, 0);
    ctx.quadraticCurveTo(fx + (Math.random() - 0.5) * 80, size * 0.5, fx + (Math.random() - 0.5) * 120, size);
    ctx.stroke();
  }

  // Micro-leather pore grain
  const imgData = ctx.getImageData(0, 0, size, size);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const grain = (Math.random() - 0.5) * 22;
    d[i] = Math.max(0, Math.min(255, d[i] + grain));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + grain));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Transverse armored underbelly scutes (alligator/dragon plastron)
 */
export function createUnderbellyTexture(accentHex: string, primaryHex: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const [ar, ag, ab] = hexToRgb(accentHex);
  const [pr, pg, pb] = hexToRgb(primaryHex);

  ctx.fillStyle = `rgb(${Math.floor(pr * 0.5)}, ${Math.floor(pg * 0.5)}, ${Math.floor(pb * 0.5)})`;
  ctx.fillRect(0, 0, size, size);

  const plateHeight = 24;
  const plates = size / plateHeight;

  for (let p = 0; p < plates; p++) {
    const py = p * plateHeight + 3;
    const ph = plateHeight - 6;

    // Transverse plate gradient (highlight on upper ridge, shadow in groove)
    const plateGrad = ctx.createLinearGradient(0, py, 0, py + ph);
    plateGrad.addColorStop(0, `rgb(${Math.min(255, ar + 45)}, ${Math.min(255, ag + 45)}, ${Math.min(255, ab + 45)})`);
    plateGrad.addColorStop(0.3, `rgb(${ar}, ${ag}, ${ab})`);
    plateGrad.addColorStop(0.9, `rgb(${Math.floor(ar * 0.7)}, ${Math.floor(ag * 0.7)}, ${Math.floor(ab * 0.7)})`);
    plateGrad.addColorStop(1, `rgb(${Math.floor(pr * 0.4)}, ${Math.floor(pg * 0.4)}, ${Math.floor(pb * 0.4)})`);

    ctx.fillStyle = plateGrad;
    ctx.fillRect(16, py, size - 32, ph);

    // Ridge bevel
    ctx.strokeStyle = `rgba(255, 255, 255, 0.28)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, py);
    ctx.lineTo(size - 16, py);
    ctx.stroke();

    // Center ventral groove dividing scutes left/right
    ctx.fillStyle = `rgba(0, 0, 0, 0.35)`;
    ctx.fillRect(size / 2 - 2, py, 4, ph);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2);
  return texture;
}

/**
 * Ancient weathered carved stone block texture with chisel lines, fissures, and moss stains
 */
export function createAncientRuinTexture(baseColorHex: string = '#3d3d46', mossColorHex: string = '#2a3b26'): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const [br, bg, bb] = hexToRgb(baseColorHex);
  const [mr, mg, mb] = hexToRgb(mossColorHex);

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, size, size);

  // Ashlar stone masonry coursing
  const blockH = 64;
  const blockW = 128;
  const rows = size / blockH;
  const cols = size / blockW;

  for (let r = 0; r < rows; r++) {
    const offsetX = (r % 2) * (blockW / 2);
    for (let c = -1; c < cols + 1; c++) {
      const bx = c * blockW + offsetX + 2;
      const by = r * blockH + 2;
      const bw = blockW - 4;
      const bh = blockH - 4;

      const delta = (Math.random() - 0.5) * 35;
      ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, br + delta))}, ${Math.max(0, Math.min(255, bg + delta))}, ${Math.max(0, Math.min(255, bb + delta))})`;
      ctx.fillRect(bx, by, bw, bh);

      // Chiseled border bevel
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      // Random ancient carved runic glyph on some blocks
      if (Math.random() > 0.45) {
        ctx.strokeStyle = 'rgba(20, 20, 26, 0.6)';
        ctx.lineWidth = 1.5;
        const gx = bx + bw / 2;
        const gy = by + bh / 2;
        ctx.beginPath();
        ctx.moveTo(gx - 10, gy - 8);
        ctx.lineTo(gx, gy + 10);
        ctx.lineTo(gx + 10, gy - 8);
        ctx.moveTo(gx - 8, gy);
        ctx.lineTo(gx + 8, gy);
        ctx.stroke();
      }
    }
  }

  // Weathering, fractures and cracks
  for (let i = 0; i < 20; i++) {
    let cx = Math.random() * size;
    let cy = Math.random() * size;
    ctx.strokeStyle = 'rgba(10, 10, 15, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let s = 0; s < 5; s++) {
      cx += (Math.random() - 0.5) * 30;
      cy += (Math.random() - 0.5) * 30;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Organic moss/lichen patches in crevices
  for (let m = 0; m < 60; m++) {
    const mx = Math.random() * size;
    const my = Math.random() * size;
    const mRad = 6 + Math.random() * 22;
    const mGrad = ctx.createRadialGradient(mx, my, 1, mx, my, mRad);
    mGrad.addColorStop(0, `rgba(${mr}, ${mg}, ${mb}, 0.65)`);
    mGrad.addColorStop(0.7, `rgba(${mr}, ${mg}, ${mb}, 0.25)`);
    mGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mGrad;
    ctx.beginPath();
    ctx.arc(mx, my, mRad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Photorealistic solar corona and lens flare sprite texture
 */
export function createSunFlareTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = size / 2;
  const cy = size / 2;

  // 1. Soft atmospheric bloom gradient
  const outerBloom = ctx.createRadialGradient(cx, cy, 10, cx, cy, size * 0.48);
  outerBloom.addColorStop(0, 'rgba(255, 250, 235, 1)');
  outerBloom.addColorStop(0.12, 'rgba(254, 215, 170, 0.85)');
  outerBloom.addColorStop(0.28, 'rgba(251, 146, 60, 0.45)');
  outerBloom.addColorStop(0.55, 'rgba(234, 88, 12, 0.15)');
  outerBloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = outerBloom;
  ctx.fillRect(0, 0, size, size);

  // 2. High-intensity inner solar core
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45);
  coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  coreGrad.addColorStop(0.5, 'rgba(255, 247, 237, 0.95)');
  coreGrad.addColorStop(1, 'rgba(254, 215, 170, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 45, 0, Math.PI * 2);
  ctx.fill();

  // 3. Diffraction solar rays
  const rays = 12;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI;
    const len = size * 0.46;
    const rayGrad = ctx.createLinearGradient(
      cx - Math.cos(angle) * len,
      cy - Math.sin(angle) * len,
      cx + Math.cos(angle) * len,
      cy + Math.sin(angle) * len
    );
    rayGrad.addColorStop(0, 'rgba(255, 237, 213, 0)');
    rayGrad.addColorStop(0.4, 'rgba(255, 247, 237, 0.35)');
    rayGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    rayGrad.addColorStop(0.6, 'rgba(255, 247, 237, 0.35)');
    rayGrad.addColorStop(1, 'rgba(255, 237, 213, 0)');

    ctx.strokeStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(angle) * len, cy - Math.sin(angle) * len);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

export interface RealisticDragonSkinPBR {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
}

/**
 * Computes a true tangent-space Normal Map from a heightfield canvas.
 * Applies a 4-tap gradient filter to generate per-pixel surface normals:
 * R = Nx * 0.5 + 0.5
 * G = Ny * 0.5 + 0.5
 * B = Nz * 0.5 + 0.5
 * Gives stunning 3D micro-depth and light reaction across every scale.
 */
export function createNormalMapFromCanvas(srcCanvas: HTMLCanvasElement, strength: number = 3.2): THREE.CanvasTexture {
  const width = srcCanvas.width;
  const height = srcCanvas.height;
  const srcCtx = srcCanvas.getContext('2d')!;
  const srcData = srcCtx.getImageData(0, 0, width, height).data;

  const normCan = document.createElement('canvas');
  normCan.width = width;
  normCan.height = height;
  const normCtx = normCan.getContext('2d')!;
  const normImg = normCtx.createImageData(width, height);
  const dst = normImg.data;

  const getH = (x: number, y: number): number => {
    const wx = (x + width) % width;
    const wy = (y + height) % height;
    return srcData[(wy * width + wx) * 4] / 255.0;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const left = getH(x - 1, y);
      const right = getH(x + 1, y);
      const top = getH(x, y - 1);
      const bottom = getH(x, y + 1);

      const dx = (right - left) * strength;
      const dy = (bottom - top) * strength;
      const dz = 1.0;

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = -dx / len;
      const ny = -dy / len;
      const nz = dz / len;

      const idx = (y * width + x) * 4;
      dst[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      dst[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      dst[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      dst[idx + 3] = 255;
    }
  }

  normCtx.putImageData(normImg, 0, 0);
  const normTex = new THREE.CanvasTexture(normCan);
  normTex.wrapS = THREE.RepeatWrapping;
  normTex.wrapT = THREE.RepeatWrapping;
  normTex.repeat.set(4, 4);
  return normTex;
}

/**
 * Creates high-fidelity, photorealistic PBR texture maps for dragons:
 * - Albedo color map with 3D scale relief, keratin shading and organic micro-texture
 * - Heightfield Bump map with deep crevices and sculpted scale crowns
 * - Specular Roughness map (glossy scale peaks, matte crevices)
 * - Emissive luminescence map for elemental veins, runes, circuits, or lava cracks
 */
export function createRealisticDragonSkinPBR(
  skinStyle: DragonSkinStyle = 'realistic-drake-scales',
  primaryHex: string,
  secondaryHex: string,
  emissiveHex: string
): RealisticDragonSkinPBR {
  const size = 512;

  // 1. Color Canvas
  const colCan = document.createElement('canvas');
  colCan.width = size;
  colCan.height = size;
  const colCtx = colCan.getContext('2d')!;

  // 2. Bump / Height Canvas
  const bumpCan = document.createElement('canvas');
  bumpCan.width = size;
  bumpCan.height = size;
  const bumpCtx = bumpCan.getContext('2d')!;

  // 3. Roughness Canvas
  const roughCan = document.createElement('canvas');
  roughCan.width = size;
  roughCan.height = size;
  const roughCtx = roughCan.getContext('2d')!;

  // 4. Emissive Canvas
  const emCan = document.createElement('canvas');
  emCan.width = size;
  emCan.height = size;
  const emCtx = emCan.getContext('2d')!;

  const [pr, pg, pb] = hexToRgb(primaryHex);
  const [sr, sg, sb] = hexToRgb(secondaryHex);
  const [er, eg, eb] = hexToRgb(emissiveHex);

  // Background deep tones
  colCtx.fillStyle = `rgb(${Math.floor(pr * 0.45)}, ${Math.floor(pg * 0.45)}, ${Math.floor(pb * 0.45)})`;
  colCtx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#181818'; // Low crevice elevation
  bumpCtx.fillRect(0, 0, size, size);

  roughCtx.fillStyle = '#d0d0d0'; // Rough crevice
  roughCtx.fillRect(0, 0, size, size);

  emCtx.fillStyle = '#000000';
  emCtx.fillRect(0, 0, size, size);

  // Style-specific scale rendering
  if (skinStyle === 'cyber-apex-nano-composite') {
    // Hexagonal Nano-Composite Carbon Armor with Illuminated Quantum Traces
    const hexRadius = 24;
    const hDist = hexRadius * 1.732;
    const vDist = hexRadius * 1.5;

    for (let row = -1; row < size / vDist + 2; row++) {
      const offsetX = (row % 2) * (hDist / 2);
      for (let col = -1; col < size / hDist + 2; col++) {
        const cx = col * hDist + offsetX;
        const cy = row * vDist;

        // Draw hexagon plate
        const drawHex = (ctx: CanvasRenderingContext2D, r: number) => {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hx = cx + r * Math.cos(angle);
            const hy = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
        };

        // Albedo: Brushed titanium-carbon weave
        const hexGrad = colCtx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, hexRadius);
        hexGrad.addColorStop(0, `rgb(${Math.min(255, pr + 45)}, ${Math.min(255, pg + 45)}, ${Math.min(255, pb + 55)})`);
        hexGrad.addColorStop(0.7, `rgb(${pr}, ${pg}, ${pb})`);
        hexGrad.addColorStop(1, `rgb(${Math.floor(pr * 0.3)}, ${Math.floor(pg * 0.3)}, ${Math.floor(pb * 0.3)})`);

        drawHex(colCtx, hexRadius - 2);
        colCtx.fillStyle = hexGrad;
        colCtx.fill();

        colCtx.strokeStyle = `rgba(0, 240, 255, 0.4)`;
        colCtx.lineWidth = 1;
        colCtx.stroke();

        // Bump
        drawHex(bumpCtx, hexRadius - 2);
        bumpCtx.fillStyle = '#e8e8e8';
        bumpCtx.fill();

        // Roughness: very glossy titanium
        drawHex(roughCtx, hexRadius - 2);
        roughCtx.fillStyle = '#3a3a3a';
        roughCtx.fill();

        // Emissive: glowing quantum nodes at vertices
        if ((row + col) % 3 === 0) {
          emCtx.beginPath();
          emCtx.arc(cx, cy, 3.5, 0, Math.PI * 2);
          emCtx.fillStyle = `rgb(${er}, ${eg}, ${eb})`;
          emCtx.fill();

          // Connective quantum bus line
          emCtx.strokeStyle = `rgba(${er}, ${eg}, ${eb}, 0.8)`;
          emCtx.lineWidth = 1.5;
          emCtx.beginPath();
          emCtx.moveTo(cx, cy);
          emCtx.lineTo(cx + hDist * 0.5, cy + vDist * 0.33);
          emCtx.stroke();
        }
      }
    }
  } else if (skinStyle === 'obsidian-crag-scales') {
    // Volcanic Basalt Plates with Active Magma Fissures
    const cols = 12;
    const rows = 12;
    const cellW = size / cols;
    const cellH = size / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * cellW + cellW * 0.5 + (Math.random() - 0.5) * 8;
        const cy = r * cellH + cellH * 0.5 + (Math.random() - 0.5) * 8;
        const rad = Math.min(cellW, cellH) * 0.44;

        // Draw irregular rock plate
        const rockGrad = colCtx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, rad);
        rockGrad.addColorStop(0, '#26201e');
        rockGrad.addColorStop(0.65, '#120d0b');
        rockGrad.addColorStop(1, '#080504');

        colCtx.beginPath();
        colCtx.arc(cx, cy, rad, 0, Math.PI * 2);
        colCtx.fillStyle = rockGrad;
        colCtx.fill();

        // Bump
        bumpCtx.beginPath();
        bumpCtx.arc(cx, cy, rad, 0, Math.PI * 2);
        bumpCtx.fillStyle = '#f0f0f0';
        bumpCtx.fill();

        // Roughness: matte rock
        roughCtx.beginPath();
        roughCtx.arc(cx, cy, rad, 0, Math.PI * 2);
        roughCtx.fillStyle = '#808080';
        roughCtx.fill();
      }
    }

    // Glowing Lava Fissures running through the cracks
    for (let f = 0; f < 22; f++) {
      let fx = Math.random() * size;
      let fy = Math.random() * size;
      const steps = 8;

      colCtx.strokeStyle = `rgb(${er}, ${eg}, ${eb})`;
      colCtx.lineWidth = 2.5;
      colCtx.beginPath();
      colCtx.moveTo(fx, fy);

      emCtx.strokeStyle = `rgb(${er}, ${eg}, ${eb})`;
      emCtx.lineWidth = 3.5;
      emCtx.beginPath();
      emCtx.moveTo(fx, fy);

      for (let s = 0; s < steps; s++) {
        fx += (Math.random() - 0.5) * 45;
        fy += (Math.random() - 0.5) * 45;
        colCtx.lineTo(fx, fy);
        emCtx.lineTo(fx, fy);
      }
      colCtx.stroke();
      emCtx.stroke();
    }
  } else if (skinStyle === 'glacial-frost-crystal') {
    // Razor-Sharp Crystalline Frost Facets with Diamond Glint
    const scaleSize = 22;
    const cols = size / scaleSize;
    const rows = size / scaleSize;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = x * scaleSize + (y % 2) * (scaleSize * 0.5);
        const cy = y * scaleSize;

        // Diamond rhombus crystal
        const drawDiamond = (ctx: CanvasRenderingContext2D, pad = 1) => {
          ctx.beginPath();
          ctx.moveTo(cx + scaleSize * 0.5, cy + pad);
          ctx.lineTo(cx + scaleSize - pad, cy + scaleSize * 0.5);
          ctx.lineTo(cx + scaleSize * 0.5, cy + scaleSize - pad);
          ctx.lineTo(cx + pad, cy + scaleSize * 0.5);
          ctx.closePath();
        };

        const iceGrad = colCtx.createRadialGradient(cx + scaleSize * 0.5 - 2, cy + scaleSize * 0.5 - 2, 1, cx + scaleSize * 0.5, cy + scaleSize * 0.5, scaleSize * 0.6);
        iceGrad.addColorStop(0, '#ffffff');
        iceGrad.addColorStop(0.3, `rgb(${sr}, ${sg}, ${sb})`);
        iceGrad.addColorStop(0.85, `rgb(${pr}, ${pg}, ${pb})`);
        iceGrad.addColorStop(1, '#061325');

        drawDiamond(colCtx);
        colCtx.fillStyle = iceGrad;
        colCtx.fill();

        colCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        colCtx.lineWidth = 1;
        colCtx.stroke();

        // Bump: pyramid facet
        drawDiamond(bumpCtx);
        bumpCtx.fillStyle = '#ffffff';
        bumpCtx.fill();

        // Roughness: hyper-glossy ice
        drawDiamond(roughCtx);
        roughCtx.fillStyle = '#222222';
        roughCtx.fill();

        // Ethereal ice core glow
        if ((x + y) % 4 === 0) {
          emCtx.beginPath();
          emCtx.arc(cx + scaleSize * 0.5, cy + scaleSize * 0.5, 3, 0, Math.PI * 2);
          emCtx.fillStyle = `rgb(${er}, ${eg}, ${eb})`;
          emCtx.fill();
        }
      }
    }
  } else if (skinStyle === 'ancient-runic-gold') {
    // Gilded Scales with Sacred Runic Etchings
    const scaleSize = 24;
    const cols = size / scaleSize;
    const rows = size / scaleSize;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = x * scaleSize + (y % 2) * (scaleSize * 0.5);
        const cy = y * scaleSize;

        // Shield scale
        const drawShield = (ctx: CanvasRenderingContext2D) => {
          ctx.beginPath();
          ctx.moveTo(cx + 2, cy + 4);
          ctx.lineTo(cx + scaleSize - 2, cy + 4);
          ctx.lineTo(cx + scaleSize - 2, cy + scaleSize * 0.6);
          ctx.lineTo(cx + scaleSize * 0.5, cy + scaleSize - 1);
          ctx.lineTo(cx + 2, cy + scaleSize * 0.6);
          ctx.closePath();
        };

        const goldGrad = colCtx.createRadialGradient(cx + 6, cy + 6, 2, cx + scaleSize * 0.5, cy + scaleSize * 0.5, scaleSize * 0.7);
        goldGrad.addColorStop(0, '#fef08a');
        goldGrad.addColorStop(0.4, '#eab308');
        goldGrad.addColorStop(0.8, '#a16207');
        goldGrad.addColorStop(1, '#451a03');

        drawShield(colCtx);
        colCtx.fillStyle = goldGrad;
        colCtx.fill();

        // Gold border bevel
        colCtx.strokeStyle = '#fef08a';
        colCtx.lineWidth = 1.2;
        colCtx.stroke();

        // Bump
        drawShield(bumpCtx);
        bumpCtx.fillStyle = '#f0f0f0';
        bumpCtx.fill();

        // Roughness: satin polished gold
        drawShield(roughCtx);
        roughCtx.fillStyle = '#484848';
        roughCtx.fill();

        // Ancient Titan Runic Inlays
        if ((x + y * 2) % 3 === 0) {
          emCtx.strokeStyle = `rgb(${er}, ${eg}, ${eb})`;
          emCtx.lineWidth = 1.6;
          emCtx.beginPath();
          emCtx.moveTo(cx + scaleSize * 0.5, cy + 8);
          emCtx.lineTo(cx + scaleSize * 0.5, cy + scaleSize - 6);
          emCtx.moveTo(cx + 6, cy + scaleSize * 0.5);
          emCtx.lineTo(cx + scaleSize - 6, cy + scaleSize * 0.5);
          emCtx.stroke();

          colCtx.strokeStyle = '#fffbeb';
          colCtx.lineWidth = 1;
          colCtx.stroke();
        }
      }
    }
  } else if (skinStyle === 'celestial-lightning-plasma') {
    // High-Voltage Cobalt Scales with Crackling Lightning Channels
    const scaleSize = 20;
    const cols = size / scaleSize;
    const rows = size / scaleSize;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = x * scaleSize + (y % 2) * (scaleSize * 0.5);
        const cy = y * scaleSize;

        const elGrad = colCtx.createRadialGradient(cx + 4, cy + 4, 1, cx + scaleSize * 0.5, cy + scaleSize * 0.5, scaleSize * 0.65);
        elGrad.addColorStop(0, '#67e8f9');
        elGrad.addColorStop(0.4, '#0284c7');
        elGrad.addColorStop(0.85, '#082f49');
        elGrad.addColorStop(1, '#020617');

        colCtx.beginPath();
        colCtx.ellipse(cx + scaleSize * 0.5, cy + scaleSize * 0.5, scaleSize * 0.46, scaleSize * 0.54, 0, 0, Math.PI * 2);
        colCtx.fillStyle = elGrad;
        colCtx.fill();

        bumpCtx.beginPath();
        bumpCtx.ellipse(cx + scaleSize * 0.5, cy + scaleSize * 0.5, scaleSize * 0.46, scaleSize * 0.54, 0, 0, Math.PI * 2);
        bumpCtx.fillStyle = '#ededed';
        bumpCtx.fill();

        roughCtx.beginPath();
        roughCtx.ellipse(cx + scaleSize * 0.5, cy + scaleSize * 0.5, scaleSize * 0.46, scaleSize * 0.54, 0, 0, Math.PI * 2);
        roughCtx.fillStyle = '#404040';
        roughCtx.fill();
      }
    }

    // Branching High-Voltage Lightning Bolts
    for (let l = 0; l < 18; l++) {
      let lx = Math.random() * size;
      let ly = Math.random() * size;

      emCtx.strokeStyle = '#ffffff';
      emCtx.lineWidth = 2.2;
      emCtx.beginPath();
      emCtx.moveTo(lx, ly);

      colCtx.strokeStyle = '#00f0ff';
      colCtx.lineWidth = 2.2;
      colCtx.beginPath();
      colCtx.moveTo(lx, ly);

      for (let b = 0; b < 6; b++) {
        lx += (Math.random() - 0.5) * 50;
        ly += (Math.random() - 0.5) * 50;
        emCtx.lineTo(lx, ly);
        colCtx.lineTo(lx, ly);
      }
      emCtx.stroke();
      colCtx.stroke();
    }
  } else if (skinStyle === 'abyssal-leviathan-bioluminescent') {
    // Hydrodynamic Abyssal Scales with Bioluminescent Photophores
    const scaleSize = 18;
    const cols = size / scaleSize;
    const rows = size / scaleSize;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = x * scaleSize + (y % 2) * (scaleSize * 0.5);
        const cy = y * scaleSize;

        const seaGrad = colCtx.createRadialGradient(cx + 4, cy + 4, 1, cx + scaleSize * 0.5, cy + scaleSize * 0.5, scaleSize * 0.6);
        seaGrad.addColorStop(0, '#5eead4');
        seaGrad.addColorStop(0.35, '#0d9488');
        seaGrad.addColorStop(0.8, '#042f2e');
        seaGrad.addColorStop(1, '#021312');

        colCtx.beginPath();
        colCtx.ellipse(cx + scaleSize * 0.5, cy + scaleSize * 0.5, scaleSize * 0.48, scaleSize * 0.56, 0, 0, Math.PI * 2);
        colCtx.fillStyle = seaGrad;
        colCtx.fill();

        bumpCtx.beginPath();
        bumpCtx.ellipse(cx + scaleSize * 0.5, cy + scaleSize * 0.5, scaleSize * 0.48, scaleSize * 0.56, 0, 0, Math.PI * 2);
        bumpCtx.fillStyle = '#e0e0e0';
        bumpCtx.fill();

        // Aquatic wet shine
        roughCtx.beginPath();
        roughCtx.ellipse(cx + scaleSize * 0.5, cy + scaleSize * 0.5, scaleSize * 0.48, scaleSize * 0.56, 0, 0, Math.PI * 2);
        roughCtx.fillStyle = '#2a2a2a';
        roughCtx.fill();

        // Glowing bioluminescent photophores
        if ((x * 3 + y) % 5 === 0) {
          emCtx.beginPath();
          emCtx.arc(cx + scaleSize * 0.5, cy + scaleSize * 0.5, 3.2, 0, Math.PI * 2);
          emCtx.fillStyle = `rgb(${er}, ${eg}, ${eb})`;
          emCtx.fill();

          colCtx.beginPath();
          colCtx.arc(cx + scaleSize * 0.5, cy + scaleSize * 0.5, 3.2, 0, Math.PI * 2);
          colCtx.fillStyle = '#67e8f9';
          colCtx.fill();
        }
      }
    }
  } else {
    // Hyper-Realistic Drake Scales (Sculpted Multi-Faceted Keratin Scutes with Keel & Striations)
    const scaleSize = 22;
    const cols = Math.ceil(size / scaleSize);
    const rows = Math.ceil(size / scaleSize);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = x * scaleSize + (y % 2) * (scaleSize * 0.5);
        const cy = y * scaleSize;
        const w = scaleSize * 0.52;
        const h = scaleSize * 0.65;

        // 1. Deep Interstitial Shadow / Ambient Occlusion moat around scale
        colCtx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        colCtx.beginPath();
        colCtx.ellipse(cx + scaleSize * 0.5, cy + scaleSize * 0.5 + 1, w + 2.5, h + 2.5, 0, 0, Math.PI * 2);
        colCtx.fill();

        // 2. Sculpted Multi-Tiered Keratin Plate
        const scaleGrad = colCtx.createRadialGradient(
          cx + scaleSize * 0.38,
          cy + scaleSize * 0.3,
          1,
          cx + scaleSize * 0.5,
          cy + scaleSize * 0.5,
          scaleSize * 0.75
        );
        scaleGrad.addColorStop(0, `rgb(${Math.min(255, sr + 55)}, ${Math.min(255, sg + 55)}, ${Math.min(255, sb + 55)})`);
        scaleGrad.addColorStop(0.28, `rgb(${sr}, ${sg}, ${sb})`);
        scaleGrad.addColorStop(0.7, `rgb(${pr}, ${pg}, ${pb})`);
        scaleGrad.addColorStop(1, `rgb(${Math.floor(pr * 0.22)}, ${Math.floor(pg * 0.22)}, ${Math.floor(pb * 0.22)})`);

        colCtx.beginPath();
        colCtx.ellipse(cx + scaleSize * 0.5, cy + scaleSize * 0.5, w, h, 0, 0, Math.PI * 2);
        colCtx.fillStyle = scaleGrad;
        colCtx.fill();

        // 3. Specular Keratin Rim Highlights (upper and lateral edges catching sun)
        colCtx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
        colCtx.lineWidth = 1.2;
        colCtx.beginPath();
        colCtx.arc(cx + scaleSize * 0.5, cy + scaleSize * 0.5, w * 0.9, -Math.PI * 0.9, -Math.PI * 0.1);
        colCtx.stroke();

        // 4. Longitudinal Keratin Growth Striations across the scale face
        for (let s = -2; s <= 2; s++) {
          if (s === 0) continue;
          colCtx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
          colCtx.lineWidth = 0.8;
          colCtx.beginPath();
          colCtx.moveTo(cx + scaleSize * 0.5 + s * 3.5, cy + 4);
          colCtx.lineTo(cx + scaleSize * 0.5 + s * 2, cy + scaleSize - 4);
          colCtx.stroke();
        }

        // 5. Prominent Razor-sharp Dorsal Keel Ridge
        colCtx.strokeStyle = `rgb(${Math.min(255, sr + 70)}, ${Math.min(255, sg + 70)}, ${Math.min(255, sb + 70)})`;
        colCtx.lineWidth = 1.5;
        colCtx.beginPath();
        colCtx.moveTo(cx + scaleSize * 0.5, cy + 2);
        colCtx.lineTo(cx + scaleSize * 0.5, cy + scaleSize - 2);
        colCtx.stroke();

        // 6. Heightfield Bump Map: high domed center with elevated keel line
        const bumpGrad = bumpCtx.createRadialGradient(
          cx + scaleSize * 0.5,
          cy + scaleSize * 0.45,
          1,
          cx + scaleSize * 0.5,
          cy + scaleSize * 0.5,
          w
        );
        bumpGrad.addColorStop(0, '#ffffff');
        bumpGrad.addColorStop(0.7, '#a0a0a0');
        bumpGrad.addColorStop(1, '#101010');

        bumpCtx.beginPath();
        bumpCtx.ellipse(cx + scaleSize * 0.5, cy + scaleSize * 0.5, w, h, 0, 0, Math.PI * 2);
        bumpCtx.fillStyle = bumpGrad;
        bumpCtx.fill();

        // Elevated Keel ridge line on bump map
        bumpCtx.strokeStyle = '#ffffff';
        bumpCtx.lineWidth = 2.4;
        bumpCtx.beginPath();
        bumpCtx.moveTo(cx + scaleSize * 0.5, cy + 2);
        bumpCtx.lineTo(cx + scaleSize * 0.5, cy + scaleSize - 2);
        bumpCtx.stroke();

        // 7. PBR Roughness Map: Scale apex is glossy & specular (#202020), crevices are rough (#d0d0d0)
        roughCtx.beginPath();
        roughCtx.ellipse(cx + scaleSize * 0.5, cy + scaleSize * 0.5, w, h, 0, 0, Math.PI * 2);
        roughCtx.fillStyle = '#262626';
        roughCtx.fill();

        // 8. Sub-dermal Elemental Energy Pulse
        if (emissiveHex && (x + y) % 5 === 0) {
          emCtx.beginPath();
          emCtx.arc(cx + scaleSize * 0.5, cy + scaleSize * 0.5, 3.2, 0, Math.PI * 2);
          emCtx.fillStyle = `rgb(${er}, ${eg}, ${eb})`;
          emCtx.fill();

          // Connective micro-vein
          emCtx.strokeStyle = `rgba(${er}, ${eg}, ${eb}, 0.7)`;
          emCtx.lineWidth = 1.2;
          emCtx.beginPath();
          emCtx.moveTo(cx + scaleSize * 0.5, cy + scaleSize * 0.5);
          emCtx.lineTo(cx + scaleSize, cy + scaleSize * 0.8);
          emCtx.stroke();
        }
      }
    }
  }

  // Organic micro-pore noise pass
  const imgData = colCtx.getImageData(0, 0, size, size);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    d[i] = Math.max(0, Math.min(255, d[i] + noise));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + noise));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + noise));
  }
  colCtx.putImageData(imgData, 0, 0);

  const map = new THREE.CanvasTexture(colCan);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 4);

  const bumpMap = new THREE.CanvasTexture(bumpCan);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(4, 4);

  // High-fidelity tangent-space normal map computed from procedural heightfield
  const normalMap = createNormalMapFromCanvas(bumpCan, 3.2);

  const roughnessMap = new THREE.CanvasTexture(roughCan);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 4);

  const emissiveMap = new THREE.CanvasTexture(emCan);
  emissiveMap.wrapS = THREE.RepeatWrapping;
  emissiveMap.wrapT = THREE.RepeatWrapping;
  emissiveMap.repeat.set(4, 4);

  return { map, bumpMap, normalMap, roughnessMap, emissiveMap };
}

/**
 * Photorealistic organic wing membrane texture with branching capillary veins,
 * skin tension folds, and element-tailored translucent patterns.
 */
export function createRealisticWingMembraneTexture(
  skinStyle: DragonSkinStyle = 'realistic-drake-scales',
  primaryHex: string,
  accentHex: string,
  emissiveHex?: string
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const [pr, pg, pb] = hexToRgb(primaryHex);
  const [ar, ag, ab] = hexToRgb(accentHex);
  const [er, eg, eb] = emissiveHex ? hexToRgb(emissiveHex) : [ar, ag, ab];

  // Base translucent gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, `rgb(${Math.floor(pr * 0.7)}, ${Math.floor(pg * 0.7)}, ${Math.floor(pb * 0.7)})`);
  grad.addColorStop(0.5, `rgb(${ar}, ${ag}, ${ab})`);
  grad.addColorStop(1, `rgb(${Math.floor(ar * 0.5 + 20)}, ${Math.floor(ag * 0.5 + 20)}, ${Math.floor(ab * 0.5 + 20)})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // High-density vascular capillary network
  ctx.strokeStyle = `rgba(${Math.min(255, ar + 60)}, ${Math.max(0, ag - 15)}, ${Math.max(0, ab - 15)}, 0.55)`;
  ctx.lineWidth = 2.4;
  for (let v = 0; v < 18; v++) {
    let vx = (v / 18) * size * 0.85 + 25;
    let vy = 15;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    const branches = 7 + Math.floor(Math.random() * 4);
    for (let b = 0; b < branches; b++) {
      vx += (Math.random() - 0.4) * 45;
      vy += size / branches;
      ctx.lineTo(vx, vy);

      // Micro capillary offshoots
      if (Math.random() > 0.4) {
        ctx.stroke();
        ctx.save();
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = `rgba(${er}, ${eg}, ${eb}, 0.35)`;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(vx + (Math.random() - 0.5) * 35, vy + 20);
        ctx.stroke();
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(vx, vy);
      }
    }
    ctx.stroke();
  }

  // Tension folds radiating from finger roots
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.lineWidth = 1.4;
  for (let f = 0; f < 35; f++) {
    const fx = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(fx, 0);
    ctx.quadraticCurveTo(fx + (Math.random() - 0.5) * 90, size * 0.5, fx + (Math.random() - 0.5) * 140, size);
    ctx.stroke();
  }

  // Style-specific membrane overlays
  if (skinStyle === 'cyber-apex-nano-composite') {
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let g = 0; g < size; g += 32) {
      ctx.beginPath();
      ctx.moveTo(g, 0);
      ctx.lineTo(g, size);
      ctx.moveTo(0, g);
      ctx.lineTo(size, g);
      ctx.stroke();
    }
  } else if (skinStyle === 'celestial-lightning-plasma') {
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      let lx = Math.random() * size;
      let ly = 0;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      for (let s = 0; s < 5; s++) {
        lx += (Math.random() - 0.5) * 60;
        ly += size / 5;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Photorealistic Gastrosteges (Alligator / Drake ventral underbelly scutes)
 */
export function createRealisticGastrostegesTexture(
  skinStyle: DragonSkinStyle = 'realistic-drake-scales',
  accentHex: string,
  primaryHex: string
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const [ar, ag, ab] = hexToRgb(accentHex);
  const [pr, pg, pb] = hexToRgb(primaryHex);

  ctx.fillStyle = `rgb(${Math.floor(pr * 0.4)}, ${Math.floor(pg * 0.4)}, ${Math.floor(pb * 0.4)})`;
  ctx.fillRect(0, 0, size, size);

  const plateHeight = 22;
  const plates = size / plateHeight;

  for (let p = 0; p < plates; p++) {
    const py = p * plateHeight + 2;
    const ph = plateHeight - 5;

    const plateGrad = ctx.createLinearGradient(0, py, 0, py + ph);
    plateGrad.addColorStop(0, `rgb(${Math.min(255, ar + 50)}, ${Math.min(255, ag + 50)}, ${Math.min(255, ab + 50)})`);
    plateGrad.addColorStop(0.3, `rgb(${ar}, ${ag}, ${ab})`);
    plateGrad.addColorStop(0.85, `rgb(${Math.floor(ar * 0.65)}, ${Math.floor(ag * 0.65)}, ${Math.floor(ab * 0.65)})`);
    plateGrad.addColorStop(1, `rgb(${Math.floor(pr * 0.3)}, ${Math.floor(pg * 0.3)}, ${Math.floor(pb * 0.3)})`);

    ctx.fillStyle = plateGrad;
    ctx.fillRect(12, py, size - 24, ph);

    // Bevel highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, py);
    ctx.lineTo(size - 12, py);
    ctx.stroke();

    // Ventral centerline groove
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(size / 2 - 2, py, 4, ph);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2);
  return texture;
}

/**
 * Keratin horn texture with annular growth rings and longitudinal grooves
 */
export function createRealisticHornTexture(baseHex = '#18141a', accentHex = '#4a4252'): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const [br, bg, bb] = hexToRgb(baseHex);
  const [ar, ag, ab] = hexToRgb(accentHex);

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  // Annular growth rings (horizontal bands)
  for (let y = 0; y < size; y += 12) {
    const ringGrad = ctx.createLinearGradient(0, y, 0, y + 10);
    ringGrad.addColorStop(0, `rgba(${ar}, ${ag}, ${ab}, 0.6)`);
    ringGrad.addColorStop(0.5, `rgba(${br}, ${bg}, ${bb}, 0.8)`);
    ringGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = ringGrad;
    ctx.fillRect(0, y, size, 10);
  }

  // Longitudinal fibrous grooves
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x < size; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 8, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  return texture;
}

/**
 * Photorealistic Dragon Eye Texture with Vertical Slit Pupil and Striated Iris
 */
export function createRealisticEyeTexture(irisHex: string, glowHex: string, isCyber = false): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.48;

  const [ir, ig, ib] = hexToRgb(irisHex);
  const [gr, gg, gb] = hexToRgb(glowHex);

  // Dark Sclera / Outer Ring
  ctx.fillStyle = '#0a0a0f';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Limbal Ring (dark iris border)
  ctx.strokeStyle = `rgba(${Math.floor(ir * 0.4)}, ${Math.floor(ig * 0.4)}, ${Math.floor(ib * 0.4)}, 0.9)`;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Radial Iris Gradient
  const irisGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 0.9);
  irisGrad.addColorStop(0, `rgb(${Math.min(255, gr + 60)}, ${Math.min(255, gg + 60)}, ${Math.min(255, gb + 60)})`);
  irisGrad.addColorStop(0.5, `rgb(${ir}, ${ig}, ${ib})`);
  irisGrad.addColorStop(0.9, `rgb(${Math.floor(ir * 0.5)}, ${Math.floor(ig * 0.5)}, ${Math.floor(ib * 0.5)})`);
  irisGrad.addColorStop(1, '#050508');

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.9, 0, Math.PI * 2);
  ctx.fillStyle = irisGrad;
  ctx.fill();

  // Radial Iris Fibrils (striated muscles)
  const fibrils = isCyber ? 36 : 72;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < fibrils; i++) {
    const angle = (i / fibrils) * Math.PI * 2;
    const len = radius * (0.4 + Math.random() * 0.45);
    ctx.strokeStyle = i % 2 === 0 ? `rgba(${gr}, ${gg}, ${gb}, 0.65)` : 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 12, cy + Math.sin(angle) * 12);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Vertical Predatory Slit Pupil
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(cx, cy, isCyber ? 10 : 8, radius * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  // Specular Corneal Light Reflection
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(cx - radius * 0.28, cy - radius * 0.28, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(cx - radius * 0.18, cy - radius * 0.4, radius * 0.06, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}
