# Training Log 3.0 release evidence

Baseline: a568323225e8e718f38549d98451f4b36ec2f48c, October 13, 2026. The original source remains in Git history and a local baseline snapshot. The rangeboard_v2 key and schema 2 are retained; changes are additive. Existing phone data is not accessible from this development environment.

## Required validation

| Check | Status | Evidence / limit |
|---|---|---|
| Syntax and pure storage/scheduling/date/analytics regressions | PASS | 35 Node tests at initial implementation |
| Chromium interaction, persistence, import/export, substitutions, timer, offline restart | PENDING | Review-branch GitHub Actions |
| WebKit engine interaction and layout | PENDING | Review-branch GitHub Actions; not physical Safari |
| Real browser screenshots at 360/390/430px | PENDING | QA artifact, must be visually inspected |
| Old schema 2 roundtrip / recovery copy | PASS | Original numeric values and notes retained in fixture roundtrip |
| Actual user phone dataset migrated | NOT RUN | App remains compatible; exact records require the user’s exported dataset |
| Physical iPhone Safari / installed iOS PWA | NOT RUN | No physical iPhone is connected to this environment |
| Simulated 60-minute rest timer and pause/restart | PENDING | Browser clock test |
| Real 45–60-minute gym workout | NOT RUN | Cannot substitute browser automation for a human gym session |
| Production source / deployment alignment | PENDING | Verify main SHA, QA, Pages deployment and live app |

## Red-team risks addressed

- Completed sets are preserved when substituting remaining sets. History corrections retain a pre-edit snapshot and an audit entry.
- Import and GitHub restore merge new records and retain divergent records as explicit conflicts. GitHub writes use the contents SHA to detect concurrent writes.
- Token is memory-only; automatic backup is opt-in and active only while the app is open and connected. Offline data remains local and pending until reconnect.
- Legacy reschedule target overrides are excluded from native-day template resolution to avoid duplicate ghost sessions.
- Scheduled workouts preserve source dates and original Tredict identifiers. Completed or started sessions cannot be moved silently.
- Calendar-date arithmetic uses noon UTC and dates stay explicit. Local or selected timezone controls today, not historical records.
- Reps, seconds, meters and minutes have explicit units. Timed work is excluded from reps × load volume.
- No external exercise photograph matching or unverified image rights. Original icons and authored offline guides are bundled.
- Service-worker update activation is explicit when an active install already exists; new release assets are cached as a complete set.

## Limits to communicate at handoff

- Physical iOS Safari/PWA and user-specific data have not been personally verified by the build environment.
- Technique guides are offline text with original category graphics; verified instructional video/photo coverage is not claimed.
- Tredict block is a preserved static source ending December 5, 2026. Calendar moves do not synchronize to Tredict.
- Training guidance is conservative and transparent; the app is not scientifically validated adaptive programming.
