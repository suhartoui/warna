/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HSL {
  h: number; // 0 - 360
  s: number; // 0 - 100
  l: number; // 0 - 100
}

export interface HSV {
  h: number; // 0 - 360
  s: number; // 0 - 100
  v: number; // 0 - 100
}

export interface RGB {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
  a?: number; // 0 - 1
}

export interface ColorData {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
  alpha: number;
  name: string;
}

// Convert HEX to RGB
export function hexToRgb(hex: string): RGB | null {
  const cleanHex = hex.replace(/^#/, '').trim();
  if (!/^[0-9A-Fa-f]{3,8}$/.test(cleanHex)) return null;

  let r = 0, g = 0, b = 0, a = 1;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else if (cleanHex.length === 8) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
    a = Math.round((parseInt(cleanHex.substring(6, 8), 16) / 255) * 100) / 100;
  } else {
    return null;
  }

  return { r, g, b, a };
}

// Convert RGB to HEX
export function rgbToHex(r: number, g: number, b: number, a?: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0').toUpperCase();
  };

  const baseHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a !== undefined && a < 1 && a >= 0) {
    const alphaHex = toHex(Math.round(a * 255));
    return `${baseHex}${alphaHex}`;
  }
  return baseHex;
}

// Convert RGB to HSV
export function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / diff) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / diff + 2);
    } else {
      h = 60 * ((r - g) / diff + 4);
    }
  }

  if (h < 0) h += 360;

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

// Convert HSV to RGB
export function hsvToRgb(h: number, s: number, v: number): RGB {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  v = Math.max(0, Math.min(100, v)) / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r1 = 0, g1 = 0, b1 = 0;

  if (h >= 0 && h < 60) {
    r1 = c; g1 = x; b1 = 0;
  } else if (h >= 60 && h < 120) {
    r1 = x; g1 = c; b1 = 0;
  } else if (h >= 120 && h < 180) {
    r1 = 0; g1 = c; b1 = x;
  } else if (h >= 180 && h < 240) {
    r1 = 0; g1 = x; b1 = c;
  } else if (h >= 240 && h < 300) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): RGB {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1 = 0, g1 = 0, b1 = 0;

  if (h >= 0 && h < 60) {
    r1 = c; g1 = x; b1 = 0;
  } else if (h >= 60 && h < 120) {
    r1 = x; g1 = c; b1 = 0;
  } else if (h >= 120 && h < 180) {
    r1 = 0; g1 = c; b1 = x;
  } else if (h >= 180 && h < 240) {
    r1 = 0; g1 = x; b1 = c;
  } else if (h >= 240 && h < 300) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
}

