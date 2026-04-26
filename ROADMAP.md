# 로드맵: Focus Fortress

> 2026-04-24 MVP 를 완성 제품으로 끌고 가는 길. 각 항목은 체크박스로 진행을 추적하고, 공수는 1인 기준 시간(h). 8h = 1d 로 환산. 난이도(E/M/H) 와 우선순위(P0 필수 / P1 중요 / P2 선택) 병기.

---

## Phase 1 — MVP (DONE, 2026-04-24)

오늘 오후 한 세션 내 완료된 범위. 기록 용도로만 체크 처리.

- [x] Electron 30 스캐폴드 (frameless 960x640, contextIsolation) — designer/windows-dev 14:13
- [x] IPC 브릿지 8채널 (active-win / store / window / app) — windows-dev
- [x] Timer 상태머신 25/5 포모도로 (`PHASE.FOCUS/BREAK`, `formatMMSS`) — windows-dev
- [x] HP 시스템 (100 기본, `onZero` 콜백) — windows-dev
- [x] blockDetector 5초 폴링 + 차단 키워드 9종 프리셋 — windows-dev
- [x] electron-store 영속화 (keywords / xp / level / streak / sessionLog / achievements) — windows-dev
- [x] 업적 10종 순수함수 정의 (`first_watch` ~ `dawn_knight`) — windows-dev
- [x] XP/레벨업 오버레이 (+50 완주, +20 HP 100 보너스) — windows-dev
- [x] 디자인 토큰 + brand.css (5색 팔레트, Press Start 2P/VT323, steps 모션) — designer 14:20
- [x] 탭 UI (TIMER / ACHIEVEMENTS / STATS) + 배지 그리드 + 세션 로그 — windows-dev
- [x] electron-builder NSIS 빌드 설정 (`npm run build`, `com.autoprogramming.focus-fortress`) — publisher 14:28
- [x] DEPLOY.md + ICON_TODO.md + README 보강 — publisher
- [x] QC 스모크 패스 (로컬실행가능, DOM id 28개 교차검증, formatMMSS 단위검증) — qc-tester 14:20

**Phase 1 결과**: v0.1.0 로컬실행가능. 아이콘·시각검증·audit·데미지 granularity·세션 cap 5건이 Phase 2 로 이관.

---

## Phase 2 — 완성도 (MVP 의 빈틈 메우기)

목표: 친구에게 설치시켜 보여줄 수 있는 v0.2.0. QC Phase 2 후보 5건 + 제품 완성도 4건.

### 2.1 QC 이관 이슈 해결

- [ ] **아이콘 실제 제작** (Kenney.nl CC0 "Platformer Pack Medieval" 또는 "1-Bit Pack" 발췌) — tray 16/32 + 앱 아이콘 256 + 인스톨러 512 + ico 컨테이너. `assets/icon.png`·`assets/icon@2x.png`·`assets/tray.png` 를 실제 PNG 로 교체, `assets/icon.ico` 생성 후 electron-builder `win.icon` 연결. `ICON_TODO.md` 는 삭제. — **E / 3h / P0**
- [ ] **Playwright for Electron 스모크 테스트** — `@playwright/test` + `playwright` 추가. `tests/smoke.spec.ts` 에서 `_electron.launch` 후 창이 뜨는지·`#timer-clock` 텍스트가 `/^\d{2}:\d{2}$/` 매칭하는지·`#btn-start` 클릭 후 1초 뒤 시간이 감소하는지 검증. `npm test` 스크립트 등록. CI 는 Phase 3 에서. — **M / 4h / P0**
- [ ] **npm audit 취약점 정리** — `electron-store` 8.2.0 → 9.x (ESM 전환 주의), `electron-builder` 24.x → 25.x 로 bump. transitive dep inflight/glob@7/rimraf@3 deprecation 해소. 잔존 high 는 사유 주석으로 `.audit-exceptions.md` 기록. 목표: high 0건, low 2건 이하. — **M / 3h / P0**
- [ ] **blockDetector 매초 감쇠로 수정** — 현재 5초 폴링에서 히트 시 -10 단발. `blockDetector.js` 에서 "latched hit" 상태 도입: 최근 폴링에서 매칭되면 `setInterval(1000)` 로 -2/s 적용, 다음 폴링에서 safe 확인 시 해제. 테스트: 30초 차단앱 포그라운드 → HP 100 → 40 (-60) 확인. — **M / 3h / P0**
- [ ] **세션 로그 200 cap 을 7일 롤링으로 변경** — `store.js:65` 의 `slice(-200)` 를 `filter(e => Date.now() - e.ts < 7 * 864e5)` 로 교체. 구버전 cap 방식과의 마이그레이션 1회 실행 플래그(`storeVersion: 2`) 기록. UI 의 `session-log` 최근 7일 표시. — **E / 2h / P1**

