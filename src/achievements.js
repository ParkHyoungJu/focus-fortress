// ============================================================
// Focus Fortress — achievements.js
// 10 achievements. Each has an `id`, `name`, `desc`, and a
// pure `check(ctx)` function. `ctx` contains:
//   - session     latest session entry {result, hp, minHp, blocked, startedAt, endedAt, focusMinutes}
//   - totalXp, level, streakDays
//   - sessionLog  full log
// ============================================================

export const ACHIEVEMENTS = [
  {
    id: 'first_watch',
    name: 'NOVICE WARDEN',
    desc: '첫 세션 완주',
    check: (ctx) => ctx.session && ctx.session.result === 'complete'
  },
  {
    id: 'streak_three',
    name: 'WIN STREAK',
    desc: '3회 연속 완주',
    check: (ctx) => {
      const log = ctx.sessionLog || [];
      if (log.length < 3) return false;
      const last3 = log.slice(-3);
      return last3.every(s => s.result === 'complete');
    }
  },
  {
    id: 'last_stand',
    name: 'LAST STAND',
    desc: 'HP 10 이하로 세션 완주',
    check: (ctx) => ctx.session && ctx.session.result === 'complete' && (ctx.session.minHp ?? 100) <= 10
  },
  {
    id: 'daily_five',
    name: 'DAY MASTER',
    desc: '하루 5세션 완주',
    check: (ctx) => {
      const log = ctx.sessionLog || [];
      if (!ctx.session || !ctx.session.endedAt) return false;
      const day = new Date(ctx.session.endedAt).toDateString();
      const count = log.filter(s => s.result === 'complete' && new Date(s.endedAt).toDateString() === day).length;
      return count >= 5;
    }
  },
  {
    id: 'weekly_guardian',
    name: 'WEEK GUARD',
    desc: '7일 연속 스트릭',
    check: (ctx) => (ctx.streakDays || 0) >= 7
  },
  {
    id: 'ironwall',
    name: 'IRONWALL',
    desc: 'HP 100 유지하며 완주',
    check: (ctx) => ctx.session && ctx.session.result === 'complete' && (ctx.session.minHp ?? 100) >= 100
  },
  {
    id: 'persistor',
    name: 'PERSISTOR',
    desc: '총 10시간 누적 집중',
    check: (ctx) => {
      const log = ctx.sessionLog || [];
      const totalMin = log
        .filter(s => s.result === 'complete')
        .reduce((acc, s) => acc + (s.focusMinutes || 0), 0);
      return totalMin >= 600; // 10h
    }
  },
  {
    id: 'count_ten',
    name: 'THE COUNT',
    desc: '레벨 10 도달',
    check: (ctx) => (ctx.level || 1) >= 10
  },
  {
    id: 'temptation',
    name: 'OVERCOME',
    desc: '차단 탐지되었으나 세션 완주',
    check: (ctx) => ctx.session && ctx.session.result === 'complete' && Number(ctx.session.blocked || 0) > 0
  },
  {
    id: 'dawn_knight',
    name: 'DAWN KNIGHT',
    desc: '06시 이전 세션 완주',
    check: (ctx) => {
      if (!ctx.session || ctx.session.result !== 'complete' || !ctx.session.endedAt) return false;
      const hour = new Date(ctx.session.endedAt).getHours();
      return hour < 6;
    }
  }
];

export function evaluate(ctx, alreadyUnlocked) {
  const unlocked = new Set(alreadyUnlocked || []);
  const newly = [];
  for (const a of ACHIEVEMENTS) {
    if (unlocked.has(a.id)) continue;
    try {
      if (a.check(ctx)) newly.push(a);
    } catch (err) {
      console.warn('[achievements] check failed for', a.id, err.message);
    }
  }
  return newly;
}

export function byId(id) {
  return ACHIEVEMENTS.find(a => a.id === id) || null;
}
