# QC Report — Focus Fortress

**Tester**: qc-tester
**Date**: 2026-04-24
**Target**: Focus Fortress v0.1.0 (Electron 30 Windows app)
**Environment**: Windows 11 Pro, Node v24.13.0, npm 11.6.2

---

## 1. Install & Run

### npm install
- **Result**: SUCCESS
- **Elapsed**: ~25 seconds
- **Packages installed**: 396 (397 audited)
- **Key deps verified at installed version**:
  - `electron@30.5.1` (declared `^30.0.0`)
  - `active-win@8.2.1` (declared `^8.2.1`)
  - `electron-store@8.2.0` (declared `^8.2.0`)
- **Warnings**: numerous `npm warn deprecated` for transitive deps (inflight, glob@7/8/10, rimraf@3, tar@6, npmlog, gauge, etc.) and `15 vulnerabilities (4 low, 11 high)` reported via `npm audit`. None block install.
- **Native build for active-win**: no node-gyp step was triggered on this run — prebuilt binary was used (active-win 8.x ships `get-windows` binaries on Windows). No fallback path exercised.

### electron --version smoke
- `node_modules/.bin/electron --version` prints `v30.5.1` — Electron binary is runnable.

### npm start (headless-ish smoke, 8 seconds)
- **Result**: SUCCESS — process stayed alive through the full 8-second window with no startup exception.
- **Main-process log observed**: `[focus-fortress] tray icon missing, skipping tray creation` — the advertised fallback triggered because `assets/icon.png` is only a `.gitkeep` / `ICON_TODO.md` placeholder. This is **expected MVP behavior**, not a bug.
- **No renderer crash**: the main process did not report any uncaught exception, IPC error, or preload failure during the 8-second window. Bootstrap therefore reached at least the IPC wiring stage.
- **Shutdown artifacts** (after forced kill): `Network service crashed, restarting service` and `GPU process exited unexpectedly: exit_code=143` — these are standard Chromium teardown noise on SIGTERM and can be ignored.
- **Visual verification** (MM:SS display, HP bar rendering): NOT performed. The tester ran headless on the backend shell and did not attach to the X/GDI window; `index.html` statically contains the `25:00` literal and `timer-clock` element wired to `formatMMSS` (both independently verified below), so the display is very likely correct but has not been visually confirmed.

---

## 2. File Consistency Smoke

| Check | Result | Notes |
|---|---|---|
| `package.json.main` == `main.js` | OK | literally `"main": "main.js"` |
| `package.json.scripts.start` defined | OK | `"start": "electron ."` |
| Main IPC handlers match preload bridges | OK | both sides expose the same 8 channels: `active-win:get`, `active-win:available`, `store:get`, `store:set`, `store:delete`, `window:minimize`, `window:close`, `app:quit`. No orphans on either side. |
| `renderer.js` relative imports resolve | OK | `./timer.js`, `./hp.js`, `./store.js`, `./blockDetector.js`, `./ui.js`, `./achievements.js` all exist. `ui.js` imports (`./timer.js`, `./hp.js`, `./achievements.js`) also resolve. |
| `achievements.js` defines exactly 10 achievements | OK | 10 unique `id` entries: `first_watch`, `streak_three`, `last_stand`, `daily_five`, `weekly_guardian`, `ironwall`, `persistor`, `count_ten`, `temptation`, `dawn_knight`. |
| `timer.js` Pomodoro constants correct | OK | `PHASE.FOCUS = 25 * 60`, `PHASE.BREAK = 5 * 60`. |
| `timer.js` `formatMMSS` MM:SS output | OK | Extracted function body, ran as a `new Function`: `60 -> "01:00"`, `1500 -> "25:00"`, `0 -> "00:00"`, `59 -> "00:59"` all PASS. |
| `index.html` script/stylesheet paths exist | OK | `./src/styles/brand.css` and `./src/renderer.js` both present. |
| DOM ids referenced by `ui.js` present in `index.html` | OK (spot-checked) | `hp-fill`, `hp-value`, `hp-bar`, `timer-clock`, `timer-phase`, `btn-start`, `btn-pause`, `btn-reset`, `watch-status`, `meta-xp`, `meta-level`, `meta-streak`, `keyword-chips`, `keyword-input`, `btn-add-keyword`, `badge-grid`, `achieve-count`, `stat-sessions`, `stat-completion`, `stat-focused`, `stat-streak`, `bar-chart`, `session-log`, `levelup-overlay`, `levelup-level`, `unlock-toast-list`, `btn-min`, `btn-close` — all present. |
| README execution instructions vs actual scripts | OK | README says `npm install` + `npm start`; both exist and work. |

---

## 3. Findings / Phase 2 Candidates

Ordered by impact. None block the MVP.

1. **`assets/icon.png` is missing** — main process prints a warning and falls back to no tray icon. `electron-builder` will use its own default placeholder. `ICON_TODO.md` documents the plan. Phase 2: source from Kenney.nl CC0, add 256/512/16/32 variants, wire into `win.icon` path.
2. **Renderer visual verification was not performed in this QC run** — headless bash environment cannot screenshot the Electron window, so the 25:00 clock, HP bar, and tab UI are inferred-correct (DOM ids + CSS exist, bootstrap didn't throw) but not eyes-on confirmed. Phase 2: add a Playwright/Spectron-style electron smoke test that asserts `#timer-clock` text matches `/^\d{2}:\d{2}$/` after boot.
3. **15 npm audit vulnerabilities (4 low, 11 high)** in transitive deps of `electron-builder`/`electron-store`. No user-exposed surface in the renderer since these are build/runtime deps, not bundled JS. Phase 2: bump `electron-store` to v9+ (drops some deprecated deps) and `electron-builder` to v25, then re-audit.
4. **`blockDetector.DAMAGE_PER_HIT = 10` vs IDEATION "매초(5초당 -10 HP)"** — a hit applies -10 every 5s. If the keyword-matched window stays foreground for 30s, that's only -60 HP (6 hits), not -60 over 30s as continuous drain. This matches the *averaged* rate but is coarser than the spec literally implies. Phase 2: if granular damage is required, switch to -2/sec tick while a hit is "latched" until the app is recognized as safe again.
5. **Session-log cap at 200 entries is silently lossy** (`store.js:65`). For users who run 5 sessions/day × 200 days that equals ~1 year of history before rollover, which is fine for MVP but worth making configurable or rolling-window-by-date in Phase 2.

---

## 4. Final QC Status

**로컬실행가능** (locally runnable)

- `npm install` completes cleanly on Windows 11 with Node 24.
- `npm start` brings up the Electron process without main-process exceptions; the frameless window is created and stays alive.
- All static consistency checks pass (IPC contract, module graph, achievement count, timer math, DOM id cross-references).
- The only "missing" artifact (`assets/icon.png`) has an explicit graceful fallback that was observed working at runtime.

Build artifact (`npm run build` → `dist/Focus Fortress Setup 0.1.0.exe`) was **not** attempted — out of scope for this pass (publisher/roadmap territory). Nothing discovered here suggests the NSIS build would fail, but a follow-up QC run after the icon is added is recommended.
