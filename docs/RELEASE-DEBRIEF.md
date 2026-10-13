# Training Log 3.0 — release debrief

## Implemented

- One graphite visual system, self-hosted Space Grotesk / Manrope typography, original TL mark, semantic orange/lime/blue/violet accents, responsive cards and truthful graphics. Five primary navigation destinations; Mobility and Settings remain directly accessible.
- Today independently exposes planned lifting and running, unfinished sessions, actual weekly sets/mileage/mobility and a four-lift goal.
- Active Lift preserves immediate set saving, supports large completion controls, meaningful units, last-session sets, conservative progression prompts, warm-up/cooldown, safe substitutions and a sticky deadline-based 60/90/120-second timer.
- Plan keeps all original Tredict IDs and dates, supports multiple sessions per day and moves with recovery warnings. Optional Friday runs are visibly optional. Correcting an actual run date retains its source identity and adjusts its local placement.
- Garmin manual results, persistent run-entry drafts, calculated pace and optional HR/cadence/effort. No live Garmin or GPS connection is claimed.
- Nine independently saved mobility routines and a 136-movement library, each with a distinct authored offline technique guide. Matching patterns prevent inappropriate default substitutions; custom movements use stable IDs.
- Inspectable history, recoverable corrections, completed-set exercise analytics, selectable distance/pace/HR charts and run-type comparisons. Assisted resistance and timed/distance work are excluded from rep-load volume.
- Schema 2 / rangeboard_v2 compatibility, exact pre-upgrade JSON copy, recovery exports, validated merge import, retained conflicts, explicit resolutions, reschedule deletion tracking and scoped memory-only GitHub connection. Automatic backup is opt-in and only active during a connected app session.
- Real iOS PNG icons, Apple Touch metadata, safe-area layout and complete offline asset caching. Legacy root source was archived, not destroyed.

## Evidence

38 Node checks and 18 browser checks per engine passed in review QA run 38353181381 before the final guide-content audit. The final guide audit confirms 136 library entries and 136 distinct instruction sets; the release branch and main must repeat required QA before publication.

Actual Chromium and WebKit captures at 360/390/430px were inspected. The screenshots directory includes labelled before/after captures from empty isolated local storage, with no fabricated completed performances. A reduced 390×480 viewport checks focused set input against the sticky timer and bottom nav. WCAG labels, semantics and contrast are checked with axe. Deadline timer tests simulate a full hour with pauses. Offline restart preserves recorded sets; WebKit is tested with the origin server stopped to avoid a documented Playwright offline-emulation bug.

## Practical limits

Physical iPhone Safari, an installed iOS PWA, the user’s exact existing phone dataset and a human 45–60-minute gym workout are NOT RUN because they are unavailable to this development environment. WebKit automation is not a physical-device signoff.

Exercise guides are offline text with original graphics; no photo/video demonstration coverage is claimed. The Tredict block remains a static original source ending December 5, 2026; moves do not synchronize to Tredict. Recovery warnings and progression prompts are transparent heuristics, not validated adaptive coaching.

GitHub backup needs a repository-scoped fine-grained token entered on the device. Tokens are forgotten on closing the app. Offline changes remain local until reconnect. A public training-data.json is public. Export before reinstalling or clearing browser data; local recovery copies cannot survive storage erasure.

## Delivery gate

Before handing off, verify passing QA for the final main SHA, successful Publish Training Log deployment and the production app itself. Return the original live URL and these actual screenshots; do not label design compositions as implemented app captures.
