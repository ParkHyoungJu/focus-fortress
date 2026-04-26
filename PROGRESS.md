# 진행 로그

**프로젝트**: Focus Fortress
**시작**: 2026-04-24 14:04
**배치**: afternoon #1

---

## [designer] 14:20
- 디자인 토큰 정의: `src/styles/tokens.css` — 스톤 그레이/배너 레드/골드/블러드/다크 네이비 5색 체계, Press Start 2P + VT323 픽셀 타이포, 4/8/16/24/40 간격 그리드, 픽셀 감성 위해 radius 0 기본 + blur 없는 offset 도트 그림자.
- 컴포넌트 스타일: `src/styles/brand.css` — CSS 만으로 구성한 castle-frame placeholder(탑·본성·깃발·기사 idle 애니메이션), HP bar(위험시 맥박+블러드 글로우), VT323 96px 타이머, 4종 pixel 버튼(primary/gold/ghost/sm·lg), 업적 badge grid, stat 카드, toast.
- 디자인 문서: `DESIGN.md` — 5대 원칙(pixel first / HP 주인공 / 골드 보상 / 블러드 경고 / steps 모션) + 팔레트 표 + ASCII 스케치 3종(타이머·업적·통계) + SVG 아이콘 스펙 8종.
- 핵심 결정: 배경을 순흑 대신 다크 네이비(#0b1020)로 잡아 "한밤의 성" 서사를 깔고, 배너 레드(일반 빨강)와 블러드 레드(위험 빨강)를 채도로 분리해 HP 경고를 혼동 없이 인지하도록 설계.
- 다음 역할(frontend): `@import "./brand.css"` 만 걸면 바로 컴포넌트 클래스 사용 가능. 실제 도트 에셋은 Kenney.nl CC0 팩으로 차후 교체.

---

## [windows-dev] 14:13
- Electron 30 스캐폴드 작성: `package.json`(deps: electron@^30, active-win@^8, electron-store@^8, electron-builder@^24 dev), frameless 960x640 BrowserWindow, `preload.js`로 `contextBridge.exposeInMainWorld('focusAPI', …)`만 노출 (contextIsolation true, nodeIntegration false).
- IPC 핸들러 5종 구현 (`active-win:get`, `active-win:available`, `store:get/set/delete`, `window:minimize/close`, `app:quit`). active-win 과 electron-store 둘 다 `require`를 try/catch로 감싸 미설치 시에도 main 프로세스가 크래시하지 않음. Tray 는 icon.png 없으면 조용히 스킵.
- Renderer 모듈 6개 분리: `timer.js`(25/5 상태머신 + tick/complete/phase 이벤트), `hp.js`(100 기본 + onZero), `blockDetector.js`(renderer 주도 5초 폴링, 히트당 -10 HP = 요구사항의 5초당 -10 비율), `store.js`(IPC wrapper + 메모리 캐시), `achievements.js`(10개 업적 순수함수 check), `ui.js`(탭/HP바/타이머/키워드 칩/배지 그리드/막대 차트/세션 로그/레벨업 오버레이/토스트).
- XP/레벨: 포커스 완주 +50, HP 100 유지 시 +20 보너스. `level = floor(totalXp/200)+1`. 레벨업 감지 시 풀스크린 골든 오버레이 (600ms pop 애니메이션) 자동 3.5초 디스미스.
- Fallback 로직: active-win 미존재 시 `WATCH: 감시 기능 미활성` 뱃지만 표시하고 타이머/업적/XP 는 정상 동작. Google Fonts 실패 시 `Courier New` fallback. CSP meta 태그로 스크립트/폰트 제한.
- 기본 차단 키워드 9개(youtube/twitch/reddit/instagram/tiktok/쇼츠/shorts/x.com/twitter) + UI에서 칩 추가/제거. electron-store 에 `blockKeywords` 키로 영속화.
- 실행 확인: 미시도 (QC 담당). 설치파일 빌드: 미수행 - 로드맵 (electron-builder win/nsis 설정은 package.json.build 에 넣어둠, 서명/퍼블리싱은 publisher 가 마무리).

---

## [publisher] 14:28
- electron-builder `build` 섹션 확장: `appId: com.autoprogramming.focus-fortress`, NSIS 옵션(oneClick=false, allowToChangeInstallationDirectory=true, perMachine=false, shortcutName="Focus Fortress"), `win.icon: assets/icon.png` 플레이스홀더, `publish: null` 로 자동 업데이트 비활성, `files` 에 `package.json` 추가.
- 아이콘 소싱 TODO: `assets/ICON_TODO.md` 작성 — 256/512 PNG + tray 16/32 스펙, Kenney.nl CC0 팩 발췌 계획, 현재 부재해도 electron-builder 는 기본 아이콘으로 빌드 진행됨.
- 배포 문서: `DEPLOY.md` — 빌드 명령/산출물 경로, 코드사이닝 현황(미적용) + SmartScreen 우회 가이드 + 향후 OV/EV 로드맵, 4개 배포 채널(랜딩/itch.io/MS Store/Steam) 비용·수수료·허들 비교, 최초 출시 체크리스트 25개 항목.
- README 보강: System Requirements(Windows 10+ x64, 유휴 200MB, 오프라인), Build & Distribute 섹션(`npm run build` → `dist/Focus Fortress Setup 0.1.0.exe`), License(MVP All Rights Reserved → Gumroad 프로 티어 예정), Roadmap 에 코드사이닝·auto-update·MSIX 항목 추가. 실제 빌드 실행은 QC 범위라 미수행.

---

## [qc-tester] 14:20
- `npm install` 성공 (~25초, 396 packages, electron@30.5.1 / active-win@8.2.1 / electron-store@8.2.0 확인). active-win 네이티브 빌드는 prebuilt 로 해결되어 fallback 미발동, 번들 deprecation/audit 15건(high 11)은 로드맵 이슈로만 기록.
- Electron 헤드풀 스모크 8초 실행: 메인 프로세스 정상 기동, `tray icon missing, skipping tray creation` 경고만 발생(예정된 graceful fallback). uncaught 예외·preload 에러 없음, BrowserWindow 생성 성공. 종료 시 network/GPU 프로세스 ERROR 는 SIGTERM 셧다운 잡음.
- 파일 일관성 검증 전부 OK: main.js ↔ preload.js IPC 채널 8개 완전 매칭(`active-win:get/available`, `store:get/set/delete`, `window:minimize/close`, `app:quit`), renderer.js/ui.js 의 9개 상대 import 전부 실존, achievements.js 에 고유 id 10개, timer.js `FOCUS=25*60`/`BREAK=5*60`, `formatMMSS` 추출 후 `new Function` 으로 실행해 60→01:00, 1500→25:00, 0→00:00, 59→00:59 PASS.
- DOM id 교차 확인: ui.js 에서 getElementById 로 찾는 28개 id(hp-fill, timer-clock, btn-start, watch-status, meta-xp, keyword-chips, badge-grid, levelup-overlay 등) 모두 index.html 에 존재.
- 발견된 Phase 2 후보 5건을 `QC.md` 로 정리(아이콘 미존재, 렌더러 시각 검증 미수행, npm audit, blockDetector 데미지 granularity, sessionLog 200건 cap). 최종 상태: **로컬실행가능**. 빌드(`npm run build`)는 이번 범위 밖이라 미수행.

---

## [roadmap-planner] 14:35
- ROADMAP.md 생성: Phase 1(DONE 13건) + Phase 2 완성도 12건 + Phase 3 배포 17건 + Phase 4 수익화 16건 = 총 45개 활성 체크박스. 각 항목에 난이도(E/M/H)/공수(h)/우선순위(P0~P2) 부여.
- 전체 예상 공수 약 25일(1인·8h 기준), 최소 출시 경로 P0 만 10일. 달력 기준 코드사이닝·MS Store·Steam 심사 대기 포함 5~6주.
- 수익화 전략: A(Gumroad $9 라이선스) + B(Steam Direct $100 + DLC "드래곤 침공" $3) + C(팀 라이선스 $49, 로컬 UDP 브로드캐스트 리더보드) 3축. 3개월 목표 $2.7K ~ $3.1K.

---