### 2.2 핵심 기능 보완

- [ ] **active-win 폴링 주기 사용자 설정** — 설정 탭(신규) 에 1s / 3s / 5s 라디오. 기본 5s. `blockDetector.setInterval(ms)` API 추가. store 키 `pollingIntervalMs`. 1s 선택 시 CPU 사용량 경고 토스트. — **M / 3h / P1**
- [ ] **차단 키워드 프리셋** — 설정 탭에 3개 프리셋 버튼: "개발 집중"(reddit, hackernews, x.com, youtube), "공부 집중"(youtube, instagram, tiktok, 쇼츠, netflix), "원고 모드"(slack, discord, telegram, kakaotalk). 클릭 시 현재 키워드 교체 여부 컨펌. 커스텀 프리셋 저장은 Phase 4. — **M / 4h / P1**
- [ ] **첫 실행 온보딩 (3단계 튜토리얼)** — `store.get('onboardingComplete')` 가 false 면 오버레이 모달. 스텝1: 성 방어 컨셉 소개(성+기사 일러스트). 스텝2: 차단 키워드 3개 선택. 스텝3: 첫 25분 시작 버튼. 스킵 가능, 완료 시 플래그 true. — **M / 5h / P1**
- [ ] **통계 탭 실데이터 연동 (Chart.js or 순수 SVG 막대)** — 번들 크기 고려해 순수 SVG 선택. `stats.js` 모듈 신설: `sessionLog` 에서 요일별 집계 → `#bar-chart` 에 SVG rect 7개 렌더. "TOP ATTACKERS" 는 `blockedAppCounts` 집계. 주간 리셋 경계 월요일 00:00 KST. — **M / 5h / P0**

### 2.3 기본 품질

- [ ] **에러 상태·빈 상태 UI** — 세션 로그 비었을 때 "아직 수호한 기록이 없습니다" 메시지, 차단 키워드 0개일 때 "모든 앱을 허용 중입니다" 경고 배너, active-win 실패 시 재시도 버튼. — **E / 2h / P1**
- [ ] **Lighthouse 접근성 80+** — Electron DevTools 에서 Lighthouse 수동 실행. `button` 에 `aria-label`, 탭 `role="tablist"`, HP 바 `role="progressbar" aria-valuenow`, 레벨업 오버레이 `aria-live="assertive"`. 색대비 `--color-stone-500` on `--color-bg` 검증. — **M / 3h / P2**
- [ ] **Sentry 통합 (무료 티어)** — `@sentry/electron` 추가. main/renderer 양쪽 init. DSN 은 `.env` → electron-builder extraResources 로 주입. 사용자 동의 플래그 `telemetryEnabled` (온보딩에서 opt-in). 첫 주 크래시 0건 모니터링. — **M / 3h / P2**
- [ ] **창 리사이즈 / 최소 크기 검증** — DESIGN.md 의 420x560 최소 크기 실측, 타이머 `clamp(64px, 18vw, 96px)` 동작 확인. 풀스크린 레벨업 오버레이가 작은 창에서도 중앙정렬인지 QA. — **E / 2h / P2**

**Phase 2 합계**: 9h (2.1 3건 P0 + 6h 1건 P0) + 3h P0 통계 + 12h P1 + 10h P2 + 2h E = 약 **42h ≈ 5.25d**

---

## Phase 3 — 배포

목표: itch.io + Microsoft Store 양방향 출시로 v0.3.0 → v0.5.0. DEPLOY.md 의 25개 체크리스트를 3개 그룹으로 묶어 집행.

### 3.1 배포 준비물 (DEPLOY.md §4 에셋+메타+빌드품질 요약)

