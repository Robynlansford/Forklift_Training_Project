#!/bin/bash
# chain.sh — scroll-world Architecture A helper.
# Usage:
#   ./chain.sh grab <leg> <url>   download a rendered leg + extract boundary frames + review strip
#   ./chain.sh enc  <leg>         scrub-optimised encode of a leg
#   ./chain.sh encall             encode every raw leg present
#
# Architecture A: each leg's start_image is the PREVIOUS leg's actual last frame.
# Never the source still — that is what guarantees frame-identical seams.
set -euo pipefail
cd "$(dirname "$0")"

grab() {
  local n="$1" url="$2"
  echo "→ downloading leg${n}"
  curl -sL -o "video/raw/leg${n}.mp4" "$url"

  # nb_frames is authoritative for an exact last-frame select
  local nf
  nf=$(ffprobe -v error -select_streams v:0 -count_frames \
        -show_entries stream=nb_read_frames -of csv=p=0 "video/raw/leg${n}.mp4")
  local last=$(( nf - 1 ))
  local q1=$(( nf / 3 )) q2=$(( nf * 2 / 3 ))

  echo "→ leg${n}: ${nf} frames; extracting 0 and ${last}"
  ffmpeg -y -v error -i "video/raw/leg${n}.mp4" \
    -vf "select='eq(n\,0)'"      -vsync 0 -frames:v 1 "frames/leg${n}_first.png"
  ffmpeg -y -v error -i "video/raw/leg${n}.mp4" \
    -vf "select='eq(n\,${last})'" -vsync 0 -frames:v 1 "frames/leg${n}_last.png"

  # 4-up motion review: does the camera advance monotonically and settle forward?
  ffmpeg -y -v error -i "video/raw/leg${n}.mp4" \
    -vf "select='eq(n\,0)+eq(n\,${q1})+eq(n\,${q2})+eq(n\,${last})',scale=640:-2,tile=2x2:padding=6:color=0x111827" \
    -vsync 0 -frames:v 1 "frames/leg${n}_strip.jpg"

  ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration \
    -of default=nw=1 "video/raw/leg${n}.mp4"
  echo "✓ frames/leg${n}_last.png  → upload as next leg's start_image"
}

# Native 1080p, small GOP (not all-intra), audio stripped, faststart.
# unsharp counters inherent video softness vs the 2k stills.
# crf 23: measured against raw at 1:1 on diamond-plate texture, visually
# indistinguishable from crf 20 at ~55% the size. Blobs must fully download
# before they are seekable, so clip weight is load latency, not just bandwidth.
# Retained film grain acts as dither against shadow banding on the dark legs.
enc() {
  local n="$1"
  echo "→ encoding leg${n}"
  ffmpeg -y -v error -i "video/raw/leg${n}.mp4" -an \
    -vf "unsharp=5:5:0.8:5:5:0.0" \
    -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
    -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart \
    "video/enc/leg${n}.mp4"
  local raw enc_
  raw=$(du -m "video/raw/leg${n}.mp4" | cut -f1)
  enc_=$(du -m "video/enc/leg${n}.mp4" | cut -f1)
  echo "✓ leg${n}: ${raw}MB → ${enc_}MB"
}

encall() { for f in video/raw/leg*.mp4; do
             [ -e "$f" ] || continue
             n=$(basename "$f" .mp4); n=${n#leg}; enc "$n"
           done; }

case "${1:-}" in
  grab)  grab "$2" "$3" ;;
  enc)   enc "$2" ;;
  encall) encall ;;
  *) echo "usage: $0 {grab <leg> <url>|enc <leg>|encall}"; exit 1 ;;
esac
