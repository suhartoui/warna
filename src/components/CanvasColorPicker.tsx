/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { Pipette, Sparkles, RotateCcw } from 'lucide-react';
import { HSV, RGB, HSL, hsvToRgb, rgbToHex, rgbToHsl, hexToRgb, rgbToHsv } from '../utils/colorUtils';

interface CanvasColorPickerProps {
  hsv: HSV;
  alpha: number;
  onHsvChange: (hsv: HSV) => void;
  onAlphaChange: (alpha: number) => void;
  onColorPickSuccess?: (hex: string) => void;
  onRandomColor: () => void;
}

export const CanvasColorPicker: React.FC<CanvasColorPickerProps> = ({
  hsv,
  alpha,
  onHsvChange,
  onAlphaChange,
  onColorPickSuccess,
  onRandomColor,
}) => {
  const satValRef = useRef<HTMLDivElement>(null);
  const isDraggingSatVal = useRef(false);
  const isDraggingHue = useRef(false);
  const isDraggingAlpha = useRef(false);

  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const currentHex = rgbToHex(rgb.r, rgb.g, rgb.b, alpha);
  const currentHsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Pure hue color for saturation-value background
  const pureHueRgb = hsvToRgb(hsv.h, 100, 100);
  const pureHueHex = rgbToHex(pureHueRgb.r, pureHueRgb.g, pureHueRgb.b);

  // EyeDropper API support
  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  const handleEyeDropper = async () => {
    if (!hasEyeDropper) return;
    try {
      // @ts-expect-error EyeDropper is a modern browser API
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        const parsedRgb = hexToRgb(result.sRGBHex);
        if (parsedRgb) {
          const newHsv = rgbToHsv(parsedRgb.r, parsedRgb.g, parsedRgb.b);
          onHsvChange(newHsv);
          onColorPickSuccess?.(result.sRGBHex.toUpperCase());
        }
      }
    } catch {
      // User cancelled pipette or unsupported
    }
  };

  // Handle Saturation/Value 2D pointer
  const updateSatValFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!satValRef.current) return;
      const rect = satValRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

      const s = Math.round((x / rect.width) * 100);
      const v = Math.round((1 - y / rect.height) * 100);

      onHsvChange({ ...hsv, s, v });
    },
    [hsv, onHsvChange]
  );

  // Mouse / Touch handlers for 2D Canvas
  const handleSatValDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingSatVal.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    updateSatValFromPointer(clientX, clientY);
  };

  // Hue Slider Pointer
  const updateHueFromPointer = useCallback(
    (clientX: number, target: HTMLDivElement) => {
      const rect = target.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const h = Math.round((x / rect.width) * 360) % 360;
      onHsvChange({ ...hsv, h });
    },
    [hsv, onHsvChange]
  );

  // Alpha Slider Pointer
  const updateAlphaFromPointer = useCallback(
    (clientX: number, target: HTMLDivElement) => {
      const rect = target.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const newAlpha = Math.round((x / rect.width) * 100) / 100;
      onAlphaChange(newAlpha);
    },
    [onAlphaChange]
  );

  useEffect(() => {
    const handleGlobalPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDraggingSatVal.current) {
        updateSatValFromPointer(clientX, clientY);
      }
    };

    const handleGlobalPointerUp = () => {
      isDraggingSatVal.current = false;
      isDraggingHue.current = false;
      isDraggingAlpha.current = false;
    };

    window.addEventListener('mousemove', handleGlobalPointerMove);
    window.addEventListener('mouseup', handleGlobalPointerUp);
    window.addEventListener('touchmove', handleGlobalPointerMove);
    window.addEventListener('touchend', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalPointerMove);
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchmove', handleGlobalPointerMove);
      window.removeEventListener('touchend', handleGlobalPointerUp);
    };
  }, [updateSatValFromPointer]);

  // Handle direct Hex input
  const handleHexInputChange = (val: string) => {
    let clean = val.trim();
    if (!clean.startsWith('#')) clean = '#' + clean;
    const parsed = hexToRgb(clean);
    if (parsed) {
      const newHsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
      onHsvChange(newHsv);
      if (parsed.a !== undefined) {
        onAlphaChange(parsed.a);
      }
    }
  };

  // Handle RGB inputs
  const handleRgbChange = (channel: 'r' | 'g' | 'b', val: number) => {
    const clamped = Math.max(0, Math.min(255, isNaN(val) ? 0 : val));
    const newRgb: RGB = { ...rgb, [channel]: clamped };
    const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    onHsvChange(newHsv);
  };

  // Handle HSL inputs
  const handleHslChange = (channel: 'h' | 's' | 'l', val: number) => {
    const max = channel === 'h' ? 360 : 100;
    const clamped = Math.max(0, Math.min(max, isNaN(val) ? 0 : val));
    const newHsl: HSL = { ...currentHsl, [channel]: clamped };
    const newRgb = { ...rgb, ...hsvToRgb(newHsl.h, newHsl.s, newHsl.l) };
    const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    onHsvChange(newHsv);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-6">
      {/* Header controls: Eyedropper & Randomizer */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Kanvas Pemilih Warna
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Geser kursor atau masukkan nilai numerik
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasEyeDropper && (
            <button
              type="button"
              onClick={handleEyeDropper}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Ambil warna dari layar manapun"
            >
              <Pipette className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pipet Layar</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRandomColor}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Acak warna baru"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Acak</span>
          </button>
        </div>
      </div>

      {/* 2D Saturation / Value Gradient Area */}
      <div
        ref={satValRef}
        onMouseDown={handleSatValDown}
        onTouchStart={handleSatValDown}
        className="relative w-full h-56 sm:h-64 rounded-xl cursor-crosshair overflow-hidden select-none touch-none shadow-inner"
        style={{ backgroundColor: pureHueHex }}
      >
        {/* White to transparent horizontal gradient (Saturation) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, #FFFFFF, transparent)',
          }}
        />
        {/* Transparent to black vertical gradient (Value / Brightness) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #000000, transparent)',
          }}
        />

        {/* Draggable Indicator Crosshair / Circle */}
        <div
          className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white shadow-md pointer-events-none transition-transform"
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            backgroundColor: currentHex,
          }}
        >
          <div className="w-full h-full rounded-full border border-black/30" />
        </div>
      </div>

      {/* Hue Rainbow Slider Strip */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Corak (Hue)</span>
          <span className="font-mono tabular-nums">{hsv.h}°</span>
        </div>
        <div
          className="relative h-6 rounded-lg cursor-pointer select-none touch-none shadow-inner"
          style={{
            background:
              'linear-gradient(to right, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)',
          }}
          onMouseDown={(e) => {
            isDraggingHue.current = true;
            updateHueFromPointer(e.clientX, e.currentTarget);
            const moveHandler = (moveEvent: MouseEvent) => {
              if (isDraggingHue.current) {
                updateHueFromPointer(moveEvent.clientX, e.currentTarget);
              }
            };
            const upHandler = () => {
              isDraggingHue.current = false;
              window.removeEventListener('mousemove', moveHandler);
              window.removeEventListener('mouseup', upHandler);
            };
            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', upHandler);
          }}
          onTouchStart={(e) => {
            isDraggingHue.current = true;
            updateHueFromPointer(e.touches[0].clientX, e.currentTarget);
            const moveHandler = (moveEvent: TouchEvent) => {
              if (isDraggingHue.current) {
                updateHueFromPointer(moveEvent.touches[0].clientX, e.currentTarget);
              }
            };
            const upHandler = () => {
              isDraggingHue.current = false;
              window.removeEventListener('touchmove', moveHandler);
              window.removeEventListener('touchend', upHandler);
            };
            window.addEventListener('touchmove', moveHandler);
            window.addEventListener('touchend', upHandler);
          }}
        >
          <div
            className="absolute top-0 bottom-0 w-4 -ml-2 rounded-md bg-white border border-slate-400 shadow-md pointer-events-none"
            style={{ left: `${(hsv.h / 360) * 100}%` }}
          />
        </div>
      </div>

      {/* Alpha / Opacity Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Opasitas (Alpha)</span>
          <span className="font-mono tabular-nums">{Math.round(alpha * 100)}%</span>
        </div>
        <div
          className="relative h-6 rounded-lg cursor-pointer select-none touch-none overflow-hidden shadow-inner bg-[linear-gradient(45deg,#E2E8F0_25%,transparent_25%),linear-gradient(-45deg,#E2E8F0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#E2E8F0_75%),linear-gradient(-45deg,transparent_75%,#E2E8F0_75%)] bg-[size:12px_12px] bg-[position:0_0,0_6px,6px_-6px,-6px_0px] dark:bg-[linear-gradient(45deg,#334155_25%,transparent_25%),linear-gradient(-45deg,#334155_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#334155_75%),linear-gradient(-45deg,transparent_75%,#334155_75%)]"
          onMouseDown={(e) => {
            isDraggingAlpha.current = true;
            updateAlphaFromPointer(e.clientX, e.currentTarget);
            const moveHandler = (moveEvent: MouseEvent) => {
              if (isDraggingAlpha.current) {
                updateAlphaFromPointer(moveEvent.clientX, e.currentTarget);
              }
            };
            const upHandler = () => {
              isDraggingAlpha.current = false;
              window.removeEventListener('mousemove', moveHandler);
              window.removeEventListener('mouseup', upHandler);
            };
            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', upHandler);
          }}
          onTouchStart={(e) => {
            isDraggingAlpha.current = true;
            updateAlphaFromPointer(e.touches[0].clientX, e.currentTarget);
            const moveHandler = (moveEvent: TouchEvent) => {
              if (isDraggingAlpha.current) {
                updateAlphaFromPointer(moveEvent.touches[0].clientX, e.currentTarget);
              }
            };
            const upHandler = () => {
              isDraggingAlpha.current = false;
              window.removeEventListener('touchmove', moveHandler);
              window.removeEventListener('touchend', upHandler);
            };
            window.addEventListener('touchmove', moveHandler);
            window.addEventListener('touchend', upHandler);
          }}
        >
          {/* Color Gradient Overlay for Alpha */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, transparent, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}))`,
            }}
          />
          <div
            className="absolute top-0 bottom-0 w-4 -ml-2 rounded-md bg-white border border-slate-400 shadow-md pointer-events-none"
            style={{ left: `${alpha * 100}%` }}
          />
        </div>
      </div>

      {/* Numeric Form Inputs (HEX, RGB, HSL) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* HEX Input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            HEX
          </label>
          <div className="relative">
            <input
              type="text"
              value={currentHex}
              onChange={(e) => handleHexInputChange(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="#000000"
              maxLength={9}
            />
          </div>
        </div>

        {/* RGB Inputs */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            RGB
          </label>
          <div className="grid grid-cols-3 gap-1">
            <input
              type="number"
              min={0}
              max={255}
              value={rgb.r}
              onChange={(e) => handleRgbChange('r', parseInt(e.target.value, 10))}
              className="w-full px-1.5 py-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums"
              title="Red (0-255)"
            />
            <input
              type="number"
              min={0}
              max={255}
              value={rgb.g}
              onChange={(e) => handleRgbChange('g', parseInt(e.target.value, 10))}
              className="w-full px-1.5 py-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums"
              title="Green (0-255)"
            />
            <input
              type="number"
              min={0}
              max={255}
              value={rgb.b}
              onChange={(e) => handleRgbChange('b', parseInt(e.target.value, 10))}
              className="w-full px-1.5 py-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums"
              title="Blue (0-255)"
            />
          </div>
        </div>

        {/* HSL Inputs */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            HSL
          </label>
          <div className="grid grid-cols-3 gap-1">
            <input
              type="number"
              min={0}
              max={360}
              value={currentHsl.h}
              onChange={(e) => handleHslChange('h', parseInt(e.target.value, 10))}
              className="w-full px-1.5 py-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums"
              title="Hue (0-360)"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={currentHsl.s}
              onChange={(e) => handleHslChange('s', parseInt(e.target.value, 10))}
              className="w-full px-1.5 py-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums"
              title="Saturation %"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={currentHsl.l}
              onChange={(e) => handleHslChange('l', parseInt(e.target.value, 10))}
              className="w-full px-1.5 py-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums"
              title="Lightness %"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
