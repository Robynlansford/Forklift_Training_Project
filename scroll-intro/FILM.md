# THE LOAD-OUT — scroll intro film spec

Scroll-driven camera film for **TourReady Operator**. One continuous take through a
single night of a concert load-out, scrubbed by scroll position.

## Architecture

**Architecture A — continuous forward take.** No connectors. The camera only ever
glides forward, first frame to last. Chosen because this is a grounded, realistic
walkthrough: architecture B's aerial pull-out reverses camera direction at every seam,
which reads as a rewind stutter in a real space (it only works for miniature/diorama
worlds).

Consequences:
- N legs, **no connector clips** — 5 gens instead of 9.
- Legs render **sequentially**: each leg's `start_image` is the *actual last frame*
  extracted from the previous leg's rendered video. Never the source still.
- **No `end_image` anywhere.** An end-image of a wide shot forces the camera to pull
  back — the single biggest cause of seam stutter.
- Only **leg 1** consumes a generated still. Every other leg starts from real pixels,
  so every seam is frame-identical by construction.
- Section posters are extracted from the rendered legs (first frame), so posters match
  their clip exactly — no landscape→portrait or still→video flash.

## Motion handoff contract

Non-negotiable, present verbatim in every leg prompt:

1. Every leg **begins** already drifting slowly forward, continuing the previous drift.
2. Mid-leg the camera is **free** — orbits, crane-ups, lateral tracking are all safe,
   because a single leg is one continuous render with no seam inside it.
3. Every leg **ends** settling into a slow, steady, level forward drift toward the next
   destination (final ~1 second).

Reversals are only fatal *across* seams. Scroll is a scrubber — visitors scroll up too,
so every move also plays backward; consistent seam velocity matters in both directions.

## Style preamble

Byte-identical in every prompt. This is what makes the world cohere.

> Cinematic anamorphic night photography, shot on 35mm film with a wide anamorphic lens,
> shallow depth of field, heavy volumetric atmospheric haze and drifting fog, wet
> reflective concrete and asphalt, lit almost entirely by warm sodium-vapor amber and
> safety-orange industrial practical lights against deep navy-black crushed shadows,
> extreme contrast, fine organic film grain, teal-and-amber cinematic color grade, moody
> high-end cinematography, professional live-event concert touring production
> environment. Color palette: deep navy-black #0B1120, safety orange #F97316, warm amber
> #F59E0B, muted steel grey #94A3B8. No people's faces visible, no text, no letters, no
> logos, no watermarks, no signage.

Palette is lifted directly from the existing TourReady design system so the film and the
site are the same world.

## The journey

Each leg maps to a curriculum module — the film dramatizes the syllabus rather than
decorating it.

| Leg | Beat | Curriculum |
|---|---|---|
| 1 | Rain-soaked yard → arrive at the glowing trailer mouth | Approach |
| 2 | Up the ramp, down the trailer between case walls → fork pocket | M1 Truck Pack · M2 Fork Slots |
| 3 | Out into the dock — crew, beacons, carts → tunnel mouth | M3 Ground Crew |
| 4 | Arena floor → crane **up** to the rigging grid | M4 Physics · M6 Rigging |
| 5 | Descend to the empty floor → last case at 02:00 | M5 · M7 Fatigue |

## Generation settings

| Setting | Value | Why |
|---|---|---|
| Model | `seedance_2_0` | Accepts `start_image`; frame-locks seams |
| Resolution | `1080p` (`mode: std`) | Native master; never downscale then upscale |
| Duration | 6 s / leg | Cost is linear at 9 cr/s — length buys nothing |
| `generate_audio` | **`false`** | Defaults **true** and silently triples the bill |
| `bitrate_mode` | `high` | Cleaner source for scrub encoding |
| `genre` | `drama` | Restrains motion vs. `action` |
| Aspect | `16:9` | Full-bleed scroll hero |

**One model for the entire chain.** Mixing renderers keeps position continuity but the
grain/motion character shift reads as a pop. Only sanctioned exception is a `kling3_0`
fallback for a single clip the Seedance content filter refuses.

## Cost model

Measured against this account, 2026-07-26:

| Item | Rate |
|---|---|
| Still, `nano_banana_pro` 2k | 2 cr |
| Video 1080p | 9 cr/s |
| Video 720p | 4.5 cr/s |

