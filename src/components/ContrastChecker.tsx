/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { RGB, getContrastRatio, getReadableTextColor } from '../utils/colorUtils';

interface ContrastCheckerProps {
  currentHex: string;
  rgb: RGB;
  onCopy: (text: string, label?: string) => void;
}

export const ContrastChecker: React.FC<ContrastCheckerProps> = ({ currentHex, rgb, onCopy }) => {
  const whiteRgb: RGB = { r: 255, g: 255, b: 255 };
  const darkRgb: RGB = { r: 15, g: 23, b: 42 };

  const contrastWhite = Math.round(getContrastRatio(rgb, whiteRgb) * 100) / 100;
  const contrastDark = Math.round(getContrastRatio(rgb, darkRgb) * 100) / 100;

  const getScoreBadge = (ratio: number, target: number) => {
    if (ratio >= target) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" /> Lolos
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 dark:text-rose-400">
        <XCircle className="w-3.5 h-3.5" /> Gagal
      </span>
    );
  };

  const bestTextColor = getReadableTextColor(rgb);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Aksesibilitas &amp; Uji Kontras (WCAG 2.1)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Pastikan rasio kontras teks terhadap latar belakang memenuhi standar keterbacaan internasional.
        </p>
      </div>

      {/* 2 Contrast Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kontras terhadap Teks Putih */}
        <div
          className="p-5 rounded-xl border border-black/10 flex flex-col justify-between gap-4 transition-all"
          style={{ backgroundColor: currentHex }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">
                Latar Warna + Teks Putih
              </span>
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
                {contrastWhite}:1
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
              {contrastWhite >= 7.0 ? 'AAA Unggul' : contrastWhite >= 4.5 ? 'AA Standar' : 'Kontras Rendah'}
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-xs rounded-lg p-3 text-white text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span>Teks Normal (&lt; 18px):</span>
              {getScoreBadge(contrastWhite, 4.5)}
            </div>
            <div className="flex items-center justify-between">
              <span>Teks Besar / Heading (&ge; 18px):</span>
              {getScoreBadge(contrastWhite, 3.0)}
            </div>
            <div className="flex items-center justify-between">
              <span>Teks Normal Level AAA (&ge; 7:1):</span>
              {getScoreBadge(contrastWhite, 7.0)}
            </div>
          </div>
        </div>

        {/* Kontras terhadap Teks Gelap (Dark Slate) */}
        <div
          className="p-5 rounded-xl border border-black/10 flex flex-col justify-between gap-4 transition-all"
          style={{ backgroundColor: currentHex }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-900/80 uppercase tracking-wider">
                Latar Warna + Teks Gelap
              </span>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
                {contrastDark}:1
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-md text-xs font-semibold bg-black/10 text-slate-900 backdrop-blur-xs">
              {contrastDark >= 7.0 ? 'AAA Unggul' : contrastDark >= 4.5 ? 'AA Standar' : 'Kontras Rendah'}
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-xs rounded-lg p-3 text-slate-900 text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span>Teks Normal (&lt; 18px):</span>
              {getScoreBadge(contrastDark, 4.5)}
            </div>
            <div className="flex items-center justify-between">
              <span>Teks Besar / Heading (&ge; 18px):</span>
              {getScoreBadge(contrastDark, 3.0)}
            </div>
            <div className="flex items-center justify-between">
              <span>Teks Normal Level AAA (&ge; 7:1):</span>
              {getScoreBadge(contrastDark, 7.0)}
            </div>
          </div>
        </div>
      </div>

      {/* Live Component Preview Sandbox */}
      <div className="pt-2 flex flex-col gap-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Simulasi Komponen UI Nyata
        </span>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center gap-4">
          {/* Button Solid */}
          <button
            type="button"
            onClick={() => onCopy(currentHex, 'HEX')}
            className="px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            style={{ backgroundColor: currentHex, color: bestTextColor }}
          >
            Tombol Utama
          </button>

          {/* Button Outline */}
          <button
            type="button"
            onClick={() => onCopy(currentHex, 'HEX')}
            className="px-4 py-2 rounded-lg text-xs font-semibold border-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            style={{ borderColor: currentHex, color: currentHex }}
          >
            Tombol Outline
          </button>

          {/* Badge Tag */}
          <div
            className="px-3 py-1 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: `${currentHex}1A`, // 10% opacity
              borderColor: `${currentHex}40`,
              color: currentHex,
            }}
          >
            Tag Status Aktif
          </div>

          {/* Card Accent Example */}
          <div
            className="px-3 py-2 rounded-lg text-xs font-medium border bg-white dark:bg-slate-900 shadow-xs"
            style={{
              borderLeftColor: currentHex,
              borderLeftWidth: '4px',
            }}
          >
            Kotak Notifikasi
          </div>
        </div>
      </div>
    </div>
  );
};