// Get Luminance for WCAG Contrast
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Get Contrast Ratio between two colors
export function getContrastRatio(rgb1: RGB, rgb2: RGB): number {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Best text color (black or white) for readability on background
export function getReadableTextColor(rgb: RGB): '#FFFFFF' | '#0F172A' {
  const whiteLum = getLuminance(255, 255, 255);
  const blackLum = getLuminance(15, 23, 42);
  const bgLum = getLuminance(rgb.r, rgb.g, rgb.b);

  const whiteContrast = (whiteLum + 0.05) / (bgLum + 0.05);
  const blackContrast = (bgLum + 0.05) / (blackLum + 0.05);

  return whiteContrast >= blackContrast ? '#FFFFFF' : '#0F172A';
}

// Generate Tints (Mix with White) and Shades (Mix with Black)
export function generateTintsAndShades(rgb: RGB): { tints: string[]; shades: string[] } {
  const tints: string[] = [];
  const shades: string[] = [];

  // 10 steps of tints (getting lighter to white)
  for (let i = 1; i <= 9; i++) {
    const factor = i / 10;
    const r = Math.round(rgb.r + (255 - rgb.r) * factor);
    const g = Math.round(rgb.g + (255 - rgb.g) * factor);
    const b = Math.round(rgb.b + (255 - rgb.b) * factor);
    tints.push(rgbToHex(r, g, b));
  }

  // 10 steps of shades (getting darker to black)
  for (let i = 1; i <= 9; i++) {
    const factor = 1 - i / 10;
    const r = Math.round(rgb.r * factor);
    const g = Math.round(rgb.g * factor);
    const b = Math.round(rgb.b * factor);
    shades.push(rgbToHex(r, g, b));
  }

  return { tints, shades };
}

// Generate Color Harmonies
export interface ColorHarmony {
  name: string;
  description: string;
  colors: string[];
}

export function generateHarmonies(hsv: HSV): ColorHarmony[] {
  const { h, s, v } = hsv;

  const makeHex = (hue: number, sat = s, val = v) => {
    const normalizedH = (hue % 360 + 360) % 360;
    const { r, g, b } = hsvToRgb(normalizedH, sat, val);
    return rgbToHex(r, g, b);
  };

  return [
    {
      name: 'Komplementer',
      description: 'Warna tepat berhadapan (180°) pada roda warna untuk kontras tinggi.',
      colors: [makeHex(h), makeHex(h + 180)],
    },
    {
      name: 'Analog',
      description: 'Warna berdampingan (±30°) yang menghasilkan nuansa harmonis alami.',
      colors: [makeHex(h - 30), makeHex(h), makeHex(h + 30)],
    },
    {
      name: 'Triadik',
      description: 'Tiga warna berjarak seimbang 120° menghasilkan palet cerah dan dinamis.',
      colors: [makeHex(h), makeHex(h + 120), makeHex(h + 240)],
    },
    {
      name: 'Split Komplementer',
      description: 'Kombinasi warna dasar dengan dua warna samping komplementernya.',
      colors: [makeHex(h), makeHex(h + 150), makeHex(h + 210)],
    },
    {
      name: 'Tetradik (Segiempat)',
      description: 'Dua pasang warna komplementer (berjarak 90°) untuk palet kaya variasi.',
      colors: [makeHex(h), makeHex(h + 90), makeHex(h + 180), makeHex(h + 270)],
    },
    {
      name: 'Monokromatik',
      description: 'Satu corak warna dengan variasi saturasi dan tingkat kecerahan.',
      colors: [
        makeHex(h, Math.max(15, s - 30), Math.min(100, v + 20)),
        makeHex(h, s, v),
        makeHex(h, Math.min(100, s + 15), Math.max(20, v - 25)),
      ],
    },
  ];
}

// Closest recognizable color name finder
const COLOR_NAMES: { name: string; hex: string }[] = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Snow', hex: '#FFFAFA' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Light Slate', hex: '#F1F5F9' },
  { name: 'Muted Silver', hex: '#E2E8F0' },
  { name: 'Cool Gray', hex: '#94A3B8' },
  { name: 'Slate Gray', hex: '#64748B' },
  { name: 'Deep Slate', hex: '#334155' },
  { name: 'Obsidian', hex: '#1E293B' },
  { name: 'Midnight', hex: '#0F172A' },
  { name: 'Pitch Black', hex: '#000000' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Ruby Flame', hex: '#EF4444' },
  { name: 'Rose Petal', hex: '#F43F5E' },
  { name: 'Electric Coral', hex: '#FB7185' },
  { name: 'Blush Pink', hex: '#EC4899' },
  { name: 'Fuchsia Glow', hex: '#D946EF' },
  { name: 'Royal Purple', hex: '#9333EA' },
  { name: 'Deep Violet', hex: '#7C3AED' },
  { name: 'Electric Indigo', hex: '#6366F1' },
  { name: 'Cobalt Blue', hex: '#2563EB' },
  { name: 'Ocean Azure', hex: '#0284C7' },
  { name: 'Sky Cyan', hex: '#0EA5E9' },
  { name: 'Vibrant Teal', hex: '#0D9488' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Forest Jade', hex: '#16A34A' },
  { name: 'Electric Lime', hex: '#84CC16' },
  { name: 'Citron Yellow', hex: '#EAB308' },
  { name: 'Golden Amber', hex: '#D97706' },
  { name: 'Tangerine Orange', hex: '#EA580C' },
  { name: 'Burnt Sienna', hex: '#C2410C' },
  { name: 'Warm Terracotta', hex: '#9A3412' },
  { name: 'Chestnut Bronze', hex: '#78350F' },
  { name: 'Desert Sand', hex: '#D4B996' },
  { name: 'Sage Green', hex: '#87A987' },
  { name: 'Lavender Mist', hex: '#C4B5FD' },
  { name: 'Mint Frost', hex: '#6EE7B7' },
];

export function getClosestColorName(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'Kustom';

  let minDistance = Infinity;
  let closestName = 'Kustom';

  for (const item of COLOR_NAMES) {
    const itemRgb = hexToRgb(item.hex);
    if (!itemRgb) continue;

    // Euclidean distance in RGB space
    const distance = Math.sqrt(
      Math.pow(rgb.r - itemRgb.r, 2) +
      Math.pow(rgb.g - itemRgb.g, 2) +
      Math.pow(rgb.b - itemRgb.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestName = item.name;
    }
  }

  return closestName;
}

// Curated Trending Palettes for Quick Pick
export interface PaletteTheme {
  title: string;
  category: string;
  colors: string[];
}

export const CURATED_PALETTES: PaletteTheme[] = [
  {
    title: 'Modern SaaS Slate',
    category: 'UI/UX',
    colors: ['#0F172A', '#334155', '#475569', '#6366F1', '#38BDF8', '#F8FAFC'],
  },
  {
    title: 'Emerald Horizon',
    category: 'Alam',
    colors: ['#064E3B', '#047857', '#10B981', '#34D399', '#A7F3D0', '#ECFDF5'],
  },
  {
    title: 'Sunset Neon',
    category: 'Kreatif',
    colors: ['#31103F', '#701A75', '#BE185D', '#E11D48', '#FB923C', '#FDE047'],
  },
  {
    title: 'Nordic Minimalist',
    category: 'Elegan',
    colors: ['#1C1917', '#44403C', '#78716C', '#A8A29E', '#E7E5E4', '#FAFAF9'],
  },
  {
    title: 'Cyberpunk Tokyo',
    category: 'Futuristik',
    colors: ['#090D16', '#2E1065', '#9333EA', '#06B6D4', '#22C55E', '#F43F5E'],
  },
  {
    title: 'Warm Terracotta',
    category: 'Earthy',
    colors: ['#451A03', '#78350F', '#B45309', '#D97706', '#F59E0B', '#FEF3C7'],
  },
  {
    title: 'Ocean Deep Blue',
    category: 'Korporat',
    colors: ['#0B192C', '#1E3E62', '#000000', '#0077B6', '#00B4D8', '#CAF0F8'],
  },
  {
    title: 'Soft Pastel Delight',
    category: 'Kreatif',
    colors: ['#FCE7F3', '#DDD6FE', '#BAE6FD', '#A7F3D0', '#FEF08A', '#FED7AA'],
  },
];
