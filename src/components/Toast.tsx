/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, Copy } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  label?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950 text-white shadow-2xl border border-slate-800">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-slate-400">
            {toast.label ? `${toast.label} Berhasil Disalin!` : 'Tersalin ke Papan Klip!'}
          </span>
          <span className="text-sm font-mono font-bold tracking-tight text-emerald-300">
            {toast.text}
          </span>
        </div>
      </div>
    </div>
  );
};
