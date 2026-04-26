# Focus Fortress — 집중 RPG 데스크톱 타이머

**생성일**: 2026-04-24
**슬러그**: focus-fortress
**배치**: afternoon #1

## 한 줄 요약
25분 포모도로를 "성 방어 RPG" 로 게이미피케이션한 Windows 데스크톱 앱 — 활성창이 차단 목록에 들어가면 성의 HP가 깎이고, 세션을 완주하면 도트 기사가 XP·장비·배지를 획득해 성장한다.

## 타겟 사용자
- 포모도로 앱을 3개 이상 써봤지만 "30초 만에 껐다" 경험이 있는 20~30대 지식노동자·개발자·학생
- 트위치/유튜브·X·쇼츠 등 "탭 하나 더 열었다가 30분 날리는" 디지털 주의산만에 시달리는 재택근무자
- 습관 트래커는 싫지만 게임 도전과제·업적 수집에는 강한 보상감을 느끼는 Steam 게이머 교집합

## 핵심 기능 (MVP)
1. **성 방어 세션 타이머**: 25분/5분 포모도로 사이클. 세션 시작 시 도트 기사 + 성 SVG 가 체력 100으로 등장. 매 초 프로그레스바 + 남은 시간 표시. 트레이 아이콘에서 상태 확인.
2. **활성창 기반 HP 감쇠**: `active-win` (npm) 으로 현재 포그라운드 앱 이름/창제목을 5초마다 폴링. 사용자가 설정한 차단 키워드(예: youtube, twitch, reddit, 인스타, 쇼츠) 포함 시 초당 HP -2. HP 0 이면 세션 실패 → 성 파괴 애니메이션, 연속 완주 스트릭 리셋.
3. **성장·업적 시스템**: 완주 1회 = +50 XP, HP 풀세션 = +20 보너스, 7일 스트릭 배지/14일 배지/"불굴의 수호자"(HP 10 이하 생존) 등 10개 업적. 장비(왕관·망토·검) 해금 → 도트 기사 커스텀. 통계 탭에서 주간 완주률·총 집중시간·차단앱 랭킹 차트.

## 차별화 포인트
1. **"HP 있는 포모도로"**: 기존 포모도로(Ketchup, Pomodorino, Forest)는 "시작/일시정지" 이분법. Focus Fortress 는 HP 라는 중간상태를 도입해 "살짝 딴짓" 의 실제 비용을 숫자로 체감하게 함. Forest 는 나무가 죽거나 말거나 이분법이지만, 여기선 "위기를 버텨낸 수호자" 라는 서사가 생김.
2. **진짜 차단 아닌 "명예차단"**: 프록시·hosts 파일·관리자권한 불필요. active-win 관찰만 하므로 설치 즉시 동작. 관리자 권한 요구하는 RescueTime·Cold Turkey 대비 진입장벽 0. 차단이 아니라 "감시 + 페널티" 이므로 사용자 자율성 존중.
3. **Steam 감성 업적**: 글로벌 업적 통계(MVP 는 로컬, 시즌 2 에 서버) + 도트 아트 + 사운드이펙트("성문 폐쇄!") 로 Steam 게이머 감성 공략. 생산성 앱 UX가 대체로 미니멀 중성톤인 시장에서 확연히 구분.

## 기술 스택
- 런타임: **Electron 30** (Tauri 도 고려했으나 Windows 단일 타깃 + active-win npm 호환성이 Electron 쪽이 압도적으로 빠른 MVP)
- 프론트: Vanilla HTML/CSS/JS (MVP) — 도트/SVG 애니메이션은 CSS transform + requestAnimationFrame
- 활성창 감지: `active-win` (npm, Windows/macOS/Linux 모두 지원, 네이티브 바이너리 포함)
- 저장소: `electron-store` (JSON 파일) — 세션 로그·업적·설정
- 트레이: Electron Tray API + nativeImage
- 사운드: Web Audio API + 무료 8bit sfx (freesound.org CC0)
- 빌드: `electron-builder` (.exe NSIS 인스톨러)
- 외부 API: **없음** (100% 로컬, 오프라인 동작)

## 수익 모델
### 옵션 A. 일회성 라이선스 ($9)
- 무료: 최대 3개 차단 키워드, 기본 도트 기사, 5개 업적
- 프로 $9 평생: 무제한 키워드, 10+ 업적, 장비 전체 해금, 테마(중세/사이버펑크/우주), 주간 리포트 PDF
- TAM: Forest 앱 누적 유저 3천만+, 국내 포모도로 키워드 월 검색량 5만+. 0.01% 전환 = 3천 명 × $9 = $27K
- 진입장벽: 낮음 — Gumroad/Paddle 라이선스 키 발급 1일.
- 경쟁서비스: Forest ($1.99 모바일), Focus ($4.99 macOS), Cold Turkey Blocker ($39)

