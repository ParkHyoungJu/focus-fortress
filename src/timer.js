// ============================================================
// Focus Fortress — timer.js
// Pomodoro state machine: 25min focus → 5min break → repeat.
// Emits tick/complete/phase events. Driven by setInterval(1000).
// ============================================================

export const PHASE = {
  FOCUS: 'focus',
  BREAK: 'break',
  IDLE:  'idle'
};

const DURATION = {
  [PHASE.FOCUS]: 25 * 60,
  [PHASE.BREAK]: 5 * 60
};

// For quick smoke testing you can tweak DURATION. Keep defaults for MVP.

let state = {
  phase: PHASE.IDLE,
  remaining: DURATION[PHASE.FOCUS],
  running: false,
  cycleCount: 0, // completed focus sessions in current run
  startedAt: null
};

let intervalId = null;
const listeners = {
  tick: [],
  complete: [],
  phase: [],
  state: []
};

function emit(event, ...args) {
  for (const fn of listeners[event]) {
    try { fn(...args); } catch (err) { console.warn('[timer] listener failed:', err.message); }
  }
}

export function getState() {
  return { ...state };
}

export function onTick(fn)     { listeners.tick.push(fn); }
export function onComplete(fn) { listeners.complete.push(fn); }
export function onPhase(fn)    { listeners.phase.push(fn); }
export function onStateChange(fn) { listeners.state.push(fn); }

function setPhase(phase) {
  state.phase = phase;
  state.remaining = DURATION[phase] || DURATION[PHASE.FOCUS];
  emit('phase', phase);
  emit('state', getState());
}

export function start() {
  if (state.running) return;
  if (state.phase === PHASE.IDLE) {
    setPhase(PHASE.FOCUS);
  }
  state.running = true;
  state.startedAt = Date.now();
  emit('state', getState());

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (!state.running) return;
    state.remaining = Math.max(0, state.remaining - 1);
    emit('tick', state.remaining, state.phase);

    if (state.remaining <= 0) {
      const completedPhase = state.phase;
      emit('complete', completedPhase);
      if (completedPhase === PHASE.FOCUS) {
        state.cycleCount += 1;
        setPhase(PHASE.BREAK);
      } else {
        setPhase(PHASE.FOCUS);
      }
      // Keep running into next phase automatically
    }
  }, 1000);
}

export function pause() {
  if (!state.running) return;
  state.running = false;
  emit('state', getState());
}

export function resume() {
  if (state.running) return;
  if (state.phase === PHASE.IDLE) setPhase(PHASE.FOCUS);
  state.running = true;
  emit('state', getState());
}

export function reset() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  state = {
    phase: PHASE.IDLE,
    remaining: DURATION[PHASE.FOCUS],
    running: false,
    cycleCount: 0,
    startedAt: null
  };
  emit('state', getState());
}

export function stop() {
  // Like reset but preserves cycle counter for session log accuracy
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  state.running = false;
  state.phase = PHASE.IDLE;
  state.remaining = DURATION[PHASE.FOCUS];
  emit('state', getState());
}

export function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export { DURATION };
