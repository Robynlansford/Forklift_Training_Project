/* ============================================================================
   THE LOAD-OUT — section config for scrub-engine.js
   ----------------------------------------------------------------------------
   Architecture A: no connectors. Every leg's poster is extracted from its own
   rendered clip's first frame, so poster/video are pixel-identical — no flash.
   Copy uses only real named techniques + figures from the TourReady curriculum
   (Module_1 through capstone) — nothing invented. A running clock marches the
   viewer toward the 02:00 capstone the site's own hero already promises.
   ========================================================================== */

const LOAD_OUT_SECTIONS = [
  {
    id: 'yard',
    label: 'The Yard',
    still: 'assets/img/leg1.jpg',
    clip: 'assets/vid/leg1.mp4',
    accent: '#F97316',
    scroll: 1.5,
    linger: 0.3,
    eyebrow: '23:10 · Load-in',
    title: 'The Wet Ramp Slick starts before the wheels ever move.',
    body: 'Aluminum loading ramps turn frictionless in active rain. Every approach is calculated — momentum, wheel-spin, a precise straight-on line — before the machine ever leaves the yard.',
    tags: ['Wet Ramp Slick', 'Incline Dynamics'],
  },
  {
    id: 'trailer',
    label: 'Fork Pockets',
    still: 'assets/img/leg2.jpg',
    clip: 'assets/vid/leg2.mp4',
    accent: '#FBBF24',
    scroll: 1.5,
    linger: 0.35,
    eyebrow: '23:40 · Truck Pack',
    title: 'Miss a slot by an inch, spear a $200k processor.',
    body: 'Vertical Rib Symmetry and the Level-Fork Shadow Trick turn blind, dark-trailer alignment into a repeatable skill — not a guess, not a gouge.',
    tags: ['Vertical Rib Symmetry', 'Level-Fork Shadow', 'Flush-Fork Rule'],
  },
  {
    id: 'dock',
    label: 'Ground Crew',
    still: 'assets/img/leg3.jpg',
    clip: 'assets/vid/leg3.mp4',
    accent: '#F97316',
    scroll: 1.4,
    linger: 0.3,
    eyebrow: '00:25 · Ground Crew',
    title: 'The Rear-Swing Halo Zone doesn’t care how eager the crew is.',
    body: 'Counterbalance forklifts steer from the rear — the tail swings. A strict 3-foot boundary and the mandatory Clear-and-Release pause keep hands off the steel until it’s actually down.',
    tags: ['Rear-Swing Halo', 'Clear-and-Release', 'Pusher’s Blindness Yield'],
  },
  {
    id: 'rigging',
    label: 'Up-Look',
    still: 'assets/img/leg4.jpg',
    clip: 'assets/vid/leg4.mp4',
    accent: '#22C55E',
    scroll: 1.6,
    linger: 0.4,
    eyebrow: '01:05 · Rigging Zone',
    title: 'A 2 lb shackle falling 60 ft hits like a 120 lb weight.',
    body: 'Active rigging turns the airspace above the floor into its own hazard zone. The Up-Look Protocol and Sail Effect wind-load math make that airspace survivable — one spotter, obeyed, every time.',
    tags: ['Up-Look Protocol', 'Sail Effect Derating'],
  },
  {
    id: 'capstone',
    label: '02:00',
    still: 'assets/img/leg5.jpg',
    clip: 'assets/vid/leg5.mp4',
    accent: '#EF4444',
    scroll: 1.8,
    linger: 0.55,
    eyebrow: '02:00 · Arena Load-Out',
    title: 'Be the operator who calls STOP when it counts.',
    body: 'Fourteen hours in. Strobes firing. The last case, alone under one work light. This is the reflex the whole curriculum is built to make automatic — and the capstone that certifies you’ve got it.',
    tags: ['Stop-Work Authority', 'Fatigue Protocol'],
    cta: {
      primary: { label: 'Enter the Training Hub', href: '/dashboard' },
      secondary: { label: 'Open Safety Engine', href: '/simulator' },
    },
  },
];

/*
  Mount, once assets exist:

  mountScrollWorld(document.getElementById('world'), {
    brand: { name: 'TourReady Operator', href: '#top' },
    diveScroll: 1.5,
    connScroll: 0.9,     // unused — Architecture A ships connectors: []
    hint: 'scroll to begin the load-out',
    nav: true,
    atmosphere: true,
    sections: LOAD_OUT_SECTIONS,
    connectors: [],      // Architecture A — legs chain directly, no fly-over
  });

  Theme — set on the container (or :root) to lock the engine to the exact
  TourReady tokens (tourready-operator/app/globals.css), zero drift between
  the film and the site it opens into:

    .sw-root {
      --sw-bg: #0b1120;
      --sw-ink: #f8fafc;
      --sw-ink-soft: #94a3b8;
      --sw-accent: #f97316;
    }
*/
