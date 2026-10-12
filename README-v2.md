# Range Board 2 — personal training log

## Current status
Mobile-first app entry point: `index.html`. Existing v1 files remain untouched.

## Schedule
Four core lifting days: Monday Upper Push, Tuesday Lower Strength, Thursday Upper Pull, Friday Lower Athletic. Saturday optional. Actual Week 1–8 Tredict planned runs are shown by calendar date; duplicate Tredict entries are intentionally not imported. Planned runs are not recorded as completed.

## Workout logs
Log each set's weight, repetitions (or seconds for timed movements), reps in reserve, completion, and notes. Run entry stores distance (miles), duration, effort, and notes. Progress displays recorded sets, best working weights and running pace. Source timestamps are ISO UTC; scheduled dates use America/New_York.

## Data safety and GitHub backup
The application automatically saves on the **current device only** in localStorage under `rangeboard_v2`.

For cross-device backups:
1. Create a **separate private GitHub repository**, such as `username/private-training-data`. Do **not** use the public Workout repository.
2. Create a **fine-grained GitHub personal access token**, restricted to that private repo, with Contents read/write. Do not put the token in source code or files.
3. Open Settings; enter `owner/repo` and token. Tap **Use credentials**, then **Back up to GitHub**.
4. On another device, enter those details and tap **Download from GitHub**. Local records are replaced on download (confirmation required). Export JSON before restoring.
5. Tokens are retained in `sessionStorage` for the current browser session. GitHub synchronization is **manual**, not background/automatic. Conflict detection prevents overwriting a changed blob.

The app cannot automatically give ChatGPT access to a private backup repository. The connected GitHub account must be granted access to that repository separately for future progress reviews.

## Known limitations / red-team QA gates
- Not yet verified in Safari/iOS, Android, or offline installation; there is no service worker or bundled icon.
- Github Pages must be enabled in repository Settings > Pages if not already active.
- GitHub backup requires user-configured credentials and private repo; not yet end-to-end tested against a live private repo.
- Editing a run on another date is limited to the scheduled-day interface; there is no standalone free-form date entry UI yet.
- Training sessions repeat weekly; the complete 12-week phased progressive program is **not** implemented.
- Planned run library covers Oct 12–Dec 5, 2026 only; original Tredict remains source of truth.
- No Google/Apple Health integration, no automatic Tredict sync, no genuine bidirectional merge, no automatic deload calculation.
- Movement-level working-weight metrics are descriptive, not estimates of muscle growth or true 1RM.
- Stored data stays local until explicit GitHub backup. No remote authentication infrastructure has been implemented.
- Review exercise substitutions and assess pain/injury constraints before relying on a programmed exercise.

## Development validation required
Full regression checks for midnight timezone rollover, past/future dates, blank/partial entries, duplicate entries, remote conflicts, import/export recovery, read/write GitHub permissions, small-screen inputs, loading/offline states, and 8-week Tredict schedule consistency.