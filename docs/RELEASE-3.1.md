# Training Log 3.1

This update keeps schema 2 and rangeboard_v2. No workout is cleared, reclassified or numerically converted during upgrade. A pre-3.1 recovery copy is stored before the first write. The actual privately supplied two-lift/one-run export was tested locally through normalization, saving, JSON serialization and merging: all lifts, runs, set values and prior audit entries remained identical. That export is not included in the public repository.

## Added

- Settings personal profile: optional name, lb/kg display, dated bodyweight points, calendar-spaced line chart, accessible point buttons and measurement corrections with recovery/audit copies. Existing measurements default to pounds; changing display converts presentation, not stored values. Waist remains optional in inches.
- Tap a set number to mark warm-up/working. Completed warm-ups remain in history and the session debrief but are excluded from exercise load/repetition progression.
- Exercise options: skipped/log-later status, explicit total/per-hand/plates/assistance/added-load conventions, per-side/total repetitions, editable dose, and explicit goblet/front-squat identity clarification. Numeric values do not change when conventions are clarified.
- Pair a superset, alternate its movements, and start rest after both sets in the round. Unequal-length pairs rest after remaining unpaired rounds.
- Retrospective logging mode, also recognized for older next-day entries without rewriting them. No automatic rest timer during backfill. Entry timestamps are never claimed as workout duration.
- Dose callout for power exercises. Extra repetitions are not scored as automatic progress.
- Finish-workout debrief and History recap split strength, power, core, mobility and warm-up sets. Skipped and unrecorded work stay explicit. Comparable previous loads and recorded repetitions appear without a performance rating.
- Repeat previous working sets before completing any new set; completion flags and timestamps are reset. Last-used substitutions are suggested first among matching candidates, with independent variation history.

## Verification and limits

Node regressions, mobile Chromium/WebKit browser regressions, narrow-layout and accessibility checks run before publication. Added coverage exercises profile corrections without changing pre-existing lifts/runs, set types/conventions, and superset/backfill timer behavior. Published assets are checked byte-for-byte and the live site is smoke tested. Physical iPhone/PWA checks remain user-device verification.

Backup remains the explicit GitHub-session connection described in Settings. This update does not create a remote backup of the user's private export. No dietary module, body-composition estimate, weight target, RIR fields, or invented workout duration has been added.
