// ============================================================
// Focus Fortress — store.js
// Thin wrapper around window.focusAPI.storeGet/Set/Delete with
// a small in-memory cache so UI reads stay synchronous after
// the initial hydrate() call.
// ============================================================

const cache = {
  totalXp: 0,
  level: 1,
  streakDays: 0,
  lastSessionDate: null,
  achievements: [],   // array of unlocked achievement ids
  sessionLog: [],     // [{startedAt, endedAt, result, hp, focusMinutes, blocked, phase}]
  blockKeywords: [
    'youtube', 'twitch', 'reddit', 'instagram', 'tiktok',
    '쇼츠', 'shorts', 'x.com', 'twitter'
  ]
};

const api = window.focusAPI;

export async function hydrate() {
  if (!api) return cache;
  try {
    const keys = Object.keys(cache);
    for (const k of keys) {
      const v = await api.storeGet(k, cache[k]);
      if (v !== undefined && v !== null) cache[k] = v;
    }
  } catch (err) {
    console.warn('[store] hydrate failed, using defaults:', err.message);
  }
  return cache;
}

export function get(key) {
  return cache[key];
}

export function getAll() {
  return { ...cache };
}

export async function set(key, value) {
  cache[key] = value;
  if (!api) return;
  try {
    await api.storeSet(key, value);
  } catch (err) {
    console.warn('[store] set failed:', err.message);
  }
}

export async function patch(partial) {
  for (const [k, v] of Object.entries(partial)) {
    await set(k, v);
  }
}

export async function appendSession(entry) {
  const log = Array.isArray(cache.sessionLog) ? [...cache.sessionLog] : [];
  log.push(entry);
  // cap at 200 latest
  if (log.length > 200) log.splice(0, log.length - 200);
  await set('sessionLog', log);
}

export async function addAchievement(id) {
  const list = Array.isArray(cache.achievements) ? [...cache.achievements] : [];
  if (!list.includes(id)) {
    list.push(id);
    await set('achievements', list);
  }
}

export async function addXp(amount) {
  const next = (Number(cache.totalXp) || 0) + amount;
  await set('totalXp', next);
  const newLevel = Math.floor(next / 200) + 1;
  const prevLevel = cache.level || 1;
  if (newLevel !== prevLevel) {
    await set('level', newLevel);
  }
  return { totalXp: next, level: newLevel, leveledUp: newLevel > prevLevel };
}
