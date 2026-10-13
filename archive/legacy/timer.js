/* ============================================================
   RANGE BOARD — timer engine
   Modes: stopwatch, countdown, amrap, emom, tabata
   ============================================================ */

function rbBeep(freq, dur) {
  try {
    const ctx = rbBeep._ctx || (rbBeep._ctx = new (window.AudioContext || window.webkitAudioContext)());
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq || 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.15));
    osc.start();
    osc.stop(ctx.currentTime + (dur || 0.15));
  } catch (e) { /* audio not available, ignore */ }
}

function rbFmtClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return (m < 10 ? '0' + m : m) + ':' + (sec < 10 ? '0' + sec : sec);
}

function rbCreateTimer(container) {
  let mode = 'stopwatch';
  let running = false;
  let tickHandle = null;
  let elapsed = 0;       // seconds, stopwatch/countdown display base
  let startedAt = null;
  let round = 0;
  let intervalRemaining = 0;
  let cfg = { countdownMin: 10, emomSec: 60, emomRounds: 10, workSec: 20, restSec: 10, tabataRounds: 8, tabataPhase: 'work' };

  container.innerHTML = `
    <div class="timer">
      <div class="timer__modes" id="timer-modes">
        ${['stopwatch','countdown','amrap','emom','tabata'].map(m =>
          `<button class="timer__mode-btn${m==='stopwatch'?' is-active':''}" data-mode="${m}">${m}</button>`
        ).join('')}
      </div>

      <div class="timer__config" id="timer-config"></div>

      <div class="timer__display">
        <div class="timer__round" id="timer-round"></div>
        <div class="timer__clock" id="timer-clock">00:00</div>
        <div class="timer__phase" id="timer-phase"></div>
      </div>

      <div class="timer__controls">
        <button class="btn btn--ghost" id="timer-reset">Reset</button>
        <button class="btn btn--primary" id="timer-startpause">Start</button>
        <button class="btn btn--ghost" id="timer-round-add" style="display:none;">+1 Round</button>
      </div>
    </div>
  `;

  const elClock = container.querySelector('#timer-clock');
  const elRound = container.querySelector('#timer-round');
  const elPhase = container.querySelector('#timer-phase');
  const elStartPause = container.querySelector('#timer-startpause');
  const elRoundAdd = container.querySelector('#timer-round-add');
  const elConfig = container.querySelector('#timer-config');

  function renderConfig() {
    if (mode === 'stopwatch') {
      elConfig.innerHTML = '';
    } else if (mode === 'countdown') {
      elConfig.innerHTML = `<label>Time cap (min) <input type="number" id="cfg-min" min="1" value="${cfg.countdownMin}"></label>`;
    } else if (mode === 'amrap') {
      elConfig.innerHTML = `<label>AMRAP length (min) <input type="number" id="cfg-min" min="1" value="${cfg.countdownMin}"></label>`;
    } else if (mode === 'emom') {
      elConfig.innerHTML = `
        <label>Interval (sec) <input type="number" id="cfg-emom-sec" min="10" value="${cfg.emomSec}"></label>
        <label>Rounds <input type="number" id="cfg-emom-rounds" min="1" value="${cfg.emomRounds}"></label>`;
    } else if (mode === 'tabata') {
      elConfig.innerHTML = `
        <label>Work (sec) <input type="number" id="cfg-work" min="5" value="${cfg.workSec}"></label>
        <label>Rest (sec) <input type="number" id="cfg-rest" min="5" value="${cfg.restSec}"></label>
        <label>Rounds <input type="number" id="cfg-tabata-rounds" min="1" value="${cfg.tabataRounds}"></label>`;
    }
    bindConfigInputs();
  }

  function bindConfigInputs() {
    const bind = (id, key, isInt) => {
      const el = elConfig.querySelector('#' + id);
      if (!el) return;
      el.addEventListener('change', () => { cfg[key] = isInt ? parseInt(el.value, 10) : parseFloat(el.value); reset(); });
    };
    bind('cfg-min', 'countdownMin', true);
    bind('cfg-emom-sec', 'emomSec', true);
    bind('cfg-emom-rounds', 'emomRounds', true);
    bind('cfg-work', 'workSec', true);
    bind('cfg-rest', 'restSec', true);
    bind('cfg-tabata-rounds', 'tabataRounds', true);
  }

  function setMode(m) {
    mode = m;
    container.querySelectorAll('.timer__mode-btn').forEach(b => b.classList.toggle('is-active', b.dataset.mode === m));
    elRoundAdd.style.display = (m === 'amrap') ? 'inline-block' : 'none';
    reset();
    renderConfig();
  }

  function reset() {
    running = false;
    clearInterval(tickHandle);
    elapsed = 0;
    round = 0;
    elStartPause.textContent = 'Start';
    elPhase.textContent = '';
    if (mode === 'emom') { intervalRemaining = cfg.emomSec; }
    if (mode === 'tabata') { cfg.tabataPhase = 'work'; intervalRemaining = cfg.workSec; }
    updateDisplay();
  }

  function updateDisplay() {
    if (mode === 'stopwatch') {
      elClock.textContent = rbFmtClock(elapsed);
      elRound.textContent = '';
    } else if (mode === 'countdown') {
      elClock.textContent = rbFmtClock(cfg.countdownMin * 60 - elapsed);
      elRound.textContent = 'TIME CAP';
    } else if (mode === 'amrap') {
      elClock.textContent = rbFmtClock(cfg.countdownMin * 60 - elapsed);
      elRound.textContent = 'ROUNDS: ' + round;
    } else if (mode === 'emom') {
      elClock.textContent = rbFmtClock(intervalRemaining);
      elRound.textContent = 'ROUND ' + Math.min(round + 1, cfg.emomRounds) + ' / ' + cfg.emomRounds;
    } else if (mode === 'tabata') {
      elClock.textContent = rbFmtClock(intervalRemaining);
      elRound.textContent = 'ROUND ' + Math.min(round + 1, cfg.tabataRounds) + ' / ' + cfg.tabataRounds;
      elPhase.textContent = cfg.tabataPhase === 'work' ? 'WORK' : 'REST';
      elPhase.className = 'timer__phase timer__phase--' + cfg.tabataPhase;
    }
  }

  function tick() {
    elapsed += 1;

    if (mode === 'stopwatch') {
      updateDisplay();
      return;
    }

    if (mode === 'countdown') {
      const remain = cfg.countdownMin * 60 - elapsed;
      if (remain <= 0) { rbBeep(660, 0.4); pause(); }
      updateDisplay();
      return;
    }

    if (mode === 'amrap') {
      const remain = cfg.countdownMin * 60 - elapsed;
      if (remain <= 0) { rbBeep(660, 0.4); pause(); }
      updateDisplay();
      return;
    }

    if (mode === 'emom') {
      intervalRemaining -= 1;
      if (intervalRemaining <= 0) {
        round += 1;
        if (round >= cfg.emomRounds) { rbBeep(660, 0.4); pause(); updateDisplay(); return; }
        rbBeep(880, 0.15);
        intervalRemaining = cfg.emomSec;
      }
      updateDisplay();
      return;
    }

    if (mode === 'tabata') {
      intervalRemaining -= 1;
      if (intervalRemaining <= 0) {
        if (cfg.tabataPhase === 'work') {
          cfg.tabataPhase = 'rest';
          intervalRemaining = cfg.restSec;
          rbBeep(520, 0.15);
        } else {
          round += 1;
          if (round >= cfg.tabataRounds) { rbBeep(660, 0.4); pause(); updateDisplay(); return; }
          cfg.tabataPhase = 'work';
          intervalRemaining = cfg.workSec;
          rbBeep(880, 0.15);
        }
      }
      updateDisplay();
      return;
    }
  }

  function start() {
    if (running) return;
    running = true;
    elStartPause.textContent = 'Pause';
    tickHandle = setInterval(tick, 1000);
  }

  function pause() {
    running = false;
    clearInterval(tickHandle);
    elStartPause.textContent = 'Start';
  }

  container.querySelector('#timer-modes').addEventListener('click', (e) => {
    const btn = e.target.closest('.timer__mode-btn');
    if (!btn) return;
    setMode(btn.dataset.mode);
  });
  elStartPause.addEventListener('click', () => running ? pause() : start());
  container.querySelector('#timer-reset').addEventListener('click', reset);
  elRoundAdd.addEventListener('click', () => { round += 1; updateDisplay(); });

  renderConfig();
  reset();

  return { reset, setMode };
}