- [ ] **에셋 세트 확정** — 랜딩 히어로 스크린샷 1920x1080, 업적 탭 스크린샷 3종, 30초 GIF 데모(ffmpeg palette 최적화 <3MB), OG 이미지 1200x630, favicon 16/32/48 ico. — **M / 5h / P0**
- [ ] **메타 확정** — `package.json` version 0.2.0 → 0.3.0, author 실명/이메일(qkrgudwn78@gmail.com 또는 법인), description 영문 120자, LICENSE 파일(EULA 템플릿 기반 proprietary), README 의 `https://example.com` 플레이스홀더 제거. — **E / 2h / P0**
- [ ] **프라이버시/약관 페이지** — "데이터 수집 없음, 네트워크 전송 0" 명시, Sentry opt-in 시만 크래시 전송 고지. GitHub Pages 또는 랜딩에 `/privacy`·`/terms` 2페이지. — **E / 3h / P0**
- [ ] **CHANGELOG.md 첫 엔트리** — v0.1.0 ~ v0.3.0 릴리즈 노트. Keep a Changelog 포맷. — **E / 1h / P1**
- [ ] **404/500 에러 페이지** (랜딩만 해당, 앱은 frameless) — **E / 1h / P2**
- [ ] **Windows 10/11 VM 클린 설치 테스트** — Hyper-V 또는 VirtualBox 에서 NSIS 인스톨러 실행, active-win 네이티브 모듈 동작, `%APPDATA%\focus-fortress\config.json` 생성 확인. — **M / 3h / P0**
- [ ] **인스톨러 SHA256 체크섬 공개** — `certutil -hashfile` 자동화 스크립트 `scripts/release.ps1` 작성, 랜딩 다운로드 버튼 옆 표기. — **E / 1h / P1**

### 3.2 플랫폼별 업로드

- [ ] **코드사이닝 OV 구매 (DigiCert 또는 Sectigo, 연 $200~300)** — 법인 또는 개인사업자 등록(DUNS 없어도 OV 가능한 벤더 선택). 인증서 pfx 수령 후 `build.win.certificateFile` + GitHub Actions Secret 주입. 발급 2~5영업일 대기 포함. — **H / 8h / P0**
- [ ] **itch.io 업로드 (butler CLI)** — 페이지 작성(가격: Pay-what-you-want 최소 $0, suggested $9), 태그(productivity, gamification, pomodoro, pixel-art), 스크린샷 4장, butler push 자동화. — **M / 4h / P0**
- [ ] **electron-updater + GitHub Releases 자동 업데이트** — `electron-updater` 추가, main.js 에 `autoUpdater.checkForUpdatesAndNotify()`, `build.publish: { provider: 'github' }`. GitHub Actions 워크플로우: 태그 push → build → release 업로드 → `latest.yml` 게시. — **H / 6h / P0**
- [ ] **Microsoft Store 제출 (MSIX)** — electron-builder `--win appx`, 파트너센터 개인 등록 $19, active-win 이 Store 샌드박스에서 동작하는지 실기기 검증(DEPLOY.md §3-3 미확인 리스크). 심사 3~5영업일 대기. 실패 시 데스크톱 브릿지 모드 재시도. — **H / 10h / P1**
- [ ] **배포 후 실사용 스모크 테스트** — 다운로드 → 설치 → 첫 세션 25분 완주 → 레벨업 확인 → 앱 종료/재시작 → 데이터 영속 확인. 본인 메인 PC 말고 여분 랩탑에서. — **E / 2h / P0**

### 3.3 분석·모니터링·마케팅

- [ ] **Plausible 또는 GA4 랜딩 설치** — 오프라인 앱 본체에는 미적용(프라이버시), 랜딩/다운로드 페이지만. 다운로드 클릭 이벤트 추적. — **E / 2h / P1**
- [ ] **Sentry 크래시 대시보드 세팅** — 알림 규칙(크래시 주간 10건 초과 시 이메일), 소스맵 업로드. — **E / 2h / P2**
- [ ] **Product Hunt 런치 준비** — 갤러리 이미지 4장, 첫 댓글 사전 작성, hunter 섭외 또는 self-hunt, 화요일 00:01 PST 공개. — **M / 4h / P1**
- [ ] **r/productivity / r/getdisciplined 소개글 초안** — "I built an RPG pomodoro where distractions attack your castle" 스크립트 + GIF. 셀프프로모 금지 조항 확인 후 주말 게시. — **E / 2h / P1**
- [ ] **Twitter/X 런치 스레드** — 5트윗 구조(문제 → MVP 데모 GIF → HP 감쇠 원리 → 업적 스크린샷 → 다운로드 링크). — **E / 2h / P1**

