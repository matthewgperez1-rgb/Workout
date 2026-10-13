/* ============================================================
   RANGE BOARD — app
   ============================================================ */

const RB = { tab: 'today', calMonth: null };

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('header-date').textContent = rbFormatDateLong(rbTodayISO());
  document.getElementById('tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    goTab(btn.dataset.tab);
  });
  const d = new Date();
  RB.calMonth = { y: d.getFullYear(), m: d.getMonth() };
  goTab('today');
});

function goTab(tab) {
  RB.tab = tab;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('is-active', b.dataset.tab === tab));
  const view = document.getElementById('view');
  view.innerHTML = '';
  if (tab === 'today') renderToday(view);
  else if (tab === 'calendar') renderCalendar(view);
  else if (tab === 'library') renderLibrary(view);
  else if (tab === 'log') renderLog(view);
}

function rbToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('is-visible');
  clearTimeout(rbToast._h);
  rbToast._h = setTimeout(() => t.classList.remove('is-visible'), 2200);
}

function openModal(html) {
  const layer = document.getElementById('modal-layer');
  layer.innerHTML = `<div class="modal-backdrop"><div class="modal">${html}</div></div>`;
  layer.classList.add('is-open');
  layer.querySelector('.modal-backdrop').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) closeModal();
  });
  return layer.querySelector('.modal');
}

function closeModal() {
  const layer = document.getElementById('modal-layer');
  layer.classList.remove('is-open');
  layer.innerHTML = '';
}

/* ============================================================
   TODAY VIEW
   ============================================================ */

function renderToday(root) {
  const dateISO = rbTodayISO();
  const wo = rbGetWorkout(dateISO);

  if (!wo) {
    root.innerHTML = `
      <section class="panel empty-state">
        <div class="empty-state__eyebrow">${rbFormatDateShort(dateISO)}</div>
        <h2 class="empty-state__title">Nothing programmed today</h2>
        <p class="empty-state__body">Build it now, pull something from the library, or just start a blank session.</p>
        <div class="empty-state__actions">
          <button class="btn btn--primary" id="btn-build-today">Build Today's Workout</button>
          <button class="btn btn--ghost" id="btn-library-today">Go to Library</button>
        </div>
      </section>
    `;
    root.querySelector('#btn-build-today').addEventListener('click', () => openDayEditor(dateISO));
    root.querySelector('#btn-library-today').addEventListener('click', () => goTab('library'));
    return;
  }

  const doneCount = wo.sections.filter(s => s.done).length;
  const total = wo.sections.length;

  root.innerHTML = `
    <section class="panel today-head">
      <div class="today-head__eyebrow">${rbFormatDateShort(wo.date)} · ${wo.type.toUpperCase()}</div>
      <h2 class="today-head__title">${wo.title || (wo.type === 'run' ? wo.mainFormat + ' Run' : 'Training Session')}</h2>
      ${wo.mainFormat ? `<div class="today-head__format">${wo.mainFormat}</div>` : ''}
      <div class="progress">
        <div class="progress__bar"><div class="progress__fill" style="width:${total ? (doneCount/total*100) : 0}%"></div></div>
        <div class="progress__label">${doneCount}/${total} complete</div>
      </div>
      <div class="today-head__actions">
        <button class="btn btn--ghost btn--sm" id="btn-edit-today">Edit</button>
        ${wo.completed ? '<span class="badge badge--green">Logged</span>' : '<button class="btn btn--primary btn--sm" id="btn-log-today">Log This Workout</button>'}
      </div>
    </section>

    <section class="panel">
      <h3 class="panel__title">Timer</h3>
      <div id="timer-mount"></div>
    </section>

    <section class="sections" id="sections-mount"></section>
  `;

  rbCreateTimer(root.querySelector('#timer-mount'));
  renderSections(root.querySelector('#sections-mount'), wo);

  root.querySelector('#btn-edit-today').addEventListener('click', () => openDayEditor(wo.date));
  const logBtn = root.querySelector('#btn-log-today');
  if (logBtn) logBtn.addEventListener('click', () => {
    const displayTitle = wo.title || (wo.type === 'run' ? wo.mainFormat + ' Run' : 'Training Session');
    openLogModal(Object.assign({}, wo, { title: displayTitle }));
  });
}

