# Reference documents

## What is in here

**`CalOSHA-GISO-3650-3664-operating-rules-poster.pdf`**

A two-page **Cal/OSHA** wall poster, "Operating Rules for Industrial Trucks",
reproducing California General Industry Safety Orders **§3650(t)** and
**§3664(a)** — Title 8, California Code of Regulations.

- Jurisdiction: **California only.** These are state rules, not federal.
- Currency: its own footer reads "current through Register 2014, No. 16
  (operative 7-1-2014)". Sheet is dated Dec-15.
- Format: scanned images. There is no text layer, so it is not searchable or
  greppable.

It was previously committed as `OSHA-3650.pdf`, which read as federal OSHA
publication 3650. It is not that document. The "3650" is the California section
number. Renamed 2026-09-11 after the red-team audit (finding F-11).

## What is NOT in here, and matters

The course teaches against **federal 29 CFR 1910.178**, and this repository
contains no copy of it. Every federal claim in `lib/curriculum.ts` is currently
unsourced within the repo.

Worth adding before anyone relies on the compliance framing:

1. **29 CFR 1910.178** in full, particularly:
   - `(l)` operator training — the three-part structure, refresher triggers, the
     three-year evaluation, and `(l)(6)` certification contents
   - `(n)(7)` grades and travel direction — the loaded/unloaded distinction the
     curriculum now teaches is cited here to the Cal/OSHA poster's loaded-truck
     clause, and the federal text for the unloaded case has not been read
2. Whichever **state plan** applies where the training is delivered. California
   is a state-plan state with its own §3668 training rule; a claim of federal
   sufficiency does not automatically carry over.
3. **ANSI/ITSDF B56.1** (powered industrial trucks) and **ANSI A92** (MEWPs) if
   the MEWP module's Type/Group claims are to be verified. Both are paywalled
   consensus standards, and ANSI is not itself law — how it binds is a question
   for counsel.

## Sourcing rule for this project

Anything asserted as a legal requirement in the curriculum should name where it
came from. Where a claim rests on the Cal/OSHA poster, say so and say that it is
California-specific — as the grade-rule callout in `lib/curriculum.ts` now does.
