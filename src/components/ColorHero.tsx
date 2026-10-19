/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Bookmark, BookmarkCheck, Volume2, VolumeX, Sparkles, Sliders } from 'lucide-react';
import { RGB, getReadableTextColor, getClosestColorName } from '../utils/colorUtils';

interface ColorHeroProps {
  hex: string;
  rgb: RGB;
  alpha: number;
  isSaved: boolean;
  onCopy: (text: string, label?: string) => void;
  onToggleSave: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export type HexFormat = 'standard' | 'lowercase' | 'no-hash' | 'rgb' | 'hsl' | 'css-var';

export const ColorHero: React.FC<ColorHeroProps> = ({
  hex,
  rgb,
  alpha,
  isSaved,
  onCopy,
  onToggleSave,
  soundEnabled,
  onToggleSound,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<HexFormat>('standard');

  const textColor = getReadableTextColor(rgb);
  const colorName = getClosestColorName(hex);

  // Formatted variations
  const cleanHex = hex.replace('#', '');
  const hexStandard = `#${cleanHex.toUpperCase()}`;
  const hexLowercase = `#${cleanHex.toLowerCase()}`;
  const hexNoHash = cleanHex.toUpperCase();
  const rgbString = alpha < 1 
    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
    : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const cssVarString = `--color-primary: ${hexStandard};`;

  const getCopyValue = (format: HexFormat): string => {
    switch (format) {
      case 'standard': return hexStandard;
      case 'lowercase': return hexLowercase;
      case 'no-hash': return hexNoHash;
      case 'rgb': return rgbString;
      case 'css-var': return cssVarString;
      default: return hexStandard;
    }
  };

  const handleHeroClick = () => {
    const val = getCopyValue(selectedFormat);
    onCopy(val, selectedFormat.toUpperCase());
    setCopiedFormat(selectedFormat);
    setTimeout(() => setCopiedFormat(null), 1800);
  };

  const handleSpecificCopy = (e: React.MouseEvent, text: string, formatId: string) => {
    e.stopPropagation();
    onCopy(text, formatId);
    setCopiedFormat(formatId);
    setTimeout(() => setCopiedFormat(null), 1800);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-5">
      {/* Top bar of Hero: Color Name, Audio Sound toggle, Bookmark */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Warna Aktif
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {colorName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                : 'text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Suara klik aktif (klik untuk matikan)' : 'Suara nonaktif (klik untuk aktifkan)'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={isSaved ? 'Hapus dari koleksi tersimpan' : 'Simpan warna ke favorit'}
          >
            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
          </button>
        </div>
      </div>

      {/* GIANT 1-CLICK COPY HERO DISPLAY */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleHeroClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeroClick();
          }
        }}
        className="group relative w-full h-44 sm:h-52 rounded-xl p-6 flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99] border border-black/10 focus-visible:ring-4 focus-visible:ring-indigo-500 focus-visible:outline-none"
        style={{ backgroundColor: hex }}
      >
        {/* Subtle background texture grid for opacity visibility */}
        {alpha < 1 && (
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(45deg,#E2E8F0_25%,transparent_25%),linear-gradient(-45deg,#E2E8F0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#E2E8F0_75%),linear-gradient(-45deg,transparent_75%,#E2E8F0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px]" />
        )}

        {/* Top Floating Prompt: "1-Klik Salin" */}
        <div className="flex items-center justify-between w-full">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-xs"
            style={{
              backgroundColor: textColor === '#FFFFFF' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.75)',
              color: textColor,
            }}
          >
            {copiedFormat ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span className="font-bold">Kode HEX Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 opacity-80" />
                <span>Klik di mana saja untuk salin HEX</span>
              </>
            )}
          </div>

          {/* Contrast badge */}
          <div
            className="px-2.5 py-1 rounded-md text-[11px] font-mono backdrop-blur-md"
            style={{
              backgroundColor: textColor === '#FFFFFF' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.75)',
              color: textColor,
            }}
          >
            Kontras: {textColor === '#FFFFFF' ? 'Teks Putih' : 'Teks Gelap'}
          </div>
        </div>

        {/* Center / Bottom: Prominent HEX Display */}
        <div className="flex items-end justify-between w-full pt-4">
          <div className="flex flex-col">
            <span
              className="text-xs font-medium tracking-wide uppercase opacity-85"
              style={{ color: textColor }}
            >
              Kode Warna Utama
            </span>
            <div className="flex items-center gap-3">
              <span
                className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono tabular-nums select-all drop-shadow-xs"
                style={{ color: textColor }}
              >
                {getCopyValue(selectedFormat)}
              </span>
            </div>
          </div>

          {/* Tactile Copy Button Inside Card */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md group-hover:scale-105 active:scale-95"
            style={{
              backgroundColor: textColor === '#FFFFFF' ? '#FFFFFF' : '#0F172A',
              color: textColor === '#FFFFFF' ? '#0F172A' : '#FFFFFF',
            }}
          >
            {copiedFormat ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin HEX</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Format Switcher & Quick Copy Chips */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium">Pilihan Format Salin Cepat:</span>
          <span className="text-[11px]">Klik salah satu untuk langsung menyalin</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Option 1: Standard #RRGGBB */}
          <button
            type="button"
            onClick={(e) => {
              setSelectedFormat('standard');
              handleSpecificCopy(e, hexStandard, 'hexStandard');
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all text-left cursor-pointer ${
              selectedFormat === 'standard'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-400'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div>
              <div className="text-[10px] text-slate-400 font-medium">HEX KAPITAL</div>
              <div className="font-mono font-bold">{hexStandard}</div>
            </div>
            {copiedFormat === 'hexStandard' ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400 shrink-0" />
            )}
          </button>

          {/* Option 2: Lowercase #rrggbb */}
          <button
            type="button"
            onClick={(e) => {
              setSelectedFormat('lowercase');
              handleSpecificCopy(e, hexLowercase, 'hexLowercase');
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all text-left cursor-pointer ${
              selectedFormat === 'lowercase'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-400'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div>
              <div className="text-[10px] text-slate-400 font-medium">HEX KECIL</div>
              <div className="font-mono font-bold">{hexLowercase}</div>
            </div>
            {copiedFormat === 'hexLowercase' ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400 shrink-0" />
            )}
          </button>

          {/* Option 3: Raw HEX (No Hash) */}
          <button
            type="button"
            onClick={(e) => {
              setSelectedFormat('no-hash');
              handleSpecificCopy(e, hexNoHash, 'hexNoHash');
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all text-left cursor-pointer ${
              selectedFormat === 'no-hash'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-400'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div>
              <div className="text-[10px] text-slate-400 font-medium">TANPA TAGAR</div>
              <div className="font-mono font-bold">{hexNoHash}</div>
            </div>
            {copiedFormat === 'hexNoHash' ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400 shrink-0" />
            )}
          </button>

          {/* Option 4: RGB String */}
          <button
            type="button"
            onClick={(e) => {
              setSelectedFormat('rgb');
              handleSpecificCopy(e, rgbString, 'rgbString');
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all text-left cursor-pointer ${
              selectedFormat === 'rgb'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-400'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="truncate pr-1">
              <div className="text-[10px] text-slate-400 font-medium">RGB CSS</div>
              <div className="font-mono font-bold truncate">{rgbString}</div>
            </div>
            {copiedFormat === 'rgbString' ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400 shrink-0" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