function renderSections(mount, wo) {
  mount.innerHTML = wo.sections.map(sec => `
    <div class="section-card" data-sec-id="${sec.id}">
      <label class="section-card__check">
        <input type="checkbox" ${sec.done ? 'checked' : ''} data-sec-check="${sec.id}">
        <span class="section-card__box"></span>
      </label>
      <div class="section-card__body">
        <div class="section-card__title ${sec.done ? 'is-done' : ''}">${sec.title}</div>
        <div class="section-card__content">${sec.content ? rbNl2br(sec.content) : '<span class="muted">Not filled in yet.</span>'}</div>
      </div>
    </div>
  `).join('');

  mount.querySelectorAll('[data-sec-check]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.secCheck;
      const sec = wo.sections.find(s => s.id === id);
      sec.done = cb.checked;
      rbSaveWorkout(wo);
      renderSections(mount, wo);
      // refresh progress bar without full re-render
      const doneCount = wo.sections.filter(s => s.done).length;
      const total = wo.sections.length;
      const fill = document.querySelector('.progress__fill');
      const label = document.querySelector('.progress__label');
      if (fill) fill.style.width = (total ? (doneCount/total*100) : 0) + '%';
      if (label) label.textContent = `${doneCount}/${total} complete`;
      if (doneCount === total) rbToast('All sections complete — nice work.');
    });
  });
}

function rbNl2br(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .split('\n').map(l => l.trim()).filter(Boolean).map(l => `<div>• ${l}</div>`).join('');
}

/* ============================================================
   DAY EDITOR (used by Today/Calendar to build or edit a day)
   ============================================================ */

function openDayEditor(dateISO) {
  let wo = rbGetWorkout(dateISO) || rbMakeEmptyWorkout(dateISO, 'training');

  const modal = openModal(`
    <div class="modal__head">
      <h3>${rbFormatDateLong(dateISO)}</h3>
      <button class="modal__close" id="modal-close">&times;</button>
    </div>
    <div class="modal__body" id="editor-body"></div>
    <div class="modal__foot">
      <button class="btn btn--danger btn--sm" id="btn-delete-day">Delete Day</button>
      <div style="flex:1"></div>
      <button class="btn btn--ghost" id="btn-save-lib">Save to Library</button>
      <button class="btn btn--primary" id="btn-save-day">Save</button>
    </div>
  `);

  function renderEditorBody() {
    const body = modal.querySelector('#editor-body');
    body.innerHTML = `
      <label class="field">Type
        <select id="ed-type">
          ${RB_WORKOUT_TYPES.map(t => `<option value="${t.value}" ${wo.type===t.value?'selected':''}>${t.label}</option>`).join('')}
        </select>
      </label>
      <label class="field">Title
        <input type="text" id="ed-title" value="${rbAttr(wo.title)}" placeholder="e.g. Heavy Lower + Helen">
      </label>
      ${wo.type !== 'rest' ? `
      <label class="field">${wo.type === 'run' ? 'Run Type' : 'Main Format'}
        <select id="ed-format">
          ${(wo.type === 'run' ? RB_RUN_TYPES : RB_MAIN_FORMATS).map(f => `<option value="${f}" ${wo.mainFormat===f?'selected':''}>${f}</option>`).join('')}
        </select>
      </label>` : ''}
      <div class="editor-sections" id="ed-sections"></div>
    `;
    renderEditorSections();

    body.querySelector('#ed-type').addEventListener('change', (e) => {
      const newType = e.target.value;
      if (newType !== wo.type) {
        wo.type = newType;
        wo.sections = rbMakeEmptySections(newType);
        wo.mainFormat = newType === 'training' ? 'For Time' : (newType === 'run' ? 'Easy' : '');
        renderEditorBody();
      }
    });
    body.querySelector('#ed-title').addEventListener('input', (e) => wo.title = e.target.value);
    const formatEl = body.querySelector('#ed-format');
    if (formatEl) formatEl.addEventListener('change', (e) => wo.mainFormat = e.target.value);
  }

  function renderEditorSections() {
    const mount = modal.querySelector('#ed-sections');
    mount.innerHTML = wo.sections.map(sec => `
      <label class="field">${sec.title}
        <textarea data-sec="${sec.id}" rows="3" placeholder="Movements, sets, reps, notes...">${rbAttr(sec.content)}</textarea>
      </label>
    `).join('');
    mount.querySelectorAll('textarea').forEach(ta => {
      ta.addEventListener('input', () => {
        const sec = wo.sections.find(s => s.id === ta.dataset.sec);
        sec.content = ta.value;
      });
    });
  }

  renderEditorBody();

  modal.querySelector('#modal-close').addEventListener('click', closeModal);
  modal.querySelector('#btn-save-day').addEventListener('click', () => {
    rbSaveWorkout(wo);
    rbToast('Saved.');
    closeModal();
    goTab(RB.tab);
  });
  modal.querySelector('#btn-delete-day').addEventListener('click', () => {
    rbDeleteWorkout(dateISO);
    rbToast('Day cleared.');
    closeModal();
    goTab(RB.tab);
  });
  modal.querySelector('#btn-save-lib').addEventListener('click', () => {
    const libEntry = JSON.parse(JSON.stringify(wo));
    libEntry.id = rbUid('lib');
    libEntry.name = wo.title || (wo.type + ' workout');
    rbSaveToLibrary(libEntry);
    rbToast('Saved to library.');
  });
}

