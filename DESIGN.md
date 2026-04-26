# Focus Fortress — Design

## 1. 디자인 원칙

1. **Pixel first, smooth later** — 모든 경계는 `border-radius: 0` 기본, 그림자는 blur 없는 offset 전용 (`4px 4px 0 0`). 픽셀 폰트 + `image-rendering: pixelated`. 캐주얼 게임 감성 > 모던 미니멀.
2. **HP 는 주인공이다** — 화면 중앙은 언제나 성 프레임 + HP 바 + 타이머. 나머지 UI(설정·통계)는 좌우 탭으로 밀어낸다. "지금 내 요새가 얼마나 버티고 있나" 가 한눈에 보여야 함.
3. **보상은 황금으로 빛난다** — 업적·레벨업·완주 이벤트에만 골드(`--color-gold-*`) + 발광 쉐도우(`--shadow-glow-gold`) 사용. 일반 상태에서 골드를 남발하지 않아 "획득 순간" 이 명확.
4. **위험은 피로 경고한다** — HP 30% 이하는 `.hp-bar[data-level="low"]` 로 맥박 애니메이션 + 블러드 글로우. 사용자가 차단앱에 오래 머물면 화면 전체가 생리적 불안감을 주도록.
5. **움직임은 step 기반** — 트랜지션 `steps(4, end)` 로 도트 캐릭터 호흡·깃발 펄럭임. 실제 8bit 게임처럼 프레임이 뚝뚝 떨어지는 감각.

## 2. 컬러 팔레트

| 토큰 | HEX | 용도 |
|---|---|---|
| `--color-bg` | `#0b1020` | 앱 기본 배경 (다크 네이비, 한밤의 성) |
| `--color-bg-deep` | `#05070f` | 프레임 내부 / 인풋 배경 |
| `--color-surface` | `#151a2d` | 카드 표면 |
| `--color-stone-500` | `#5c564d` | 성벽 본체, 기본 버튼 |
| `--color-stone-700` | `#3a352e` | 성벽 그림자 / 보더 |
| `--color-stone-900` | `#1f1c17` | 가장 진한 아웃라인, 도트 그림자 |
| `--color-banner-500` | `#b83232` | 깃발 레드, primary 버튼 (Start) |
| `--color-gold-500` | `#e0b32a` | XP/업적 강조 |
| `--color-gold-300` | `#ffdf6b` | 제목·타이머 숫자 |
| `--color-blood-400` | `#d93636` | HP 위험 경고 |
| `--color-accent` | `#7bd3ea` | 마법 블루 (phase 레이블, 링크) |
| `--color-text` | `#f2ecd8` | 본문 (양피지 톤, 순백 회피) |

선정 이유: 배경을 순흑이 아닌 **다크 네이비** 로 잡아 "성이 서 있는 밤하늘" 의 서사를 깔고, 스톤 그레이(성벽) → 배너 레드(깃발) → 골드(보상) 의 삼각 위계로 시선 동선을 만든다. 블러드 레드는 배너 레드보다 채도 높게 잡아 "일반 상태 빨강" 과 "위험 빨강" 이 혼동되지 않도록 분리.

## 3. 타이포그래피

- **Press Start 2P** — 제목, 버튼, 라벨 (8bit 감성 핵심). 작은 사이즈 전용 (10~14px).
- **VT323** — 타이머 숫자, 본문. 크게 써도 가독성 좋은 픽셀 모노. 기본 `font-size: 18px`.
- **system-ui fallback** — 폰트 로드 실패 시 무너지지 않도록.
- 타이머 숫자는 `font-variant-numeric: tabular-nums` 로 MM:SS 깜빡임 방지.

## 4. 스크린 레이아웃 (ASCII)

### 4-1. 메인 타이머 화면

```
+----------------------------------------------+
|  [FOCUS FORTRESS]    TIMER  ACHIEVE  STATS   |  <- nav (48px, stone-surface, 골드 로고)
+----------------------------------------------+
|                                              |
|           ### ### ### ### ### ###            |
|           # [R]  CASTLE PLACEHOLDER          |  <- castle-frame 320x240
|           #    #######  #######    #         |     (탑 + 본성 + 깃발 + 기사)
|           ######################             |
|                  [K]            (moon)       |
|                                              |
|    HP  [#############-----]  72 / 100        |  <- hp-bar (stripe pattern)
|                                              |
|              F O C U S   #1                  |  <- timer__phase (accent blue)
|            +----------------+                |
|            |   1 8 : 2 4    |                |  <- timer__clock (VT323 96px, gold)
|            +----------------+                |
|                                              |
|   [ PAUSE ]   [ STOP ]   streak: 3  XP: 420  |
|                                              |
+----------------------------------------------+
```

