// ============================================================
// Focus Fortress — ui.js
// DOM bindings: tab switching, HP bar, timer display, keyword
// chips, achievement grid, stats, level-up overlay, toast.
// ============================================================

import * as timer from './timer.js';
import * as hp from './hp.js';
import { ACHIEVEMENTS, byId } from './achievements.js';

// ---------- Tab switching ----------
export function initTabs() {
  const tabs = document.querySelectorAll('.nav__tab');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => t.setAttribute('aria-selected', t === tab ? 'true' : 'false'));
      panels.forEach(p => {
        p.setAttribute('data-active', p.getAttribute('data-tab-panel') === target ? 'true' : 'false');
      });
    });
  });
}

// ---------- HP bar ----------
export function renderHp(value) {
  const fill = document.getElementById('hp-fill');
  const label = document.getElementById('hp-value');
  const bar = document.getElementById('hp-bar');
  if (!fill || !label || !bar) return;
  const pct = Math.max(0, Math.min(100, value));
  fill.style.width = pct + '%';
  label.textContent = String(pct);
  let level = 'high';
  if (pct <= 30) level = 'low';
  else if (pct <= 60) level = 'mid';
  bar.setAttribute('data-level', level);
}

// ---------- Timer display ----------
export function renderTimer(state) {
  const clock = document.getElementById('timer-clock');
  const phase = document.getElementById('timer-phase');
  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  if (!clock || !phase) return;

  clock.textContent = timer.formatMMSS(state.remaining);
  clock.setAttribute('data-state', state.running ? 'running' : 'idle');

  const phaseLabel =
    state.phase === timer.PHASE.FOCUS ? `FOCUS #${state.cycleCount + 1}` :
    state.phase === timer.PHASE.BREAK ? 'BREAK' :
    'READY';
  phase.textContent = phaseLabel;

  if (btnStart && btnPause) {
    btnStart.disabled = state.running;
    btnPause.disabled = !state.running;
    btnStart.textContent = state.phase === timer.PHASE.IDLE ? 'START' : 'RESUME';
  }
}

// ---------- Watch status ----------
export function renderWatchStatus(available) {
  const el = document.getElementById('watch-status');
  if (!el) return;
  if (available === true) {
    el.setAttribute('data-state', 'on');
    el.textContent = 'WATCH: ON';
  } else if (available === false) {
    el.setAttribute('data-state', 'off');
    el.textContent = 'WATCH: 감시 기능 미활성';
  } else {
    el.setAttribute('data-state', 'loading');
    el.textContent = 'WATCH: INIT';
  }
}

// ---------- Meta (xp, level, streak) ----------
export function renderMeta({ totalXp, level, streakDays }) {
  const xp = document.getElementById('meta-xp');
  const lv = document.getElementById('meta-level');
  const st = document.getElementById('meta-streak');
  if (xp) xp.textContent = String(totalXp || 0);
  if (lv) lv.textContent = String(level || 1);
  if (st) st.textContent = String(streakDays || 0);
}

// ---------- Keyword chips ----------
export function renderKeywords(keywords, onRemove) {
  const host = document.getElementById('keyword-chips');
  if (!host) return;
  host.innerHTML = '';
  keywords.forEach(kw => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = kw;
    const x = document.createElement('button');
    x.className = 'chip__x';
    x.textContent = 'X';
    x.title = 'Remove';
    x.addEventListener('click', () => onRemove(kw));
    chip.appendChild(x);
    host.appendChild(chip);
  });
}

// ---------- Achievements ----------
export function renderAchievements(unlockedIds) {
  const grid = document.getElementById('badge-grid');
  const count = document.getElementById('achieve-count');
  if (!grid) return;
  const unlocked = new Set(unlockedIds || []);
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(a => {
    const node = document.createElement('div');
    node.className = 'badge';
    node.setAttribute('data-unlocked', unlocked.has(a.id) ? 'true' : 'false');
    node.innerHTML = `
      <div class="badge__icon">${unlocked.has(a.id) ? '*' : ''}</div>
      <div class="badge__name">${a.name}</div>
      <div class="badge__desc">${unlocked.has(a.id) ? a.desc : 'LOCKED'}</div>
    `;
    grid.appendChild(node);
  });
  if (count) count.textContent = String(unlocked.size);
}

