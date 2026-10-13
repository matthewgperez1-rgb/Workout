# Training Log

Single-user training journal: strength, running, mobility, and progress.

## Live app

https://matthewgperez1-rgb.github.io/Workout/

## Design

A standalone app built with HTML, CSS and native JavaScript modules. The old layered stylesheet/script stack has been retired from the production entry point, but the historical files remain in the repository for reference.

Design references: Runna (weekly calendar and rescheduling), Liftosaur (compact set logging), and openGym/GymCoach (exercise-first workout entry). No third-party source code or art was copied.

## Features

- **Today:** planned strength and run independently, plus a week-at-a-glance selector.
- **Plan:** actual day-by-day weekly calendar with distinct run and lift cards. Tap an activity to view the plan, record it, or move it within a +/- 7-day window. Original Tredict workouts are not changed.
- **Workout:** large, sticky 60/90/120-second rest timer, optional warm-up/cooldown, individual sets, weights, reps, completed checkboxes, substitutions, add/remove sets and local autosaving.
- **Running:** manual Garmin results (miles, time, perceived effort, optional heart rate/cadence).
- **Mobility:** eight targeted, independent routines, separate from workout completion.
- **History/Progress:** recorded workouts and totals only, not planned workouts.
- **Library:** 121 built-in exercises grouped by muscle group and equipment, available offline. Filter/search for substitutions, add sets to an existing workout, and replace exercises when equipment is occupied.
- **Settings:** available from the Library screen; JSON export/import and optional manual GitHub sync.

## Storage compatibility

Original localStorage key `rangeboard_v2` is intentionally retained so previous data does not disappear after this visual rebuild. Schema version remains 2. Existing lifts, runs, and mobility records remain readable. No data is automatically posted publicly or to GitHub.

GitHub backup is manual. The optional token is used only in the current session and is not written to source files or to localStorage. Users must set up repository access themselves.

## QA

GitHub Actions runs Node syntax/regression checks and headless Chromium tests at iPhone-sized viewports. Tests cover the daily dashboard, Runna-style calendar/rescheduling, set persistence, timer presets, independent mobility, and a single consistent light design system. A screenshot-based visual pass of Today, Plan and the active lift screen was also performed during the rebuild.

## Known limitations

- The first eight weeks of Tredict runs (October 12–December 5, 2026) are represented. Further runs should be imported from updated planning data.
- Exercise photographs are disabled pending a verified, reliable reference library. No broken-photo placeholders are shown.
- GitHub synchronization is **manual**, not automatic or conflict-merged.
- The program is a starting template; strength programming has not been clinically validated or automatically adapted to every missed workout.
- GitHub Pages needs to remain configured for Actions-based deployment.

## Installed PWA and saving

Training entries autosave to localStorage on the device as weights/reps are typed and checkboxes are changed. Installing the app to an iPhone home screen does **not** create a GitHub/cloud backup. Depending on iOS installation context, the installed PWA can have separate storage from Safari or an in-app browser, so export/import JSON when migrating existing records. Avoid relying on local storage as the sole copy of irreplaceable training history.
