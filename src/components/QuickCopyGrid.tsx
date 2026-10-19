/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Eye } from 'lucide-react';
import { RGB, HSV, generateTintsAndShades, generateHarmonies, hexToRgb, getReadableTextColor } from '../utils/colorUtils';

interface QuickCopyGridProps {
  currentHex: string;
  rgb: RGB;
  hsv: HSV;
  onCopy: (text: string, label?: string) => void;
  onSelectColor: (hex: string) => void;
}

export const QuickCopyGrid: React.FC<QuickCopyGridProps> = ({
  currentHex,
  rgb,
  hsv,
  onCopy,
  onSelectColor,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const { tints, shades } = generateTintsAndShades(rgb);
  const harmonies = generateHarmonies(hsv);

  const handleSwatchClick = (hex: string, label?: string) => {
    onCopy(hex, label || 'HEX');
    setCopiedHex(hex);
    setTimeout(() => {
      setCopiedHex(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tints & Shades Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-5">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Skala Warna: Tint &amp; Shade (Gradasi)
            </h2>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              1-Klik Salin HEX
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Klik pada kotak warna mana pun untuk menyalin kode warnanya langsung ke papan klip.
          </p>
        </div>

        {/* Tint Row (Lighter) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Tint (Gradasi Menuju Putih)</span>
            <span className="text-[11px] text-slate-400">9 Tingkat Cahaya</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
            {tints.map((hex, index) => {
              const tintRgb = hexToRgb(hex) || { r: 255, g: 255, b: 255 };
              const textColor = getReadableTextColor(tintRgb);
              const isCopied = copiedHex === hex;

              return (
                <button
                  key={`tint-${index}-${hex}`}
                  type="button"
                  onClick={() => handleSwatchClick(hex, `Tint ${index + 1}`)}
                  className="group relative h-16 sm:h-20 rounded-xl p-1.5 flex flex-col justify-between items-center text-center border border-black/5 dark:border-white/5 transition-all hover:scale-[1.03] active:scale-95 cursor-pointer shadow-xs"
                  style={{ backgroundColor: hex }}
                  title={`Klik untuk salin ${hex}`}
                >
                  <span
                    className="text-[10px] font-mono font-bold tracking-tight opacity-90 truncate max-w-full"
                    style={{ color: textColor }}
                  >
                    {isCopied ? 'TERSLN' : hex}
                  </span>

                  <div
                    className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      backgroundColor: textColor === '#FFFFFF' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
                      color: textColor,
                    }}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </div>

                  <span
                    className="text-[9px] font-semibold opacity-70"
                    style={{ color: textColor }}
                  >
                    +{(index + 1) * 10}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shades Row (Darker) */}
        <div className="flex flex-col gap-1.5 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Shade (Gradasi Menuju Hitam)</span>
            <span className="text-[11px] text-slate-400">9 Tingkat Bayangan</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
            {shades.map((hex, index) => {
              const shadeRgb = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
              const textColor = getReadableTextColor(shadeRgb);
              const isCopied = copiedHex === hex;

              return (
                <button
                  key={`shade-${index}-${hex}`}
                  type="button"
                  onClick={() => handleSwatchClick(hex, `Shade ${index + 1}`)}
                  className="group relative h-16 sm:h-20 rounded-xl p-1.5 flex flex-col justify-between items-center text-center border border-black/5 dark:border-white/5 transition-all hover:scale-[1.03] active:scale-95 cursor-pointer shadow-xs"
                  style={{ backgroundColor: hex }}
                  title={`Klik untuk salin ${hex}`}
                >
                  <span
                    className="text-[10px] font-mono font-bold tracking-tight opacity-90 truncate max-w-full"
                    style={{ color: textColor }}
                  >
                    {isCopied ? 'TERSLN' : hex}
                  </span>

                  <div
                    className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      backgroundColor: textColor === '#FFFFFF' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
                      color: textColor,
                    }}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </div>

                  <span
                    className="text-[9px] font-semibold opacity-70"
                    style={{ color: textColor }}
                  >
                    -{(index + 1) * 10}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Color Harmonies Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Harmoni Warna Teoretis
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dihasilkan secara matematis dari roda warna. Klik kotak untuk salin HEX, atau tombol mata untuk menerapkan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {harmonies.map((harmony) => (
            <div
              key={harmony.name}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {harmony.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {harmony.description}
                  </p>
                </div>
              </div>

              {/* Swatches strip */}
              <div className="grid grid-cols-2 sm:grid-flow-col sm:auto-cols-fr gap-2">
                {harmony.colors.map((hex, idx) => {
                  const swatchRgb = hexToRgb(hex) || { r: 100, g: 100, b: 100 };
                  const textColor = getReadableTextColor(swatchRgb);
                  const isCopied = copiedHex === hex;

                  return (
                    <div
                      key={`${harmony.name}-${idx}-${hex}`}
                      className="group relative h-20 rounded-xl p-2 flex flex-col justify-between items-center text-center border border-black/10 dark:border-white/5 transition-all hover:shadow-md cursor-pointer overflow-hidden"
                      style={{ backgroundColor: hex }}
                      onClick={() => handleSwatchClick(hex, `${harmony.name} #${idx + 1}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSwatchClick(hex, `${harmony.name} #${idx + 1}`);
                        }
                      }}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span
                          className="text-[11px] font-mono font-bold tracking-tight"
                          style={{ color: textColor }}
                        >
                          {hex}
                        </span>

                        {/* Button to pick this color as active */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectColor(hex);
                          }}
                          className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
                          style={{
                            backgroundColor: textColor === '#FFFFFF' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)',
                            color: textColor,
                          }}
                          title="Terapkan warna ini sebagai warna aktif"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Click prompt overlay */}
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all"
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
