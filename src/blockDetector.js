// ============================================================
// Focus Fortress — blockDetector.js
// Polls the active window every 5 seconds via IPC. If the
// owner name or window title contains any block keyword
// (case-insensitive), it reports a hit.
//
// Requirements state "매칭 시 applyDamage(2) 를 매초(5초당 -10 HP)":
// on a detected hit we apply 10 HP damage per poll (equivalent
// to -2 HP/second averaged over the 5s window). This keeps the
// polling cadence light while matching the specified damage rate.
// ============================================================

const POLL_MS = 5000;
const DAMAGE_PER_HIT = 10;

let intervalId = null;
let running = false;
let lastHit = null; // { app, title, keyword, at }
let watchAvailable = null; // tri-state: null = unknown, true/false after probe

const listeners = {
  hit: [],
  status: []
};

function emit(event, ...args) {
  for (const fn of listeners[event]) {
    try { fn(...args); } catch (err) { console.warn('[blockDetector] listener failed:', err.message); }
  }
}

export function onHit(fn)    { listeners.hit.push(fn); }
export function onStatus(fn) { listeners.status.push(fn); }

export async function probeWatchAvailable() {
  if (!window.focusAPI || !window.focusAPI.isWatchAvailable) {
    watchAvailable = false;
    emit('status', watchAvailable);
    return false;
  }
  try {
    const ok = await window.focusAPI.isWatchAvailable();
    watchAvailable = Boolean(ok);
  } catch (err) {
    console.warn('[blockDetector] probe failed:', err.message);
    watchAvailable = false;
  }
  emit('status', watchAvailable);
  return watchAvailable;
}

export function isAvailable() {
  return watchAvailable === true;
}

export function getLastHit() {
  return lastHit;
}

function matchKeyword(info, keywords) {
  if (!info) return null;
  const owner = (info.owner && info.owner.name ? info.owner.name : '').toLowerCase();
  const title = (info.title || '').toLowerCase();
  const haystack = `${owner} ${title}`;
  for (const raw of keywords) {
    const kw = String(raw || '').trim().toLowerCase();
    if (!kw) continue;
    if (haystack.includes(kw)) {
      return { app: owner, title, keyword: kw };
    }
  }
  return null;
}

async function pollOnce(getKeywords, applyDamage) {
  if (!window.focusAPI || !window.focusAPI.getActiveWindow) return;
  try {
    const info = await window.focusAPI.getActiveWindow();
    if (!info) {
      // active-win unavailable OR query failed; leave UI to show status
      return;
    }
    const keywords = getKeywords() || [];
    const match = matchKeyword(info, keywords);
    if (match) {
      lastHit = { ...match, at: Date.now() };
      applyDamage(DAMAGE_PER_HIT);
      emit('hit', lastHit);
    }
  } catch (err) {
    console.warn('[blockDetector] poll failed:', err.message);
  }
}

export function start(getKeywords, applyDamage) {
  if (running) return;
  running = true;
  // fire once immediately so the first 5s window is covered
  pollOnce(getKeywords, applyDamage);
  intervalId = setInterval(() => pollOnce(getKeywords, applyDamage), POLL_MS);
}

export function stop() {
  running = false;
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}

export function isRunning() {
  return running;
}