### 4-2. 업적 탭 (ACHIEVEMENTS)

```
+----------------------------------------------+
|  [FOCUS FORTRESS]   TIMER  [ACHIEVE]  STATS  |
+----------------------------------------------+
|   ACHIEVEMENTS                     4 / 10    |
|                                              |
|  +-------+  +-------+  +-------+  +-------+  |
|  |  [*]  |  |  [*]  |  |  [*]  |  |  [?]  |  |
|  | FIRST |  | 7-DAY |  |NO HIT |  | ???   |  |
|  | WATCH |  |STREAK |  |SESSION|  |LOCKED |  |
|  +-------+  +-------+  +-------+  +-------+  |
|                                              |
|  +-------+  +-------+  +-------+  +-------+  |
|  |  [?]  |  |  [*]  |  |  [?]  |  |  [?]  |  |
|  |LOCKED |  |LAST   |  |LOCKED |  |LOCKED |  |
|  |       |  |STAND  |  |       |  |       |  |
|  +-------+  +-------+  +-------+  +-------+  |
|                                              |
|  Recently unlocked: "LAST STAND" - survived  |
|  with HP 10 or less. +100 XP                 |
+----------------------------------------------+
```

잠금 배지는 `.badge[data-unlocked="false"]` 로 grayscale + opacity 0.5.
해금 배지는 `.badge__icon` 에 골드 글로우.

### 4-3. 통계 탭 (STATS)

```
+----------------------------------------------+
|  [FOCUS FORTRESS]   TIMER  ACHIEVE  [STATS]  |
+----------------------------------------------+
|   WEEKLY REPORT                   2026 W17   |
|                                              |
|  +------------+  +------------+              |
|  |   24       |  |  82 %      |              |
|  | SESSIONS   |  | COMPLETION |              |
|  +------------+  +------------+              |
|  +------------+  +------------+              |
|  |  10h 00m   |  |    7       |              |
|  |  FOCUSED   |  |  STREAK    |              |
|  +------------+  +------------+              |
|                                              |
|   DAILY SESSIONS                             |
|   M ####                    4                |
|   T ######                  6                |
|   W ###                     3                |
|   T #####                   5                |
|   F ##                      2                |
|   S ####                    4                |
|   S #                       1                |  <- 도트 바 차트 (stone + gold)
|                                              |
|   TOP ATTACKERS (blocked apps)               |
|   1. youtube.com     48 hits                 |
|   2. x.com           22 hits                 |
|   3. reddit.com       9 hits                 |
+----------------------------------------------+
```

## 5. 아이콘 스펙

MVP는 SVG inline placeholder 로 충분. 실제 도트 에셋은 Kenney.nl / OpenGameArt CC0 에서 교체.

| 아이콘 | 크기 | 스타일 | 용도 |
|---|---|---|---|
| castle | 160 x 120 px | 16px 그리드, stone-500 body / stone-900 outline | 중앙 프레임 |
| knight | 24 x 32 px | 4px 그리드, 1프레임 idle + 1프레임 bob | HP 잔량 표시 옆 |
| banner | 20 x 14 px | banner-500 + banner-700 inset | 성 꼭대기, 깃발 펄럭임 |
| moon | 12 x 12 px | gold-300 원 | 배경 밤하늘 |
| badge-frame | 56 x 56 px | stone-900 border 2px + gold-500 border when unlocked | 업적 |
| hp-heart | 8 x 8 px | blood-400 | HP 숫자 옆 이모티콘 대체 |
| crown | 16 x 16 px | gold-500 | 장비 해금 |
| sword | 16 x 16 px | stone-100 + gold-500 grip | 장비 해금 |

렌더링 규칙: 모든 SVG 에 `shape-rendering="crispEdges"` 지정, `viewBox` 는 픽셀 단위 정수. 애니메이션은 CSS `steps(N, end)` 만 사용 (ease-in 금지).

## 6. 반응형 / 윈도우 크기

Electron 기본 창 480 x 640, 최소 420 x 560. 데스크톱 앱이므로 진정한 반응형은 불필요하지만 창 리사이즈 시 타이머 폰트만 `clamp(64px, 18vw, 96px)` 로 축소.
