/* ============================================================
   RANGE BOARD — static data
   Benchmark library + section templates + helpers
   ============================================================ */

const RB_SECTION_TEMPLATES = {
  training: [
    { key: 'warmup',   label: 'Warm-up' },
    { key: 'strength', label: 'Strength / Skill' },
    { key: 'main',     label: 'Main Piece' },
    { key: 'finisher', label: 'Functional Finisher' },
    { key: 'cooldown', label: 'Cool Down' }
  ],
  run: [
    { key: 'warmup',   label: 'Warm-up' },
    { key: 'main',     label: 'The Run' },
    { key: 'cooldown', label: 'Cool Down / Mobility' }
  ],
  rest: [
    { key: 'notes', label: 'Notes' }
  ]
};

const RB_WORKOUT_TYPES = [
  { value: 'training', label: 'Training Day' },
  { value: 'run',       label: 'Run Day' },
  { value: 'rest',      label: 'Rest Day' }
];

const RB_MAIN_FORMATS = [
  'For Time', 'AMRAP', 'EMOM', 'Tabata', 'Strength Sets', 'Custom'
];

const RB_RUN_TYPES = ['Easy', 'Tempo', 'Interval', 'Long', 'Sprint'];

// Benchmark WOD library — preloaded, always re-loggable, never deleted by user actions
const RB_BENCHMARKS = [
  {
    id: 'bm-helen',
    name: 'Helen',
    format: 'For Time',
    description: '3 rounds: 400m run, 21 KB swings (53/35 lb), 12 pull-ups',
    movements: [
      { name: 'Run', detail: '400m' },
      { name: 'KB Swings', detail: '21 reps @ 53/35 lb' },
      { name: 'Pull-ups', detail: '12 reps' }
    ],
    rounds: 3
  },
  {
    id: 'bm-fran',
    name: 'Fran',
    format: 'For Time',
    description: '21-15-9: Thrusters (95/65 lb), Pull-ups',
    movements: [
      { name: 'Thrusters', detail: '95/65 lb' },
      { name: 'Pull-ups', detail: '' }
    ],
    rounds: '21-15-9'
  },
  {
    id: 'bm-cindy',
    name: 'Cindy',
    format: 'AMRAP',
    description: '20 min AMRAP: 5 pull-ups, 10 push-ups, 15 air squats',
    movements: [
      { name: 'Pull-ups', detail: '5 reps' },
      { name: 'Push-ups', detail: '10 reps' },
      { name: 'Air Squats', detail: '15 reps' }
    ],
    timeCap: 20
  },
  {
    id: 'bm-murph',
    name: 'Murph',
    format: 'For Time',
    description: '1 mile run, 100 pull-ups, 200 push-ups, 300 air squats, 1 mile run (partition as needed, vest optional)',
    movements: [
      { name: 'Run', detail: '1 mile' },
      { name: 'Pull-ups', detail: '100 reps' },
      { name: 'Push-ups', detail: '200 reps' },
      { name: 'Air Squats', detail: '300 reps' },
      { name: 'Run', detail: '1 mile' }
    ],
    rounds: 1
  },
  {
    id: 'bm-grace',
    name: 'Grace',
    format: 'For Time',
    description: '30 Clean & Jerks (135/95 lb)',
    movements: [
      { name: 'Clean & Jerk', detail: '135/95 lb' }
    ],
    rounds: '30 reps'
  },
  {
    id: 'bm-dt',
    name: 'DT',
    format: 'For Time',
    description: '5 rounds: 12 deadlifts, 9 hang power cleans, 6 push jerks (155/105 lb)',
    movements: [
      { name: 'Deadlift', detail: '12 reps @ 155/105 lb' },
      { name: 'Hang Power Clean', detail: '9 reps' },
      { name: 'Push Jerk', detail: '6 reps' }
    ],
    rounds: 5
  },
  {
    id: 'bm-annie',
    name: 'Annie',
    format: 'For Time',
    description: '50-40-30-20-10: Double-unders, Sit-ups',
    movements: [
      { name: 'Double-unders', detail: '' },
      { name: 'Sit-ups', detail: '' }
    ],
    rounds: '50-40-30-20-10'
  }
];

function rbUid(prefix) {
  return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function rbTodayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function rbDateISO(d) {
  const c = new Date(d);
  c.setMinutes(c.getMinutes() - c.getTimezoneOffset());
  return c.toISOString().slice(0, 10);
}

function rbFormatDateLong(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

function rbFormatDateShort(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function rbMakeEmptySections(type) {
  const tmpl = RB_SECTION_TEMPLATES[type] || RB_SECTION_TEMPLATES.training;
  return tmpl.map(s => ({
    id: rbUid('sec'),
    key: s.key,
    title: s.label,
    content: '',
    done: false
  }));
}

function rbMakeEmptyWorkout(dateISO, type) {
  type = type || 'training';
  return {
    id: rbUid('wo'),
    date: dateISO,
    type: type,
    title: '',
    mainFormat: type === 'training' ? 'For Time' : (type === 'run' ? 'Easy' : ''),
    timerConfig: null,
    sections: rbMakeEmptySections(type),
    completed: false,
    completedAt: null
  };
}
