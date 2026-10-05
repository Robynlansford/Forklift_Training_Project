"use client";

import { useEffect, type RefObject } from "react";

/**
 * Bridge between React and the framework-free Living Pages engine in
 * public/living/engine.js. The engine is injected once, client-side only, the
 * first time any scene or figure mounts — so SSR never touches `window`, and a
 * page with no Living elements never downloads it.
 *
 * Bump LIVING_VERSION whenever a file under public/living/ changes: every
 * engine/scene/poster URL carries it, and _headers caches /living/* immutably.
 */
export const LIVING_VERSION = "2";

type LivingAPI = {
  mount: (el: HTMLElement) => unknown;
  unmount: (el: HTMLElement) => void;
  set: (el: HTMLElement, data: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    Living?: Partial<LivingAPI> & { __engine?: boolean };
  }
}

let enginePromise: Promise<LivingAPI> | null = null;

export function ensureLiving(): Promise<LivingAPI> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  const w = window;
  if (w.Living?.__engine && w.Living.mount) return Promise.resolve(w.Living as LivingAPI);
  if (!enginePromise) {
    enginePromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `/living/engine.js?v=${LIVING_VERSION}`;
      s.async = true;
      s.onload = () => resolve(w.Living as LivingAPI);
      s.onerror = () => {
        enginePromise = null;
        reject(new Error("Living engine failed to load"));
      };
      document.head.appendChild(s);
    });
  }
  return enginePromise;
}

/** Mount a [data-scene] / [data-fx] element for its lifetime; push `data` when it changes. */
export function useLiving(ref: RefObject<HTMLElement | null>, data?: Record<string, unknown>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let api: LivingAPI | null = null;
    ensureLiving()
      .then((L) => {
        if (cancelled) return;
        api = L;
        L.mount(el);
      })
      .catch(() => {
        // Engine unavailable: the poster / static layout is already the fallback.
        el.classList.add("lp-nogl");
      });
    return () => {
      cancelled = true;
      if (api) api.unmount(el);
    };
  }, [ref]);

  const json = data ? JSON.stringify(data) : "";
  useEffect(() => {
    const el = ref.current as (HTMLElement & { __lpPending?: Record<string, unknown> }) | null;
    if (!el || !data) return;
    const L = window.Living;
    if (L?.set) L.set(el, data);
    else el.__lpPending = { ...(el.__lpPending || {}), ...data };
    // `json` is the stable dependency for `data`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [json]);
}

export function livingAsset(path: string) {
  return `/living/${path}?v=${LIVING_VERSION}`;
}