### 옵션 B. Steam 출시 + 무료 제공 + DLC
- 기본 무료, DLC "시즌1: 드래곤 침공" ($3), "시즌2: 좀비 아포칼립스" ($3) — 테마팩/기사 스킨/새 업적
- Steam 리뷰·위시리스트 바이럴 효과. 생산성 게임 카테고리는 Stardew Valley 팬 교집합 큼.
- TAM: Steam MAU 1.3억, "productivity game" 태그 사용자 약 50만.
- 진입장벽: 중간 — Steam Direct $100 수수료 + Steamworks SDK 연동 필요(MVP 이후).
- 경쟁서비스: Habitica(RPG 할일관리, 무료), Apple Peelers(Steam 포모도로)

### 옵션 C. 회사·학원 라이선스 ($49/팀)
- 스터디그룹·학원·코워킹스페이스 대상 "리더보드 팩" — 팀원 완주률 경쟁. 로컬 네트워크 브로드캐스트로 서버 불필요.
- TAM: 국내 코딩학원/독서실 약 5천 곳, 50곳 × $49 = $2.5K/월 반복 가능.

## 선정 근거
afternoon #1 은 모바일/Windows/CLI 편향 — Focus Fortress 는 Windows 데스크톱(Electron) 에 정확히 부합. 오늘 오전의 freelance-cashflow(비즈니스), mood-palette(라이프), jwt-decoder(개발자툴) 과 도메인이 완전히 다름(생산성+게이미피케이션). 성격은 "실용유틸 + 재미" 하이브리드로 오늘 부족한 재미·화제성 축도 채움.

| 후보 | 실용성 | MVP | 차별화 | 수익 | 재미 | 총합 |
|---|---|---|---|---|---|---|
| clipvault (CLI 클립보드 히스토리) | 5 | 5 | 4 | 3 | 2 | 19 |
| **Focus Fortress (Electron 포모도로 RPG)** | 4 | 3 | 5 | 4 | 5 | **21** |
| daybrief (PWA 아침 브리핑) | 3 | 3 | 3 | 3 | 3 | 15 |

clipvault 는 실용·MVP 최고점이지만 수익·재미가 약하고 "fzf + clipboard" 조합은 이미 clipman·clipcat 등 리눅스 레퍼런스가 풍부해 차별화가 약함. Focus Fortress 는 MVP 적합성(3점) 이 다소 낮지만 active-win + Electron 조합으로 40분 내 "타이머 + HP 감쇠 + 업적 1개" 동작 가능. 수익·재미·차별화에서 압도적. 오후 배치 1번 타자로 화제성 있는 Electron 앱을 꺼내는 편이 하루 전체 믹스에 이득.

## 오늘 트렌드 근거
- **Tauri/Electron 데스크톱 앱 생태계 성숙**: 2026년 Tauri 2.x 모바일 지원·Electron 34.x 보안모델 성숙으로 1인 개발자의 데스크톱 앱 출시 허들이 역대 최저. 솔로 개발자의 "작고 빠른 Windows 도구" 시장이 다시 열림. (https://tech-insider.org/tauri-vs-electron-2026/)
- **포모도로 앱의 한계 자각 확산**: "Pomodoro lying to me" 류 비판이 dev.to 에 재등장(Ketchup 사례). 기존 시간고정형 포모도로의 UX 결함에 대한 수요가 확인됨. 게이미피케이션은 이 결함에 대한 대안 포지셔닝. (https://dev.to/ursa321/i-got-tired-of-pomodoro-lying-to-me-so-i-built-a-dual-budget-desktop-timer-5aol)
- **습관/집중 앱의 게이미피케이션 트렌드**: 2026 Habit Tracker 리뷰 다수에서 "challenge, streak, AI 개인화" 가 공통 신규 기능으로 거론. Steam 생산성 게임 Stardrop·Grow Up 류 인기와 결합 가능. (https://fhynix.com/best-habit-tracking-apps/)

## 외부 의존성·리스크
- **active-win 네이티브 바이너리**: Windows/macOS/Linux 각각 prebuilt binary 포함. Electron 빌드 시 electron-builder rebuild 필요 — 리스크 낮음, 문서 잘 되어 있음.
- **"활성창 감시" 개인정보 우려**: 창 제목을 읽으므로 사용자가 프라이버시 걱정 가능. → 설정에 "로컬 저장만, 네트워크 전송 0" 뱃지 표시 + 첫 실행 시 명시 동의. 전송 0 이므로 GDPR 위험 없음.
- **Windows Defender 오탐**: Electron 앱 + 활성창 폴링은 드물게 AV 탐지 가능. 코드사이닝 인증서(annual $70~300) 는 프로덕션 전제. MVP 는 포털 배포 시 "SmartScreen 우회" 가이드 제공.
- **도트 아트 에셋**: OpenGameArt CC0, Kenney.nl 무료 팩 활용. MVP 도트 기사·성 한 세트만 번들. 리스크 없음.
- **게이미피케이션 피로**: "재미있어 보여서 다운로드 → 실제로는 또 다른 앱 부담" 리스크. 대응: 세션 시작/종료 2클릭 이내, 배경 실행 시 CPU 2% 이내 엄격 관리.
