# Training Log 3.0 release evidence

Baseline: a568323225e8e718f38549d98451f4b36ec2f48c, October 13, 2026. The original source remains in Git history and a local baseline snapshot. The rangeboard_v2 key and schema 2 are retained; changes are additive. Existing phone data is not accessible from this development environment.

## Required validation

| Check | Status | Evidence / limit |
|---|---|---|
| Syntax and pure storage/scheduling/date/analytics regressions | PASS | 38 Node tests (21 production model checks and 17 retained historical regressions) |
| Chromium interaction, persistence, import/export, substitutions, timer, offline restart | PASS | 18 browser checks; review QA run 38353181381 |
| WebKit engine interaction and layout | PASS | 18 browser checks; not physical Safari |
| Real browser screenshots at 360/390/430px | PASS | Actual Chromium/WebKit screenshots visually inspected; honest empty-state captures |
| Old schema 2 roundtrip / recovery copy | PASS | Original numeric values and notes retained in fixture roundtrip |
| Actual user phone dataset migrated | NOT RUN | App remains compatible; exact records require the user’s exported dataset |
| Physical iPhone Safari / installed iOS PWA | NOT RUN | No physical iPhone is connected to this environment |
| Simulated 60-minute rest timer and pause/restart | PASS | Deadline-based timer survives pause, navigation and restart in both engines |
| Real 45–60-minute gym workout | NOT RUN | Cannot substitute browser automation for a human gym session |
| Production source / deployment alignment | RELEASE GATE | Pages publishes only a successful QA commit matching main; final deployment and live confirmation are required at delivery |

## Browser-test scope

Chromium and WebKit each run 18 checks. Accessibility labels, semantics and contrast checks use axe WCAG 2 A/AA and 2.1 AA tags. A 390×480 reduced viewport checks focused set inputs against the sticky timer and bottom navigation; this is a keyboard-height simulation, not an actual iOS keyboard.

WebKit offline navigation uses a stopped origin server because Playwright offline emulation rejects even service-worker-only navigation (upstream issue: https://github.com/microsoft/playwright/issues/42775). No server is listening during that recovery assertion. Chromium additionally uses setOffline(true). Mocked GitHub network tests block service workers to make request interception reliable, as recommended in Playwright network documentation. These tests use TEST_ONLY_TOKEN and never send a real credential.

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
