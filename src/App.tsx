/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  HSV,
  RGB,
  hsvToRgb,
  rgbToHex,
  hexToRgb,
  rgbToHsv,
} from './utils/colorUtils';
import { playCopySound } from './utils/audioUtils';
import { CanvasColorPicker } from './components/CanvasColorPicker';
import { ColorHero } from './components/ColorHero';
import { QuickCopyGrid } from './components/QuickCopyGrid';
import { ContrastChecker } from './components/ContrastChecker';
import { PaletteExplorer } from './components/PaletteExplorer';
import { Toast, ToastMessage } from './components/Toast';
import { Sparkles, Copy, Check, Moon, Sun } from 'lucide-react';

const INITIAL_SAVED = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];

export default function App() {
  // Current Color State
  const [hsv, setHsv] = useState<HSV>({ h: 243, s: 75, v: 95 }); // Electric Indigo #4F46E5
  const [alpha, setAlpha] = useState<number>(1);

  // Sound & Theme preferences
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hexpick_sound');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hexpick_theme') === 'dark';
    }
    return false;
  });

  // Saved & History colors
  const [savedColors, setSavedColors] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hexpick_saved');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return INITIAL_SAVED;
        }
      }
    }
    return INITIAL_SAVED;
  });

  const [recentHistory, setRecentHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hexpick_history');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return ['#4F46E5'];
        }
      }
    }
    return ['#4F46E5'];
  });

  // Toast feedback
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Derive RGB and HEX from HSV
  const rgb: RGB = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const currentHex = rgbToHex(rgb.r, rgb.g, rgb.b, alpha);

  // Synchronize Dark Mode Class on document
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('hexpick_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Persist Saved Colors
  useEffect(() => {
    localStorage.setItem('hexpick_saved', JSON.stringify(savedColors));
  }, [savedColors]);

  // Persist History
  useEffect(() => {
    localStorage.setItem('hexpick_history', JSON.stringify(recentHistory));
  }, [recentHistory]);

  // Persist Sound Setting
  useEffect(() => {
    localStorage.setItem('hexpick_sound', String(soundEnabled));
  }, [soundEnabled]);

  // Update history when color changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      setRecentHistory((prev) => {
        const filtered = prev.filter((c) => c !== currentHex);
        return [currentHex, ...filtered].slice(0, 16);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [currentHex]);

  // Copy to clipboard handler with sound and toast
  const handleCopy = useCallback(
    (text: string, label = 'HEX') => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
      if (soundEnabled) {
        playCopySound();
      }
      setToast({
        id: Date.now().toString(),
        text,
        label,
      });
      setTimeout(() => {
        setToast((current) => (current?.text === text ? null : current));
      }, 2200);
    },
    [soundEnabled]
  );

  // Set active color by Hex
  const handleSelectHex = (hex: string) => {
    const parsed = hexToRgb(hex);
    if (parsed) {
      const newHsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
      setHsv(newHsv);
      if (parsed.a !== undefined) {
        setAlpha(parsed.a);
      }
      handleCopy(hex, 'Warna Terpilih');
    }
  };

  // Random color generator
  const handleRandomColor = useCallback(() => {
    const randomH = Math.floor(Math.random() * 360);
    const randomS = Math.floor(Math.random() * 65) + 35; // 35-100%
    const randomV = Math.floor(Math.random() * 55) + 45; // 45-100%
    setHsv({ h: randomH, s: randomS, v: randomV });
    const randomRgb = hsvToRgb(randomH, randomS, randomV);
    const randomHex = rgbToHex(randomRgb.r, randomRgb.g, randomRgb.b);
    handleCopy(randomHex, 'Warna Acak');
  }, [handleCopy]);

  // Keyboard shortcut listener (Space = Randomize, C = Copy Hex)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleRandomColor();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleCopy(currentHex, 'HEX');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRandomColor, handleCopy, currentHex]);

  // Bookmark toggle
  const isSaved = savedColors.includes(currentHex);
  const handleToggleSave = () => {
    if (isSaved) {
      setSavedColors((prev) => prev.filter((c) => c !== currentHex));
    } else {
      setSavedColors((prev) => [currentHex, ...prev]);
    }
  };

  const handleRemoveSaved = (hex: string) => {
    setSavedColors((prev) => prev.filter((c) => c !== hex));
  };

  const handleClearHistory = () => {
    setRecentHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors selection:bg-indigo-500 selection:text-white pb-16">
      {/* 
        TOP BAR CONTRACT:
        Zone 1: Brand title (1 line, wordmark in display face)
        Zone 2: 4-5 concise single-line nav links
        Zone 3: 1 primary action button
      */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single element brand wordmark */}
          <a
            href="/"
            className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <div
              className="w-4 h-4 rounded-md shadow-xs transition-colors"
              style={{ backgroundColor: currentHex }}
            />
            <span>HexPick</span>
          </a>

          {/* Zone 2: 4–5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#picker" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Pemilih
            </a>
            <a href="#tints" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Skala Gradasi
            </a>
            <a href="#harmoni" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Harmoni
            </a>
            <a href="#kontras" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Uji Kontras
            </a>
            <a href="#palet" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Koleksi Palet
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={darkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => handleCopy(currentHex, 'HEX')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin HEX</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col gap-8">
        {/* Editorial Intro Banner without slop */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 [text-wrap:balance]">
              Pemilih &amp; Penyalin Kode Warna HEX
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              <span>Sekali Klik Salin</span>
              <span aria-hidden="true">·</span>
              <span>Rasio Kontras WCAG</span>
              <span aria-hidden="true">·</span>
              <span>Dukungan Pipet Layar</span>
              <span aria-hidden="true">·</span>
              <span>Pintasan Spasi untuk Acak</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomColor}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-lg transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Warna Acak (Spasi)</span>
            </button>
          </div>
        </div>

        {/* PRIMARY WORKSPACE: 2-Column Split Hero & Canvas Picker */}
        <div id="picker" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Giant 1-Click Copy Hero Card & Format Switcher */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
            <ColorHero
              hex={currentHex}
              rgb={rgb}
              alpha={alpha}
              isSaved={isSaved}
              onCopy={handleCopy}
              onToggleSave={handleToggleSave}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
            />
          </div>

          {/* Right Column: Interactive 2D Canvas Picker, Sliders, & Precision Inputs */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6">
            <CanvasColorPicker
              hsv={hsv}
              alpha={alpha}
              onHsvChange={setHsv}
              onAlphaChange={setAlpha}
              onColorPickSuccess={(pickedHex) => handleCopy(pickedHex, 'Pipet Layar')}
              onRandomColor={handleRandomColor}
            />
          </div>
        </div>

        {/* Section 2: Skala Gradasi Tint & Shade + Harmoni Warna */}
        <section id="tints" className="scroll-mt-20">
          <QuickCopyGrid
            currentHex={currentHex}
            rgb={rgb}
            hsv={hsv}
            onCopy={handleCopy}
            onSelectColor={handleSelectHex}
          />
        </section>

        {/* Section 3: Uji Kontras & Simulasi UI */}
        <section id="kontras" className="scroll-mt-20">
          <ContrastChecker
            currentHex={currentHex}
            rgb={rgb}
            onCopy={handleCopy}
          />
        </section>

        {/* Section 4: Koleksi Palet Tren & Riwayat Warna */}
        <section id="palet" className="scroll-mt-20">
          <PaletteExplorer
            savedColors={savedColors}
            recentHistory={recentHistory}
            onSelectColor={handleSelectHex}
            onCopy={handleCopy}
            onRemoveSaved={handleRemoveSaved}
            onClearHistory={handleClearHistory}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">HexPick</span>
          <span>&copy; {new Date().getFullYear()} Alat Pemilih Warna &amp; Salin Cepat</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Pintasan: Tekan [C] untuk salin</span>
          <span>·</span>
          <span>Tekan [Spasi] untuk acak warna</span>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
}
