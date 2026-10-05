/**
 * THE LOAD-OUT — the five beats of the home-page scroll film.
 *
 * Single source for the film's words, read by the original footage film on the
 * home page (components/scroll-intro.tsx). Text is verbatim from the original film.
 */
export interface FilmBeat {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  cta?: { primary: { label: string; href: string }; secondary: { label: string; href: string } };
}

export const FILM_BEATS: FilmBeat[] = [
  {
    id: "yard",
    label: "The Yard",
    eyebrow: "23:10 · Load-in",
    title: "The Wet Ramp Slick starts before the wheels ever move.",
    body: "Aluminum loading ramps turn frictionless in active rain. Every approach is calculated — momentum, wheel-spin, a precise straight-on line — before the machine ever leaves the yard.",
    tags: ["Wet Ramp Slick", "Incline Dynamics"],
  },
  {
    id: "trailer",
    label: "Fork Pockets",
    eyebrow: "23:40 · Truck Pack",
    title: "Miss a slot by an inch, spear a $200k processor.",
    body: "Vertical Rib Symmetry and the Level-Fork Shadow Trick turn blind, dark-trailer alignment into a repeatable skill — not a guess, not a gouge.",
    tags: ["Vertical Rib Symmetry", "Level-Fork Shadow", "Flush-Fork Rule"],
  },
  {
    id: "dock",
    label: "Ground Crew",
    eyebrow: "00:25 · Ground Crew",
    title: "The Rear-Swing Halo Zone doesn't care how eager the crew is.",
    body: "Counterbalance forklifts steer from the rear — the tail swings. A strict 3-foot boundary and the mandatory Clear-and-Release pause keep hands off the steel until it's actually down.",
    tags: ["Rear-Swing Halo", "Clear-and-Release", "Pusher's Blindness Yield"],
  },
  {
    id: "rigging",
    label: "Up-Look",
    eyebrow: "01:05 · Rigging Zone",
    title: "A 2 lb shackle falling 60 ft hits like a 120 lb weight.",
    body: "Active rigging turns the airspace above the floor into its own hazard zone. The Up-Look Protocol and Sail Effect wind-load math make that airspace survivable — one spotter, obeyed, every time.",
    tags: ["Up-Look Protocol", "Sail Effect Derating"],
  },
  {
    id: "capstone",
    label: "02:00",
    eyebrow: "02:00 · Arena Load-Out",
    title: "Be the operator who calls STOP when it counts.",
    body: "Fourteen hours in. Strobes firing. The last case, alone under one work light. This is the reflex the whole curriculum is built to make automatic — and the capstone that certifies you've got it.",
    tags: ["Stop-Work Authority", "Fatigue Protocol"],
    cta: {
      primary: { label: "Enter the Training Hub", href: "/dashboard" },
      secondary: { label: "Open Safety Engine", href: "/simulator" },
    },
  },
];

/** Scroll-progress window [in, out] during which each beat is fully shown (pinned film). */
export const FILM_BEAT_AT = ["0.09,0.24", "0.28,0.43", "0.47,0.63", "0.67,0.81", "0.85,1"];
