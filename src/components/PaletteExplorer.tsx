/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Trash2, Download, Code2, Sparkles, FolderHeart, History } from 'lucide-react';
import { CURATED_PALETTES, hexToRgb, getReadableTextColor } from '../utils/colorUtils';

interface PaletteExplorerProps {
  savedColors: string[];
  recentHistory: string[];
  onSelectColor: (hex: string) => void;
  onCopy: (text: string, label?: string) => void;
  onRemoveSaved: (hex: string) => void;
  onClearHistory: () => void;
}

export const PaletteExplorer: React.FC<PaletteExplorerProps> = ({
  savedColors,
  recentHistory,
  onSelectColor,
  onCopy,
  onRemoveSaved,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'curated' | 'saved' | 'history'>('curated');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'css' | 'tailwind' | 'json' | null>(null);

  const handleSwatchClick = (hex: string, label?: string) => {
    onCopy(hex, label || 'HEX');
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const getExportText = (colors: string[], format: 'css' | 'tailwind' | 'json'): string => {
    if (format === 'css') {
      return `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
    }
    if (format === 'tailwind') {
      const obj = colors.reduce((acc, c, i) => {
        acc[`color-${i + 1}`] = c;
        return acc;
      }, {} as Record<string, string>);
      return `module.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(obj, null, 8)}\n    }\n  }\n};`;
    }
    return JSON.stringify(colors, null, 2);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-5">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Koleksi Palet &amp; Riwayat
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Klik swatch mana pun untuk menyalin kode warnanya dalam sekali sentuh.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('curated')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'curated'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Inspirasi Tren</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FolderHeart className="w-3.5 h-3.5 text-rose-500" />
            <span>Tersimpan ({savedColors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-indigo-500" />
            <span>Riwayat ({recentHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Curated Palettes */}
      {activeTab === 'curated' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CURATED_PALETTES.map((palette) => (
            <div
              key={palette.title}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {palette.title}
                </span>
                <span className="text-[11px] text-slate-400">
                  {palette.category}
                </span>
              </div>

              {/* Swatch row */}
              <div className="grid grid-cols-6 gap-1.5">
                {palette.colors.map((hex) => {
                  const rgb = hexToRgb(hex) || { r: 120, g: 120, b: 120 };
                  const textColor = getReadableTextColor(rgb);
                  const isCopied = copiedHex === hex;

                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => handleSwatchClick(hex, palette.title)}
                      className="group relative h-14 rounded-lg flex flex-col justify-between items-center p-1 border border-black/5 dark:border-white/5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                      style={{ backgroundColor: hex }}
                      title={`Klik untuk salin ${hex}`}
                    >
                      <span
                        className="text-[9px] font-mono font-bold truncate max-w-full"
                        style={{ color: textColor }}
                      >
                        {isCopied ? 'OK' : hex.substring(1)}
                      </span>

                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full"
                        style={{
                          backgroundColor: textColor === '#FFFFFF' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
                          color: textColor,
                        }}
                      >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Saved / Bookmarked Colors */}
      {activeTab === 'saved' && (
        <div className="flex flex-col gap-4">
          {savedColors.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <FolderHeart className="w-10 h-10 text-slate-300 dark:text-slate-700 stroke-1" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Belum ada warna yang disimpan
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Klik tombol &quot;Simpan&quot; pada warna aktif untuk menambahkannya ke sini.
              </p>
            </div>
          ) : (
            <>
              {/* Export Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ekspor Palet Tersimpan:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const text = getExportText(savedColors, 'css');
                      onCopy(text, 'CSS Variables');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Salin CSS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = getExportText(savedColors, 'tailwind');
                      onCopy(text, 'Tailwind Colors');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    <span>Tailwind</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = getExportText(savedColors, 'json');
                      onCopy(text, 'JSON');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {/* Grid of Saved Colors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {savedColors.map((hex) => {
                  const rgb = hexToRgb(hex) || { r: 120, g: 120, b: 120 };
                  const textColor = getReadableTextColor(rgb);
                  const isCopied = copiedHex === hex;

                  return (
                    <div
                      key={hex}
                      className="group relative h-24 rounded-xl p-2.5 flex flex-col justify-between border border-black/10 dark:border-white/5 transition-all hover:shadow-md cursor-pointer overflow-hidden"
                      style={{ backgroundColor: hex }}
                      onClick={() => handleSwatchClick(hex, 'Tersimpan')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSwatchClick(hex, 'Tersimpan');
                        }
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="text-xs font-mono font-bold tracking-tight"
                          style={{ color: textColor }}
                        >
                          {hex}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSaved(hex);
                          }}
                          className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all text-rose-300 cursor-pointer"
                          title="Hapus dari tersimpan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div
                        className="flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[10px] font-bold"
                        style={{
                          backgroundColor: textColor === '#FFFFFF' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.75)',
                          color: textColor,
                        }}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin HEX</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3: Recent History */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Riwayat 16 warna terakhir yang Anda jelajahi
            </span>
            {recentHistory.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Riwayat</span>
              </button>
            )}
          </div>

          {recentHistory.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Belum ada riwayat warna.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {recentHistory.map((hex, i) => {
                const rgb = hexToRgb(hex) || { r: 120, g: 120, b: 120 };
                const textColor = getReadableTextColor(rgb);
                const isCopied = copiedHex === hex;

                return (
                  <button
                    key={`${hex}-${i}`}
                    type="button"
                    onClick={() => handleSwatchClick(hex, 'Riwayat')}
                    onDoubleClick={() => onSelectColor(hex)}
                    className="group relative h-16 rounded-xl p-1.5 flex flex-col justify-between items-center border border-black/5 dark:border-white/5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                    style={{ backgroundColor: hex }}
                    title={`Klik untuk salin ${hex} (Klik dua kali untuk memilih)`}
                  >
                    <span
                      className="text-[10px] font-mono font-bold truncate max-w-full"
                      style={{ color: textColor }}
                    >
                      {isCopied ? 'OK' : hex}
                    </span>

                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full"
                      style={{
                        backgroundColor: textColor === '#FFFFFF' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
                        color: textColor,
                      }}
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
