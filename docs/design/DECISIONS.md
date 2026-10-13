# Training Log 3.0 design specification

Primary reference: the seven user-provided SoftDoes STRYDE screenshots, particularly “The parts, up close” and “Today, at a glance.” Reference files are retained outside the public repository; no SoftDoes artwork or screen is incorporated in production.

Five reviewable HTML compositions: today.html, plan.html, lift.html, mobility.html, progress.html. These are explicitly labelled design-only compositions, contain no fabricated completed performance, and use the actual new view components and styles. QA screenshots of the running app are separate evidence.

## Original visual system

- Cold charcoal #0b0d10 canvas; graphite #14171c / #1c2027 surfaces; white #f7f7f8; secondary copy #a6acb7.
- Orange #ff762e: primary gym action / lifting effort. Lime #cbfa65: completed sets / achievement. Blue #83b8ff: running / timing / scheduling. Violet #b4a0ff: mobility / recorded heart rate.
- Self-hosted Space Grotesk display and Manrope UI variable fonts, with included SIL OFL licences.
- One prominent focal panel per screen. Today foregrounds the weekly four-lift goal and one next lift. Active Lift foregrounds the first unfinished exercise and large set inputs. Progress shows actual records or a concise empty state.
- 48–50px set/action targets, 16px or larger text inputs, five primary nav destinations. Mobility has a direct Today action; Settings has its own header control.
- Abstract joint/category vectors and the original TL monogram are code-native, not copied reference assets or purported anatomical demonstrations.
- No RIR fields, fictional records, steps, calories, streaks, motivational slogans or invented readiness scores.

## Practical decisions and red-team checks

1. A weekly ring must show completed lifting sessions against a stated target of four, never an invented fitness score.
2. A chart only renders with two or more actual records. A single session establishes a baseline.
3. Completed sets remain visible and stored when replacing remaining work. A change of movement pattern requires an explicit acknowledgement.
4. Moving sessions keeps source dates / Tredict identifiers. Multiple sessions can share a date; recovery warnings flag congestion without claiming adaptive coaching.
5. Screen compositions are not proof of deployed behavior. Review actual Chromium / WebKit mobile captures and functional tests before release.
6. Unverified Free Exercise DB photographs are excluded because the maintainer explicitly cannot establish image rights. Authored technique guides are bundled offline for every library movement; this release does not falsely promise verified exercise videos.
7. No always-on hidden cloud synchronization. A repository-scoped token stays in memory, automatic backups run only during a connected session, and conflicts require review.
