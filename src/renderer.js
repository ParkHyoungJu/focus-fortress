// ============================================================
// Focus Fortress — renderer.js (entry)
// Wires timer + hp + blockDetector + store + ui + achievements
// together.
// ============================================================

import * as timer from './timer.js';
import * as hp from './hp.js';
import * as store from './store.js';
import * as blockDetector from './blockDetector.js';
import * as ui from './ui.js';
import { evaluate as evalAchievements, byId as achievementById } from './achievements.js';

// ---------- Session-local counters ----------
let sessionBlockedCount = 0;
let sessionStartedAt = null;

// ---------- Helpers ----------

function getKeywords() {
  return store.get('blockKeywords') || [];
}

function applyDamageFromHit(amount) {
  // Only apply damage while a focus phase is running
  const s = timer.getState();
  if (!s.running || s.phase !== timer.PHASE.FOCUS) return;
  hp.applyDamage(amount);
  sessionBlockedCount += 1;
}

function todayKey(date) {
  const d = date ? new Date(date) : new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function updateStreak(nowDate) {
  const today = todayKey(nowDate);
  const last = store.get('lastSessionDate');
  let streak = Number(store.get('streakDays') || 0);
  if (last === today) {
    // already counted for today
  } else if (last) {
    const lastDate = new Date(last + 'T00:00:00');
    const diffDays = Math.round((new Date(today + 'T00:00:00') - lastDate) / (24 * 60 * 60 * 1000));
    if (diffDays === 1) streak += 1;
    else streak = 1;
  } else {
    streak = 1;
  }
  return { streak, today };
}

async function onFocusComplete() {
  // XP: +50 base, +20 if HP 100 maintained
  const minHp = hp.getMinDuringSession();
  const maintained = minHp >= 100;
  const xpGain = 50 + (maintained ? 20 : 0);

  const endedAt = Date.now();
  const sessionEntry = {
    startedAt: sessionStartedAt || (endedAt - 25 * 60 * 1000),
    endedAt,
    result: 'complete',
    hp: hp.get(),
    minHp,
    focusMinutes: 25,
    blocked: sessionBlockedCount,
    phase: 'focus'
  };
  await store.appendSession(sessionEntry);

  // Streak
  const { streak, today } = updateStreak(endedAt);
  await store.patch({ streakDays: streak, lastSessionDate: today });

  // XP / Level
  const { totalXp, level, leveledUp } = await store.addXp(xpGain);

  // Achievements
  const ctx = {
    session: sessionEntry,
    totalXp,
    level,
    streakDays: streak,
    sessionLog: store.get('sessionLog') || []
  };
  const newlyUnlocked = evalAchievements(ctx, store.get('achievements'));
  for (const ach of newlyUnlocked) {
    await store.addAchievement(ach.id);
    ui.showUnlockToast(ach);
  }

  // UI refresh
  ui.renderMeta({ totalXp, level, streakDays: streak });
  ui.renderAchievements(store.get('achievements'));
  ui.renderStats(store.get('sessionLog'), streak);

  if (leveledUp) {
    ui.showLevelUp(level);
  }

  // Reset session-local counters; HP will reset on next FOCUS start
  sessionBlockedCount = 0;
  sessionStartedAt = null;
}

async function onSessionFailed() {
  const endedAt = Date.now();
  const sessionEntry = {
    startedAt: sessionStartedAt || (endedAt - 25 * 60 * 1000),
    endedAt,
    result: 'failed',
    hp: 0,
    minHp: 0,
    focusMinutes: Math.max(0, Math.round((endedAt - (sessionStartedAt || endedAt)) / 60000)),
    blocked: sessionBlockedCount,
    phase: 'focus'
  };
  await store.appendSession(sessionEntry);
  ui.renderStats(store.get('sessionLog'), store.get('streakDays'));

  // Force-stop timer on HP 0
  timer.stop();
  hp.reset();
  ui.renderHp(hp.get());
  ui.renderTimer(timer.getState());
  sessionBlockedCount = 0;
  sessionStartedAt = null;
}

// ---------- Wiring ----------

async function bootstrap() {
  // 1) Hydrate store from disk
  await store.hydrate();

  // 2) Initial UI
  ui.initTabs();
  ui.initTitlebar();
  ui.renderHp(hp.get());
  ui.renderTimer(timer.getState());
  ui.renderMeta({
    totalXp: store.get('totalXp'),
    level: store.get('level'),
    streakDays: store.get('streakDays')
  });
  ui.renderKeywords(getKeywords(), handleRemoveKeyword);
  ui.renderAchievements(store.get('achievements'));
  ui.renderStats(store.get('sessionLog'), store.get('streakDays'));

  // 3) Probe active-win availability
  ui.renderWatchStatus(null);
  const watchOk = await blockDetector.probeWatchAvailable();
  ui.renderWatchStatus(watchOk);

  // 4) Hook events
  hp.onChange(v => ui.renderHp(v));
  hp.onZero(() => { onSessionFailed(); });

  timer.onTick(() => ui.renderTimer(timer.getState()));
  timer.onStateChange(() => ui.renderTimer(timer.getState()));
  timer.onPhase((phase) => {
    if (phase === timer.PHASE.FOCUS) {
      // new focus phase: reset HP, counters
      hp.reset();
      sessionBlockedCount = 0;
      sessionStartedAt = Date.now();
    }
  });
  timer.onComplete((completedPhase) => {
    if (completedPhase === timer.PHASE.FOCUS) {
      onFocusComplete();
    }
  });

  // 5) Button bindings
  document.getElementById('btn-start').addEventListener('click', () => {
    const s = timer.getState();
    if (s.phase === timer.PHASE.IDLE) sessionStartedAt = Date.now();
    timer.start();
    if (watchOk && !blockDetector.isRunning()) {
      blockDetector.start(getKeywords, applyDamageFromHit);
    }
  });
  document.getElementById('btn-pause').addEventListener('click', () => {
    timer.pause();
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    timer.reset();
    hp.reset();
    sessionBlockedCount = 0;
    sessionStartedAt = null;
    blockDetector.stop();
    ui.renderTimer(timer.getState());
    ui.renderHp(hp.get());
  });

  // 6) Keyword input
  const input = document.getElementById('keyword-input');
  const addBtn = document.getElementById('btn-add-keyword');
  const addKeyword = async () => {
    const v = (input.value || '').trim().toLowerCase();
    if (!v) return;
    const kws = getKeywords();
    if (!kws.includes(v)) {
      const next = [...kws, v];
      await store.set('blockKeywords', next);
      ui.renderKeywords(next, handleRemoveKeyword);
    }
    input.value = '';
  };
  addBtn.addEventListener('click', addKeyword);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addKeyword();
  });
}

async function handleRemoveKeyword(kw) {
  const next = (getKeywords() || []).filter(k => k !== kw);
  await store.set('blockKeywords', next);
  ui.renderKeywords(next, handleRemoveKeyword);
}

// Go
document.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch(err => {
    console.error('[renderer] bootstrap failed:', err);
  });
});