**Phase 3 합계**: P0 34h + P1 21h + P2 3h = 약 **58h ≈ 7.25d** (코드사이닝 대기 2~5일 별도)

---

## Phase 4 — 수익화

목표: IDEATION.md 의 A(라이선스 $9) + B(Steam/DLC) + C(팀 라이선스 $49) 3축 가동. 첫 3개월 $2.7K.

### 4.1 옵션 A — Gumroad 일회성 라이선스 ($9)

- [ ] **Gumroad 상품 등록** — 제품명 "Focus Fortress Pro License", 가격 $9 일회성, 썸네일 + 4장 갤러리, 라이선스 키 자동 발급 활성화. Gumroad Discover 태그 productivity. — **E / 3h / P0**
- [ ] **라이선스 키 검증 시스템** — 앱 내 "Enter License" UI, Gumroad License API (`/v2/licenses/verify`) 호출. 오프라인 캐시(30일 grace) + 기기 2대 허용. `store.proLicenseKey` + `store.proActivatedAt` 저장. — **H / 8h / P0**
- [ ] **프로 티어 해금 로직** — `isPro()` 헬퍼, 무료 제한: 키워드 최대 3개, 업적 5개 노출, 테마 고정(중세). 프로 해제: 무제한 키워드, 10개 업적 전체, 테마 3종(중세/사이버펑크/우주), 주간 PDF 리포트. 해제 시 토스트 "왕관이 빛납니다". — **M / 6h / P0**
- [ ] **테마 2종 추가 (사이버펑크 / 우주)** — 토큰 변종 2세트: cyber(네온 핑크/시안/다크 보라), space(딥 블랙/스타 화이트/퍼플). 토큰 스위치 API, 설정탭 미리보기 카드. 도트 기사 스킨은 Kenney.nl 추가 팩. — **H / 10h / P1**
- [ ] **주간 PDF 리포트** — `pdfkit` 또는 `puppeteer` 로 PDF 생성: 주간 세션 수/완주율/집중시간/top attackers/업적 해금. 매주 일요일 자정 자동 생성 → `Downloads/focus-fortress-week-YYYYWW.pdf`. — **M / 5h / P1**

### 4.2 옵션 B — Steam Direct $100 + DLC

- [ ] **Steamworks 가입 + 앱 등록 $100** — 법인/개인 세무정보, W-8BEN(해외 수익 원천징수 조정), 은행계정. 앱 프로필 작성: 태그 Productivity/Indie/Pomodoro/Pixel Art. — **M / 5h / P0**
- [ ] **Steamworks SDK 연동** — `greenworks` 또는 `steamworks.js` electron 바인딩. Steam 실행 체크, Steam Cloud sessionLog 동기화, Steam 업적 10개 매핑(로컬 업적 → Steam achievement id). — **H / 10h / P1**
- [ ] **Steam 스토어 페이지** — 트레일러 45초(DaVinci Resolve 컷 편집), 스크린샷 5장, 짧은/긴 설명, 시스템 요구사항. 한/영 2언어. — **M / 6h / P0**
- [ ] **DLC "드래곤 침공" ($3)** — 신규 테마(화염/드래곤 실루엣 배경), 추가 업적 5종("드래곤 슬레이어" 등), 보스 난입 랜덤 이벤트(세션 중 30% 확률 HP -20 쇼크). Steam DLC 등록 + 본편 무료 시 DLC 유료 전략. — **H / 14h / P1**
- [ ] **Steam 런칭 캠페인** — Steam Next Fest 데모 참가, 생산성 게임 큐레이터 10곳 키 발송, Steam 할인 전략(런칭 -10%). — **M / 4h / P2**

### 4.3 옵션 C — 팀 라이선스 $49 (로컬 브로드캐스트 리더보드)