function rbAttr(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
}

/* ============================================================
   CALENDAR VIEW
   ============================================================ */

function renderCalendar(root) {
  const { y, m } = RB.calMonth;
  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const monthLabel = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const all = rbGetAllWorkouts();
  const todayISO = rbTodayISO();

  let cells = '';
  for (let i = 0; i < startDow; i++) cells += `<div class="cal-cell cal-cell--empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = rbDateISO(new Date(y, m, d));
    const wo = all[iso];
    const isToday = iso === todayISO;
    cells += `
      <div class="cal-cell${isToday ? ' is-today' : ''}${wo ? ' has-workout type-' + wo.type : ''}" data-date="${iso}">
        <div class="cal-cell__num">${d}</div>
        ${wo ? `<div class="cal-cell__label">${(wo.title || wo.type).slice(0, 14)}</div><div class="cal-cell__dot dot-${wo.type}"></div>` : ''}
        ${wo && wo.completed ? '<div class="cal-cell__check">✓</div>' : ''}
      </div>`;
  }

  root.innerHTML = `
    <section class="panel cal-panel">
      <div class="cal-nav">
        <button class="btn btn--ghost btn--sm" id="cal-prev">&larr;</button>
        <h3>${monthLabel}</h3>
        <button class="btn btn--ghost btn--sm" id="cal-next">&rarr;</button>
      </div>
      <div class="cal-dow">
        ${['S','M','T','W','T','F','S'].map(d => `<div>${d}</div>`).join('')}
      </div>
      <div class="cal-grid">${cells}</div>
      <div class="cal-legend">
        <span><i class="dot-training"></i> Training</span>
        <span><i class="dot-run"></i> Run</span>
        <span><i class="dot-rest"></i> Rest</span>
      </div>
    </section>
  `;

  root.querySelector('#cal-prev').addEventListener('click', () => {
    RB.calMonth.m -= 1;
    if (RB.calMonth.m < 0) { RB.calMonth.m = 11; RB.calMonth.y -= 1; }
    renderCalendar(root);
  });
  root.querySelector('#cal-next').addEventListener('click', () => {
    RB.calMonth.m += 1;
    if (RB.calMonth.m > 11) { RB.calMonth.m = 0; RB.calMonth.y += 1; }
    renderCalendar(root);
  });
  root.querySelectorAll('.cal-cell[data-date]').forEach(cell => {
    cell.addEventListener('click', () => openDayEditor(cell.dataset.date));
  });
}

/* ============================================================
   LIBRARY VIEW
   ============================================================ */

function renderLibrary(root) {
  const custom = rbGetLibrary();

  root.innerHTML = `
    <section class="panel">
      <div class="panel__row">
        <h3 class="panel__title">Benchmark WODs</h3>
      </div>
      <div class="lib-grid" id="lib-benchmarks"></div>
    </section>
    <section class="panel">
      <div class="panel__row">
        <h3 class="panel__title">Your Library</h3>
        <button class="btn btn--primary btn--sm" id="btn-new-lib">+ New</button>
      </div>
      <div class="lib-grid" id="lib-custom">${custom.length ? '' : '<p class="muted">Nothing saved yet. Build a day and tap "Save to Library", or add one here.</p>'}</div>
    </section>
  `;

  root.querySelector('#lib-benchmarks').innerHTML = RB_BENCHMARKS.map(b => `
    <div class="lib-card">
      <div class="lib-card__name">${b.name}</div>
      <div class="lib-card__format">${b.format}</div>
      <div class="lib-card__desc">${b.description}</div>
      <div class="lib-card__actions">
        <button class="btn btn--ghost btn--sm" data-schedule-bm="${b.id}">Schedule</button>
        <button class="btn btn--primary btn--sm" data-log-bm="${b.id}">Log Now</button>
      </div>
    </div>
  `).join('');

  root.querySelector('#lib-custom').innerHTML += custom.map(c => `
    <div class="lib-card">
      <div class="lib-card__name">${c.name}</div>
      <div class="lib-card__format">${c.mainFormat || c.type}</div>
      <div class="lib-card__actions">
        <button class="btn btn--ghost btn--sm" data-schedule-lib="${c.id}">Schedule</button>
        <button class="btn btn--primary btn--sm" data-log-lib="${c.id}">Log Now</button>
        <button class="btn btn--danger btn--sm" data-delete-lib="${c.id}">Delete</button>
      </div>
    </div>
  `).join('');

  root.querySelector('#btn-new-lib').addEventListener('click', () => openLibraryEditor());

  root.querySelectorAll('[data-schedule-bm]').forEach(btn => btn.addEventListener('click', () => {
    const bm = RB_BENCHMARKS.find(x => x.id === btn.dataset.scheduleBm);
    openScheduleModal(rbBenchmarkToWorkout(bm));
  }));
  root.querySelectorAll('[data-log-bm]').forEach(btn => btn.addEventListener('click', () => {
    const bm = RB_BENCHMARKS.find(x => x.id === btn.dataset.logBm);
    openLogModal(rbBenchmarkToWorkout(bm), true);
  }));
  root.querySelectorAll('[data-schedule-lib]').forEach(btn => btn.addEventListener('click', () => {
    const c = custom.find(x => x.id === btn.dataset.scheduleLib);
    openScheduleModal(c);
  }));
  root.querySelectorAll('[data-log-lib]').forEach(btn => btn.addEventListener('click', () => {
    const c = custom.find(x => x.id === btn.dataset.logLib);
    openLogModal(c, true);
  }));
  root.querySelectorAll('[data-delete-lib]').forEach(btn => btn.addEventListener('click', () => {
    if (confirm('Delete this from your library?')) { rbDeleteFromLibrary(btn.dataset.deleteLib); renderLibrary(root); }
  }));
}

function rbBenchmarkToWorkout(bm) {
  const movementText = bm.movements.map(m => m.name + (m.detail ? ' — ' + m.detail : '')).join('\n');
  return {
    id: bm.id,
    name: bm.name,
    title: bm.name,
    type: 'training',
    mainFormat: bm.format,
    workoutName: bm.name,
    sections: [
      { id: rbUid('sec'), key: 'warmup', title: 'Warm-up', content: 'General movement prep + specific prep for today\'s movements.', done: false },
      { id: rbUid('sec'), key: 'main', title: 'Main Piece', content: (typeof bm.rounds !== 'undefined' ? bm.rounds + ' rounds/reps:\n' : '') + movementText, done: false },
      { id: rbUid('sec'), key: 'cooldown', title: 'Cool Down', content: 'Easy walk + stretch the areas hit hardest today.', done: false }
    ]
  };
}

function openScheduleModal(workoutLike) {
  const modal = openModal(`
    <div class="modal__head"><h3>Schedule "${workoutLike.name || workoutLike.title}"</h3><button class="modal__close" id="modal-close">&times;</button></div>
    <div class="modal__body">
      <label class="field">Date <input type="date" id="sch-date" value="${rbTodayISO()}"></label>
    </div>
    <div class="modal__foot"><div style="flex:1"></div><button class="btn btn--primary" id="sch-save">Add to Calendar</button></div>
  `);
  modal.querySelector('#modal-close').addEventListener('click', closeModal);
  modal.querySelector('#sch-save').addEventListener('click', () => {
    const date = modal.querySelector('#sch-date').value;
    const wo = JSON.parse(JSON.stringify(workoutLike));
    wo.id = rbUid('wo');
    wo.date = date;
    wo.completed = false;
    wo.completedAt = null;
    if (!wo.type) wo.type = 'training';
    rbSaveWorkout(wo);
    rbToast('Added to ' + rbFormatDateShort(date) + '.');
    closeModal();
  });
}

function openLibraryEditor() {
  let wo = rbMakeEmptyWorkout(null, 'training');
  wo.name = '';
  const modal = openModal(`
    <div class="modal__head"><h3>New Library Workout</h3><button class="modal__close" id="modal-close">&times;</button></div>
    <div class="modal__body" id="editor-body"></div>
    <div class="modal__foot"><div style="flex:1"></div><button class="btn btn--primary" id="btn-save">Save</button></div>
  `);
  const body = modal.querySelector('#editor-body');
  body.innerHTML = `
    <label class="field">Name <input type="text" id="ed-name" placeholder="e.g. Lower Body Strength A"></label>
    <label class="field">Type
      <select id="ed-type">${RB_WORKOUT_TYPES.filter(t=>t.value!=='rest').map(t => `<option value="${t.value}">${t.label}</option>`).join('')}</select>
    </label>
    <label class="field">Main Format
      <select id="ed-format">${RB_MAIN_FORMATS.map(f => `<option value="${f}">${f}</option>`).join('')}</select>
    </label>
    <div class="editor-sections" id="ed-sections"></div>
  `;
  function renderSecs() {
    body.querySelector('#ed-sections').innerHTML = wo.sections.map(sec => `
      <label class="field">${sec.title}<textarea data-sec="${sec.id}" rows="3"></textarea></label>
    `).join('');
    body.querySelectorAll('textarea').forEach(ta => ta.addEventListener('input', () => {
      wo.sections.find(s => s.id === ta.dataset.sec).content = ta.value;
    }));
  }
  renderSecs();
  body.querySelector('#ed-type').addEventListener('change', (e) => { wo.type = e.target.value; wo.sections = rbMakeEmptySections(wo.type); renderSecs(); });
  body.querySelector('#ed-format').addEventListener('change', (e) => wo.mainFormat = e.target.value);
  body.querySelector('#ed-name').addEventListener('input', (e) => wo.name = e.target.value);

  modal.querySelector('#modal-close').addEventListener('click', closeModal);
  modal.querySelector('#btn-save').addEventListener('click', () => {
    if (!wo.name) { rbToast('Give it a name first.'); return; }
    wo.title = wo.name;
    rbSaveToLibrary(wo);
    rbToast('Saved to library.');
    closeModal();
    goTab('library');
  });
}

/* ============================================================
   LOG MODAL + LOG VIEW
   ============================================================ */

function openLogModal(workoutLike, standalone) {
  const modal = openModal(`
    <div class="modal__head"><h3>Log: ${workoutLike.title || workoutLike.name}</h3><button class="modal__close" id="modal-close">&times;</button></div>
    <div class="modal__body">
      <label class="field">Date <input type="date" id="log-date" value="${workoutLike.date || rbTodayISO()}"></label>
      <label class="field">Score / Time <input type="text" id="log-score" placeholder="e.g. 12:00 or 185 lb or 8 rounds"></label>
      <label class="field">Status
        <select id="log-status">
          <option value="RX">RX'd</option>
          <option value="Scaled">Scaled</option>
          <option value="Adjusted">Adjusted</option>
        </select>
      </label>
      <label class="field">Notes <textarea id="log-notes" rows="3" placeholder="How it felt, what you changed..."></textarea></label>
    </div>
    <div class="modal__foot"><div style="flex:1"></div><button class="btn btn--primary" id="log-save">Save Log</button></div>
  `);
  modal.querySelector('#modal-close').addEventListener('click', closeModal);
  modal.querySelector('#log-save').addEventListener('click', () => {
    const entry = {
      id: rbUid('log'),
      date: modal.querySelector('#log-date').value,
      title: workoutLike.title || workoutLike.name,
      workoutName: workoutLike.workoutName || workoutLike.name || workoutLike.title,
      type: workoutLike.type || 'training',
      mainFormat: workoutLike.mainFormat || '',
      score: modal.querySelector('#log-score').value.trim(),
      status: modal.querySelector('#log-status').value,
      notes: modal.querySelector('#log-notes').value.trim(),
      isPR: false
    };
    rbAddLog(entry);
    if (!standalone && workoutLike.date) {
      const wo = rbGetWorkout(workoutLike.date);
      if (wo) { wo.completed = true; wo.completedAt = new Date().toISOString(); rbSaveWorkout(wo); }
    }
    rbToast(entry.isPR ? 'Logged — new PR!' : 'Logged.');
    closeModal();
    goTab(RB.tab);
  });
}

function renderLog(root) {
  const logs = rbGetLogs();
  const prs = rbGetPRs();
  const prList = Object.keys(prs).map(k => ({ name: k, ...prs[k] })).sort((a,b) => a.name.localeCompare(b.name));

  root.innerHTML = `
    <section class="panel">
      <h3 class="panel__title">Personal Records</h3>
      ${prList.length ? `<div class="pr-grid">${prList.map(p => `
        <div class="pr-card">
          <div class="pr-card__name">${p.name}</div>
          <div class="pr-card__value">${p.value}</div>
          <div class="pr-card__date">${rbFormatDateShort(p.date)}</div>
        </div>`).join('')}</div>` : '<p class="muted">No PRs logged yet.</p>'}
    </section>
    <section class="panel">
      <h3 class="panel__title">History</h3>
      ${logs.length ? `<div class="log-list">${logs.map(l => `
        <div class="log-row">
          <div class="log-row__date">${rbFormatDateShort(l.date)}</div>
          <div class="log-row__main">
            <div class="log-row__title">${l.title} ${l.isPR ? '<span class="badge badge--amber">PR</span>' : ''}</div>
            <div class="log-row__meta">${l.mainFormat || ''} ${l.score ? '· ' + l.score : ''}</div>
            ${l.notes ? `<div class="log-row__notes">${l.notes}</div>` : ''}
          </div>
          <div class="log-row__side">
            <span class="badge badge--${l.status==='RX'?'green':(l.status==='Scaled'?'rust':'olive')}">${l.status}</span>
            <button class="btn btn--ghost btn--xs" data-del-log="${l.id}">Delete</button>
          </div>
        </div>`).join('')}</div>` : '<p class="muted">Nothing logged yet.</p>'}
    </section>
  `;

  root.querySelectorAll('[data-del-log]').forEach(btn => btn.addEventListener('click', () => {
    if (confirm('Delete this log entry?')) { rbDeleteLog(btn.dataset.delLog); renderLog(root); }
  }));
}

