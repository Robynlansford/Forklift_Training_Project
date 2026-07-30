"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  push: (kind: ToastKind, message: string) => void;
  dismiss: (id: number) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (kind, message) =>
    set((s) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setTimeout(() => set((cur) => ({ toasts: cur.toasts.filter((t) => t.id !== id) })), 4200);
      return { toasts: [...s.toasts, { id, kind, message }] };
    }),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (m: string) => useToastStore.getState().push("success", m),
  error: (m: string) => useToastStore.getState().push("error", m),
  info: (m: string) => useToastStore.getState().push("info", m),
};

const ICONS = {
  success: <CheckCircle2 className="h-4 w-4 text-[var(--color-go)]" />,
  error: <AlertTriangle className="h-4 w-4 text-[var(--color-hardstop)]" />,
  info: <Info className="h-4 w-4 text-[var(--color-accent)]" />,
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div
      aria-live="polite"
      className="no-print pointer-events-none fixed bottom-5 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] px-4 py-3 shadow-[var(--shadow-card)]"
          >
            {ICONS[t.kind]}
            <span className="flex-1 text-sm text-[var(--color-text)]">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
