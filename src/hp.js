// ============================================================
// Focus Fortress — hp.js
// HP state container. Starts at 100, drops when block keywords
// are detected. Emits onChange(hp) and onZero() callbacks.
// ============================================================

const MAX_HP = 100;

let hp = MAX_HP;
let minHpDuringSession = MAX_HP;
const listeners = {
  change: [],
  zero: []
};

function emit(event, ...args) {
  for (const fn of listeners[event]) {
    try { fn(...args); } catch (err) { console.warn('[hp] listener failed:', err.message); }
  }
}

export function get() {
  return hp;
}

export function getMinDuringSession() {
  return minHpDuringSession;
}

export function reset() {
  hp = MAX_HP;
  minHpDuringSession = MAX_HP;
  emit('change', hp);
}

export function applyDamage(amount) {
  if (hp <= 0) return hp;
  hp = Math.max(0, hp - amount);
  if (hp < minHpDuringSession) minHpDuringSession = hp;
  emit('change', hp);
  if (hp <= 0) emit('zero');
  return hp;
}

export function heal(amount) {
  hp = Math.min(MAX_HP, hp + amount);
  emit('change', hp);
  return hp;
}

export function onChange(fn) {
  listeners.change.push(fn);
}

export function onZero(fn) {
  listeners.zero.push(fn);
}

export const MAX = MAX_HP;
