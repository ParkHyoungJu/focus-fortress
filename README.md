# Focus Fortress

A medieval-fantasy Pomodoro app for Windows. Your castle's HP drops whenever a blocked app or keyword is detected in the active window — survive 25 minutes to earn XP, level up, and unlock achievements.

Built on **Electron 30** with `active-win` for focus-blocking detection and `electron-store` for XP / achievements / session log persistence.

## System Requirements (End Users)

- **OS**: Windows 10 (1809+) 또는 Windows 11, x64
- **CPU**: 아무거나. 2-core 이상 권장
- **RAM**: 유휴 시 ~200MB (Electron 기본 오버헤드)
- **Disk**: 설치 ~180MB, 사용자 데이터(`%APPDATA%\focus-fortress\`) ~1MB 이내
- **Network**: **불필요** — 완전 오프라인 앱. Google Fonts CDN 만 최초 로드 시 선택적으로 사용 (실패해도 정상 동작)

## Dev Requirements

- Node.js 18+ (bundles npm). Recommended: Node 20 LTS.
- Windows 10/11 (빌드 플랫폼). macOS/Linux 에서도 `--win` 크로스 빌드 가능.

## Run (development)

```bash
# from the project root
npm install
npm start
```

`npm start` launches `electron .`, which opens a 960x640 frameless window. The timer starts in `READY` state. Click `START` to begin the first 25-minute focus session.

## What you should see

1. A dark-navy window with a stone castle placeholder, an HP bar, and a large golden `25:00` timer.
2. A `WATCH: ON` badge if `active-win` was installed successfully. If the dependency is missing or fails, the badge shows `WATCH: 감시 기능 미활성` and the timer still runs normally.
3. Clicking `START` kicks off the timer and (if watch is available) a 5-second poll of the foreground window. If the active app/title matches any block keyword, your HP drops by 10 per hit.
4. Finishing a 25-min focus block awards **+50 XP** (+20 bonus if HP stayed at 100). Leveling up triggers a full-screen golden overlay. Achievements unlock via toasts in the top-right.

## Project layout

```
focus-fortress/
├── package.json           electron + active-win + electron-store deps
├── main.js                main process, BrowserWindow, IPC, tray
├── preload.js             contextBridge -> window.focusAPI
├── index.html             frameless shell with 3 tabs (timer/achieve/stats)
├── src/
│   ├── renderer.js        entrypoint, wires modules together
│   ├── timer.js           25/5 pomodoro state machine
│   ├── hp.js              HP container with onChange/onZero
│   ├── blockDetector.js   5s poll of active-win via IPC
│   ├── store.js           electron-store wrapper (IPC) + in-memory cache
│   ├── achievements.js    10 achievements + evaluate()
│   ├── ui.js              DOM bindings
│   └── styles/
│       ├── tokens.css     design tokens (colors, typography, spacing)
│       └── brand.css      component styles (castle, hp-bar, timer, badges)
├── assets/                icon.png (placeholder)
└── DESIGN.md              design principles, palette, ASCII layouts
```

## Fallbacks

- `active-win` missing or failing: renderer reports `감시 기능 미활성`; timer/XP/achievements all still function.
- Google Fonts CDN unreachable: CSS falls back to `Courier New` monospace via `--font-display` / `--font-pixel` stacks.
- Tray icon missing: main process catches the error and just skips tray creation.

## Build & Distribute

```bash
npm install
npm run build        # 현재 플랫폼용 NSIS 인스톨러 빌드
# 또는
npm run build:win    # Windows 타겟 강제
```

빌드 산출물:
- `dist/Focus Fortress Setup 0.1.0.exe` — NSIS 인스톨러 (사용자 배포용)
- `dist/win-unpacked/Focus Fortress.exe` — 압축 해제본 (QA 용)

인스톨러 기본 옵션:
- `oneClick: false` — 사용자가 설치 경로를 직접 선택 가능
- `perMachine: false` — 관리자 권한 불필요, 사용자 단위 설치 (%LOCALAPPDATA%)
- 시작 메뉴 / 바탕화면 바로가기명: `Focus Fortress`

상세한 배포 채널·코드사이닝·체크리스트는 **[DEPLOY.md](./DEPLOY.md)** 참조.

## License

현재 **MVP 단계(v0.1.x)**: **All Rights Reserved** (비공개 라이선스).
- 개인 사용은 무료 배포.
- 재배포 / 리버스엔지니어링 / 2차 저작물 금지.

향후 **프로 라이선스**는 [Gumroad](https://gumroad.com/) 에 등록 예정 (가격 미정).
프로 기능 후보: 커스텀 차단 룰 세트, CSV 내보내기, 다중 캐릭터 프리셋, 클라우드 동기화.

오픈소스 전환 여부는 v1.0 이후 재검토.

## Roadmap (not in MVP)

- 코드사이닝 (OV → EV) 적용, SmartScreen 경고 제거.
- 자동 업데이트 (`electron-updater` + GitHub Releases).
- Microsoft Store 등록 (MSIX 패키징).
- itch.io / Steam 배포.
- 커스텀 도트 성·기사 SVG 에셋 (현재 CSS placeholder).
- 레벨업/HP 데미지 사운드 이펙트.