// ---------- Stats ----------
export function renderStats(sessionLog, streakDays) {
  const log = Array.isArray(sessionLog) ? sessionLog : [];
  const sessionsEl   = document.getElementById('stat-sessions');
  const completionEl = document.getElementById('stat-completion');
  const focusedEl    = document.getElementById('stat-focused');
  const streakEl     = document.getElementById('stat-streak');

  // Week window = last 7 days (rolling)
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const weekSessions = log.filter(s => s.endedAt && s.endedAt >= weekAgo);
  const completed = weekSessions.filter(s => s.result === 'complete');
  const completion = weekSessions.length === 0
    ? 0
    : Math.round((completed.length / weekSessions.length) * 100);
  const focusedMin = completed.reduce((acc, s) => acc + (s.focusMinutes || 0), 0);
  const h = Math.floor(focusedMin / 60);
  const m = focusedMin % 60;

  if (sessionsEl)   sessionsEl.textContent = String(weekSessions.length);
  if (completionEl) completionEl.textContent = completion + '%';
  if (focusedEl)    focusedEl.textContent = `${h}h ${String(m).padStart(2, '0')}m`;
  if (streakEl)     streakEl.textContent = String(streakDays || 0);

  renderBarChart(log);
  renderSessionLog(log);
}

function renderBarChart(log) {
  const host = document.getElementById('bar-chart');
  if (!host) return;
  host.innerHTML = '';
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // Mon..Sun
  const today = new Date();
  // Build last 7 days (ending today), count completed sessions per day
  const buckets = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const start = d.getTime();
    const end = start + 24 * 60 * 60 * 1000;
    const count = (log || []).filter(s =>
      s.result === 'complete' && s.endedAt >= start && s.endedAt < end
    ).length;
    buckets.push({ label: labels[(d.getDay() + 6) % 7], count });
  }
  const max = Math.max(1, ...buckets.map(b => b.count));
  buckets.forEach(b => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    const pct = Math.round((b.count / max) * 100);
    row.innerHTML = `
      <span class="bar-row__label">${b.label}</span>
      <div class="bar-row__track"><div class="bar-row__fill" style="width: ${pct}%;"></div></div>
      <span class="bar-row__value">${b.count}</span>
    `;
    host.appendChild(row);
  });
}

function renderSessionLog(log) {
  const host = document.getElementById('session-log');
  if (!host) return;
  host.innerHTML = '';
  const recent = (log || []).slice(-12).reverse();
  if (recent.length === 0) {
    host.innerHTML = '<div class="muted" style="padding: 8px;">No sessions yet.</div>';
    return;
  }
  recent.forEach(s => {
    const when = s.endedAt ? new Date(s.endedAt) : new Date();
    const stamp = `${when.getMonth() + 1}/${when.getDate()} ${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}`;
    const row = document.createElement('div');
    row.className = 'session-log__row';
    row.setAttribute('data-result', s.result || 'complete');
    row.innerHTML = `
      <span>${stamp}</span>
      <span>${s.focusMinutes || 25}m</span>
      <span class="session-log__result">${s.result === 'complete' ? 'COMPLETE' : 'FAILED'}</span>
    `;
    host.appendChild(row);
  });
}

// ---------- Level-up overlay ----------
export function showLevelUp(level) {
  const overlay = document.getElementById('levelup-overlay');
  const numEl = document.getElementById('levelup-level');
  if (!overlay || !numEl) return;
  numEl.textContent = String(level);
  overlay.setAttribute('data-visible', 'true');
  const dismiss = () => {
    overlay.setAttribute('data-visible', 'false');
    overlay.removeEventListener('click', dismiss);
  };
  overlay.addEventListener('click', dismiss);
  // auto-dismiss after 3.5s
  setTimeout(dismiss, 3500);
}

// ---------- Unlock toasts ----------
export function showUnlockToast(achievement) {
  const host = document.getElementById('unlock-toast-list');
  if (!host) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.position = 'static';
  toast.style.transform = 'none';
  toast.textContent = `UNLOCKED: ${achievement.name}`;
  host.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ---------- Titlebar controls ----------
export function initTitlebar() {
  const min = document.getElementById('btn-min');
  const close = document.getElementById('btn-close');
  if (min && window.focusAPI) min.addEventListener('click', () => window.focusAPI.minimize());
  if (close && window.focusAPI) close.addEventListener('click', () => window.focusAPI.close());
}