Planned: 3 candidate stills (6) + 5 legs × 6 s @ 1080p (270) = **276 cr** of 502.6,
leaving ~225 for re-rolls. Cost is strictly linear in duration, so **fewer, longer legs
beat more, shorter ones** — same price, fewer seams to fail.

## Assets

| File | Role |
|---|---|
| `stills/cand_A_yard.png` | Leg 1 `start_image` — the opener |
| `stills/cand_B_machine.png` | OG/social image + `prefers-reduced-motion` static hero |
| `stills/cand_C_mouth.png` | Reference/unused — leg 1 arrives at this composition |
| `frames/leg<N>_last.png` | Extracted boundary frame → next leg's `start_image` |
| `video/raw/leg<N>.mp4` | Raw 1080p master from Seedance |
| `video/enc/leg<N>.mp4` | Scrub-optimised encode (GOP 8, crf 20, `-an`) |

## Encoding

Scrubbing means setting `currentTime` from scroll. Two rules:

1. **Seekability, not keyframe density.** Hosts that don't serve HTTP byte-range requests
   pin `video.seekable` to `[0,0]` and clamp every seek to frame 0 — the video looks
   frozen. Fix is to fetch each clip as a **Blob** and play from an in-memory object URL.
   Because of that, all-intra is unnecessary.
2. **Don't trade quality for smoothness.** Native 1080p, `crf 20`, small GOP (`-g 8`,
   ~8 MB) rather than all-intra (~25 MB). Strip audio, faststart, light `unsharp` to
   counter video softness.

```
ffmpeg -i raw.mp4 -an -vf "unsharp=5:5:0.8:5:5:0.0" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
  -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart enc.mp4
```

## Upscale pass (post-chain)

Applied **after** the full 5-leg chain was rendered and every seam verified —
never mid-chain, since upscaling before chaining would desync a leg's start_image
from its neighbour's actual last frame.

All 5 legs run through **Topaz Video** (`provider: topaz`, `resolution: 2160p`,
`aspect_ratio: 16:9`) in parallel, each addressed by its original generation job_id
as `video_id`. Confirmed output: 1920×1080 → 3840×2160, duration unchanged
(6.04 s / 145 frames per leg), zero frame drift.

**Seam integrity re-verified at 4K** — extracted boundary frames from all 5 raw4k
masters and diffed all 4 seams side-by-side; every seam remained frame-identical.
This was not guaranteed a priori (each leg upscales as an independent job with its
own temporal context) but held in practice.

**Delivery decision:** the 4K masters (108 MB total) are too heavy to serve as the
live scrubbed hero — blobs must fully download before they're seekable, so clip
weight is load latency. Instead, **downsampled the Topaz-enhanced 4K back to
1080p** (`scale=1920:-2:flags=lanczos`) for the actual site delivery. This
inherits Topaz's denoise/sharpen pass, producing a measurably cleaner 1080p than
the original direct 1080p encode (verified via 1:1 crop on diamond-plate texture:
visibly less noise, tighter highlight rendering) — at nearly the same file size
(33 MB vs. 31 MB for the original direct encode).

| Asset tier | Location | Size | Use |
|---|---|---|---|
| Raw 1080p (direct) | `video/raw/leg*.mp4` | 43–35 MB/leg | superseded — kept for reference |
| Raw 4K (Topaz) | `video/raw4k/leg*.mp4` | 46–68 MB/leg | archival master; source for cinema-mode |
| **Hero delivery** | `video/enc_hero/leg*.mp4` | 5–9 MB/leg (33 MB total) | **wire this into `sections.js` `clip:`** |
| Encoded 4K | `video/enc4k/leg*.mp4` | 17–31 MB/leg (108 MB total) | optional lightbox/fullscreen viewer only |

## Known hazards

- **Seam pop** → a leg was started from the source still instead of the previous leg's
  real last frame. Always extract with `ffmpeg -sseof -0.15 ... -frames:v 1`.
- **Seam stutter / camera jumps backward** → velocity reversed across a seam. Check the
  leg's last frame *before* chaining the next; it must look like a frame from a gentle
  forward glide.
- **NSFW false-positive** (`status: "nsfw"`) → the filter flags innocuous industrial
  interiors. Re-roll first (often non-deterministic), then strip trigger words and add
  "empty, unoccupied, no people, architectural", then fall back to `kling3_0` with the
  same start frame.
- **Preset hijack** → the API may suggest a canned preset. Decline via
  `declined_preset_id`; a preset overrides the camera choreography and breaks the seam
  contract.
