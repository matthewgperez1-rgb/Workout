/* ============================================================
   RANGE BOARD — storage layer (localStorage only, single device)
   ============================================================ */

const RB_KEYS = {
  workouts: 'rb_workouts_v1',   // { [dateISO]: Workout }
  library:  'rb_library_v1',    // [ { id, name, source:'custom', ...workoutLike } ]
  logs:     'rb_logs_v1',       // [ LogEntry ]
  prs:      'rb_prs_v1'         // { [movementNameLower]: { value, unit, date, logId } }
};

function rbLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error('rbLoad failed for', key, e);
    return fallback;
  }
}

function rbSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('rbSave failed for', key, e);
    return false;
  }
}

/* ---------- Workouts (calendar) ---------- */

function rbGetAllWorkouts() {
  return rbLoad(RB_KEYS.workouts, {});
}

function rbGetWorkout(dateISO) {
  const all = rbGetAllWorkouts();
  return all[dateISO] || null;
}

function rbSaveWorkout(workout) {
  const all = rbGetAllWorkouts();
  all[workout.date] = workout;
  rbSave(RB_KEYS.workouts, all);
}

function rbDeleteWorkout(dateISO) {
  const all = rbGetAllWorkouts();
  delete all[dateISO];
  rbSave(RB_KEYS.workouts, all);
}

/* ---------- Library ---------- */

function rbGetLibrary() {
  return rbLoad(RB_KEYS.library, []);
}

function rbSaveToLibrary(entry) {
  const lib = rbGetLibrary();
  const idx = lib.findIndex(e => e.id === entry.id);
  if (idx >= 0) lib[idx] = entry; else lib.push(entry);
  rbSave(RB_KEYS.library, lib);
}

function rbDeleteFromLibrary(id) {
  const lib = rbGetLibrary().filter(e => e.id !== id);
  rbSave(RB_KEYS.library, lib);
}

/* ---------- Logs ---------- */

function rbGetLogs() {
  return rbLoad(RB_KEYS.logs, []).sort((a, b) => b.date.localeCompare(a.date));
}

function rbAddLog(entry) {
  const logs = rbLoad(RB_KEYS.logs, []);
  logs.push(entry);
  rbSave(RB_KEYS.logs, logs);
  rbUpdatePRsFromLog(entry);
}

function rbDeleteLog(id) {
  const logs = rbLoad(RB_KEYS.logs, []).filter(l => l.id !== id);
  rbSave(RB_KEYS.logs, logs);
}

/* ---------- PRs ---------- */
// Very small heuristic PR tracker: keyed by workout name (benchmark) for time-based PRs,
// and by movement name + unit for load-based PRs the user logs in notes/score field.

function rbGetPRs() {
  return rbLoad(RB_KEYS.prs, {});
}

function rbUpdatePRsFromLog(entry) {
  if (!entry.score) return;
  const prs = rbGetPRs();
  const key = (entry.workoutName || entry.title || 'workout').toLowerCase().trim();
  const existing = prs[key];

  // For "For Time" scores, lower is better; store raw string + parsed seconds if possible
  const seconds = rbParseTimeToSeconds(entry.score);
  const candidate = { value: entry.score, seconds: seconds, date: entry.date, logId: entry.id, format: entry.mainFormat || '' };

  if (!existing) {
    prs[key] = candidate;
    entry.isPR = true;
  } else if (seconds != null && existing.seconds != null) {
    if (seconds < existing.seconds) {
      prs[key] = candidate;
      entry.isPR = true;
    }
  } else {
    // Non-time score (reps/weight) — best-effort: bigger number wins
    const a = parseFloat(entry.score);
    const b = parseFloat(existing.value);
    if (!isNaN(a) && !isNaN(b) && a > b) {
      prs[key] = candidate;
      entry.isPR = true;
    }
  }
  rbSave(RB_KEYS.prs, prs);
}

function rbParseTimeToSeconds(str) {
  if (!str) return null;
  const m = String(str).trim().match(/^(\d+):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

