/**
 * Hero photography for each module.
 *
 * Files live at `public/images/modules/<slug>.jpg` — the key IS the filename,
 * so adding a module photo means dropping in `<slug>.jpg` and adding an alt line.
 * Alt text describes what is actually visible in the frame.
 */

export interface ModuleImage {
  src: string;
  alt: string;
}

const ALT: Record<string, string> = {
  "basic-controls":
    "Two counterbalance forklifts facing each other across an amphitheater floor, each carrying a pallet-mounted road case, operators seated with hands on the controls.",
  "legal-baselines":
    "Daylight stadium load-in: an operator in a hard hat and ear defenders drives a forklift through a yard of labeled road cases.",
  "touring-credentials":
    "Wide amphitheater load-in with a forklift moving through a large hi-vis crew, truss sections staged across the deck.",
  "spotter-signals":
    "Ground crew with both arms raised, signaling to a forklift operator lifting a road case beside a truck at a daylight stadium build.",
  "truck-pack-logistics":
    "A forklift carries a road case up a timber ramp into the back of a trailer, lighting truss overhead.",
  "fork-slot-anatomy":
    "Forks entering the pockets of a large road case while hi-vis crew steady it, LED wall stacked in the background.",
  "ground-crew-choreography":
    "Four crew members walk a length of truss alongside a moving forklift, hands on the load, in front of an LED wall.",
  "staging-line-loadout":
    "A forklift carries a road case above head height through a dense staging line of cases and hi-vis crew.",
  "indoor-arena-ops":
    "Indoor arena floor at night: a forklift moves a road case past a projection screen while a crew member walks the load.",
  "outdoor-festival-ops":
    "Outdoor festival build in daylight — forklifts and crew move cases and decking under flown LED walls and line arrays.",
  "heavy-physics":
    "Night festival floor with a large LED wall flown overhead, a forklift positioning a case as a spotter signals.",
  "night-chaos":
    "Near-dark load-out: a forklift silhouetted in an alley of stacked road cases, headlights of a second machine glaring head-on through haze.",
  "rigging-coordination":
    "A forklift carries a single truss section while a spotter directs from the ground, LED wall filling the background.",
  "fatigue-pressure":
    "Late-night stage floor thick with haze — several forklifts and crew reduced to silhouettes under backlight.",
  capstone:
    "Full night load-out in progress: two forklifts working an arena floor, one raising a road case high, hi-vis crew moving between them.",
};

export function moduleImage(slug: string): ModuleImage | null {
  const alt = ALT[slug];
  if (!alt) return null;
  return { src: `/images/modules/${slug}.jpg`, alt };
}