- [ ] **로컬 UDP 브로드캐스트 리더보드** — 같은 LAN 에서 앱 실행 시 UDP 브로드캐스트(port 41814) 로 사용자명/완주세션/XP 송신. 리더보드 탭(팀 라이선스 전용) 에 실시간 리스트. 서버 불필요. — **H / 12h / P1**
- [ ] **팀 라이선스 발급 (Gumroad variant)** — 동일 Gumroad 상품의 $49 variant, 라이선스키 1개로 최대 10기기. 리더보드 기능만 해제. — **E / 3h / P1**
- [ ] **학원/코워킹 영업자료** — 1페이지 PDF: 효과(집중시간 +30% 가정), 가격, 도입 가이드. 5곳 콜드메일. — **M / 4h / P2**

### 4.4 수익화 목표·지표

- [ ] 런칭 후 30일: Gumroad 전환 50건 ($450) — 관찰
- [ ] 런칭 후 60일: Steam 무료 다운로드 5K + DLC 100건 ($300) — 관찰
- [ ] 런칭 후 90일: 프로 라이선스 누적 300건 × $9 = **$2,700** + DLC $300 + 팀 라이선스 2건 $98 ≈ **$3.1K** — 목표

**Phase 4 합계**: P0 28h + P1 65h + P2 8h = 약 **101h ≈ 12.6d**

---

## 전체 일정 요약

| Phase | 예상 공수 | 누적 | 비고 |
|---|---|---|---|
| Phase 1 — MVP | DONE | — | 2026-04-24 완료 |
| Phase 2 — 완성도 | 5.25d | 5.25d | QC 5건 + 기능 4건 + 품질 3건 |
| Phase 3 — 배포 | 7.25d | 12.5d | 코드사이닝 대기 2~5일 별도 |
| Phase 4 — 수익화 | 12.6d | **25.1d** | 3축 (Gumroad + Steam + 팀) 전부 포함 |

**총 예상 공수**: 약 **25일 (1인 기준, 하루 8시간)** + 외부 대기 시간(코드사이닝·MS Store·Steam 심사) 합산 시 달력 기준 5~6주.

우선순위 P0 만 추출 시: 2.1 P0 9h + 2.2 P0 5h + 3.1 P0 13h + 3.2 P0 24h + 3.3 P0 0h + 4.1 P0 17h + 4.2 P0 11h = **79h ≈ 약 10일** 최소 출시 경로.

---

## 성공 지표 (출시 후 3개월)

1. **MAU 2,000** — itch.io + Store + 랜딩 합산 월간 실행 유저
2. **완주율 60%+** — 시작한 세션 중 HP 0 이 아닌 상태로 25분 완료 비율 (텔레메트리 opt-in 기반)
3. **Gumroad 프로 전환 300건 × $9 = $2,700** — 무료 → 프로 전환율 15%
4. **Steam 위시리스트 3,000+** — DLC 런칭 전 위시 축적
5. **팀 라이선스 2건 체결** — 국내 코딩학원/스터디카페 파일럿

---

## 리스크 & 대응

1. **active-win MS Store 샌드박스 제한** — DEPLOY.md 에서도 미검증 항목. 대응: Phase 3.2 초기에 프로토타입 MSIX 빌드로 선검증. 실패 시 itch.io + 랜딩 직배포로만 운영하고 Store 는 Phase 4 로 연기.
2. **코드사이닝 없이 SmartScreen 차단 → 초기 다운로드 이탈** — OV 인증서라도 평판 축적 전까지 경고 유지. 대응: 랜딩에 "More info → Run anyway" 가이드 GIF 병기, 첫 2주 얼리 어답터 전용 안내.
3. **Gumroad 라이선스 키 크래킹** — electron 앱은 asar 디컴파일 쉬움. 대응: 서버 검증 + 기기 fingerprint + grace period. 크래킹 완전차단 대신 "정직한 유저 1% 이탈 방지" 수준 목표.
4. **Steam 심사 거부 (게임 기준 엄격)** — 대응: "생산성 도구이지만 게이미피케이션 요소" 라는 카테고리 정공법, 실패 시 Steam 앱 스토어(비게임) 트랙으로 재신청.
5. **게이미피케이션 피로감 (IDEATION 리스크 재확인)** — 2주차 이탈률 모니터링. 대응: 온보딩 "매일 25분만" 카피, 과도한 알림/토스트 금지, 주간 리포트로 retention 유도.
6. **주 2회 수준 관찰 필요**: Sentry 크래시율, audit 신규 취약점, itch.io 리뷰, Gumroad 환불 사유.

---

**담당**: roadmap-planner
**최종 수정**: 2026-04-24
