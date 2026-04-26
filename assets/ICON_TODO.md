# 아이콘 플레이스홀더 TODO

## 필요 에셋

| 파일 | 사이즈 | 용도 |
|---|---|---|
| `icon.png` | 256x256 PNG (1bpp 도트) | electron-builder win.icon — NSIS 인스톨러 + 실행파일 아이콘 |
| `icon@2x.png` | 512x512 PNG | 고DPI 디스플레이 대응 |
| `tray.png` | 16x16 / 32x32 PNG | 시스템 트레이 (main.js 에서 참조) |

## 디자인 방향

- **컨셉**: 1bpp 도트 기사 + 성벽 (DESIGN.md 팔레트 기준 stone-gray #4a4a52 + gold #d4a84a)
- **구성**: 정사각형 프레임 안에 중앙 도트 기사 실루엣, 하단 성벽 톱니(crenellation) 3~4칸
- **스타일**: Game Boy 시대 픽셀 아이콘 감성 (1~2px 디테일, 안티앨리어싱 금지)
- **배경**: 투명 또는 다크 네이비 #0b1020

## 소싱 계획

1. **1순위**: [Kenney.nl](https://kenney.nl/) CC0 도트 팩에서 "knight" / "castle tower" 16x16 발췌 후 256x256 업스케일 (nearest-neighbor)
2. **2순위**: Aseprite 로 직접 드로잉 (약 30분 작업)
3. **3순위**: itch.io CC0 픽셀 아이콘 팩 검색

## 현재 상태

- `assets/icon.png` **미생성** — `npm run build` 실행 시 electron-builder 가 경고 후 기본 electron 아이콘을 사용한다.
- `main.js` 의 Tray 생성부는 try/catch 로 감싸져 있어 `tray.png` 부재여도 앱 실행에는 지장 없음.

## 교체 방법

1. 위 사이즈대로 PNG 파일 3개를 이 디렉터리에 저장
2. `npm run build:win` 재실행
3. `dist/Focus Fortress Setup 0.1.0.exe` 의 파일 속성 → 아이콘 확인

---
**담당**: 디자이너 / 아티스트
**마감**: MVP 첫 출시 전 (권장)
