# Training Log

A personal, phone-first strength, running and mobility PWA. Hosted at https://matthewgperez1-rgb.github.io/Workout/.

## Daily use

Open Today for the next lift and the independently planned run. During lifting, enter load and reps/time/distance, check a completed set, and use the persistent 60/90/120-second timer. Add exercises or substitute remaining work from the library; previously completed sets stay in the session. Optional warm-up, cooldown and nine targeted mobility routines are independent of the required lift.

Garmin records the run. Enter distance and elapsed time afterwards; average pace is calculated. Heart rate, cadence, effort and notes are optional. There is no Garmin connection or live GPS tracking.

Plan shows strength and running separately, preserves original Tredict identifiers, and supports multiple sessions per day. Move an unstarted session to any valid date. Recovery warnings flag congestion or nearby demanding leg work; they do not automatically redistribute training or claim injury prevention. Four regular lift days and an optional fifth remain the baseline. New lifts in weeks 4/8/12 use fewer non-power working sets; existing logs are never rewritten.

History exposes completed sets and run details. Correcting a completed record preserves a recovery snapshot and an audit entry. Progress contains actual exercise load/reps/volume trends and run distance/pace/HR records, with honest empty states. Timed and distance work is not presented as repetition volume.

The library has 121 original movements plus program/mobility variations, stable IDs, equipment/muscle filters and matching movement patterns. Authored technique guides work offline. There are no scraped exercise photographs or falsely verified video links. Custom exercises have stable UUID-based IDs and user-authored technique notes.

## Records and backup

The production localStorage key is **rangeboard_v2**, schema **2**. This release keeps it compatible and adds optional metadata, conflicts and audit lists. Before any writes to readable existing records, it saves the exact original JSON under training-log-pre-v3. Import/export supports the original schema 2 shape. Invalid existing JSON is not overwritten.

Local saving is immediate; it is not cross-device backup. iOS Safari and a Home Screen PWA can have separate records. Export JSON before clearing browser data, uninstalling or migrating. Local recovery copies also disappear if browser storage is erased.

Settings provides JSON export, previewed merge import and recovery-copy downloads. GitHub backup uses training-data.json in a selected repository. Public repositories expose that backup publicly. A fine-grained token should be scoped to that one repository, Contents read/write only; it remains in memory and is not saved in localStorage or source.

Connect and choose manual backup, or opt into backup while this app session is open. Each backup reads and merges remote records, requires explicit resolution of divergent records and writes with an expected GitHub content SHA. Offline edits queue locally. Closing the app forgets the token; reconnect to send pending edits. This is not background sync while the app is closed.

## Program and dates

program.mjs retains the original strength templates and all 32 static Tredict sessions, October 12–December 5, 2026. No later running plan is invented. Original Tredict calendar moves are not changed remotely. Device-local date is default; Settings supports explicit timezones. Stored training dates never shift during travel or midnight rollover.

## Development

Production uses buildless ES modules and one coherent stylesheet. modules/ contains date, storage, schedule, exercise-guide, analytics, timer, backup, UI and view logic. Fonts are self-hosted Space Grotesk and Manrope, with included SIL OFL licences. Icons/graphics are original SVG/CSS.

- `node --test tests/model.test.mjs tests/domain.test.mjs tests/training-core.test.mjs`
- Install `playwright@1.56.1`, then `npx playwright install --with-deps chromium webkit`.
- `BROWSER=chromium node --test tests/browser.test.mjs`
- `BROWSER=webkit node --test tests/browser.test.mjs`
- `node scripts/capture.mjs` captures actual app screens separately from labelled design compositions.
- `node scripts/build.mjs` emits the complete production dist/.

GitHub QA checks the review branch and main. Pages publishes the exact tested main commit. QA artifacts include mobile browser captures at 360/390/430px. See docs/design/DECISIONS.md and docs/RELEASE-QA.md for design intent and verification limits. Passing automation does not establish physical iPhone or human gym-session acceptance.
