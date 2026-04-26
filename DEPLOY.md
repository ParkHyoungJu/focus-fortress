# Focus Fortress — Deployment Guide

배포는 **수동**이다. 이 문서는 빌드 산출물 생성부터 배포 채널 업로드까지의 순서를 정리한다.
현재 시점(2026-04-24) MVP 는 자동 업데이트 / 코드사이닝 / 스토어 등록을 포함하지 않는다.

---

## 1. 빌드

### 사전 준비

```bash
npm install
```

- `electron@^30`, `electron-builder@^24.13.3`, `active-win@^8`, `electron-store@^8` 네이티브 포함 설치.
- 첫 설치 시 electron-builder 가 Windows SDK(NSIS) 바이너리를 `%LOCALAPPDATA%\electron-builder\Cache\` 에 받는다. 약 30~60MB.

### 빌드 명령

| 명령 | 동작 |
|---|---|
| `npm start` | 개발 모드 실행 (electron 직접 기동, DevTools 열림) |
| `npm run pack` | `electron-builder --dir` — 설치파일 없이 `dist/win-unpacked/` 에 실행 가능한 폴더 출력. 빠른 sanity check 용 |
| `npm run build` | `electron-builder` — 현재 플랫폼용 NSIS 인스톨러 빌드 (Windows 에서 실행 시 .exe 출력) |
| `npm run build:win` | `electron-builder --win` — 크로스 플랫폼 환경에서도 Windows 타겟 강제 |

### 산출물

```
dist/
├── Focus Fortress Setup 0.1.0.exe     ← 사용자 배포용 NSIS 인스톨러
├── Focus Fortress Setup 0.1.0.exe.blockmap
├── latest.yml                          ← 향후 auto-update 용 (지금은 무시)
└── win-unpacked/                       ← 압축 해제된 실행 폴더
    ├── Focus Fortress.exe
    ├── resources/app.asar
    └── …
```

버전 번호는 `package.json` 의 `version` 필드에서 파생. 0.1.0 → 0.2.0 올릴 때 해당 필드만 수정.

---

## 2. 코드사이닝 (현재 미적용)

### 현황

MVP 는 **미서명** 바이너리를 배포한다. 결과:

- Windows SmartScreen 이 "Unrecognized app" 경고를 띄운다.
- 사용자는 `More info` → `Run anyway` 클릭 필요.
- 일부 안티바이러스가 휴리스틱으로 차단할 수 있다.

### 사용자용 우회 가이드 (랜딩페이지에 병기)

> **SmartScreen 경고가 뜨나요?**
> 1. "Windows protected your PC" 파란 창에서 `More info` 를 클릭하세요.
> 2. 하단에 `Run anyway` 버튼이 나타납니다.
> 3. 클릭하면 설치가 진행됩니다.
>
> Focus Fortress 는 현재 코드사이닝 인증서를 적용하지 않아 발생하는 경고입니다.
> 앱은 오프라인 전용이며 네트워크 통신을 하지 않습니다.

### 향후 계획

| 단계 | 인증서 | 예상 비용 | 효과 |
|---|---|---|---|
| v0.3+ | **OV (Organization Validation)** — DigiCert/Sectigo | 연 $200~300 | 서명은 되지만 SmartScreen "평판" 축적 필요 (다운로드 수 기반) |
| v1.0+ | **EV (Extended Validation)** | 연 $400~700 + HW 토큰 | SmartScreen 즉시 통과, 엔터프라이즈 배포 가능 |

서명 적용 시 `build` 섹션에 추가:
```json
"win": {
  "certificateFile": "cert.pfx",
  "certificatePassword": "${CSC_KEY_PASSWORD}"
}
```

---

## 3. 배포 채널

### 1) 프로젝트 랜딩페이지 (1순위)

- 정적 사이트 (예: `focus-fortress.app` 또는 GitHub Pages)
- 직접 다운로드 버튼: `Focus Fortress Setup 0.1.0.exe` S3/R2 호스팅
- SHA256 체크섬 병기: `certutil -hashfile "Focus Fortress Setup 0.1.0.exe" SHA256`
- 장점: 수수료 0, 자유로운 버전 관리
- 단점: SmartScreen 평판이 도메인 전체에 묶임 → 초기 다운로드 유저 경험 저하

### 2) itch.io (2순위, 무료 배포+선택적 유료)

- 업로드: **Upload Files** → Windows 플랫폼 체크 → `.exe` 그대로
- `butler push` 도구로 CLI 업로드 자동화 가능
- Pay-what-you-want 또는 고정가격 설정 가능
- 인디 게임/앱 트래픽 유입 기대
- itch.io 가 자체 SmartScreen 예외 처리를 해주지는 않음. 다만 .itch 앱 내 설치 시 경고 생략됨

### 3) Microsoft Store (향후, v0.5+)

- MSIX 패키징 필요: `electron-builder --win appx` 로 전환
- 파트너 센터 개인 개발자 등록 $19 (일회성)
- 장점: 코드사이닝 불필요 (MS 가 자동 서명), 자동 업데이트 무료, SmartScreen 통과
- 단점: 매출 15% 수수료, 심사 3~5영업일, `active-win` 이 Store 샌드박스에서 제한될 가능성 **요검증**

### 4) Steam (옵션 B, v1.0+)

- Steamworks 가입: $100 per app
- SteamPipe 로 업로드
- 장점: 트래픽, 업적/Cloud Save 플랫폼 활용
- 단점: 30% 수수료, 초기 등록 허들, Electron 앱 심사가 게임 기준으로 엄격

---

## 4. 최초 출시 체크리스트

### 에셋

- [ ] `assets/icon.png` 256x256 교체 (현재 플레이스홀더 부재, `assets/ICON_TODO.md` 참조)
- [ ] `assets/icon@2x.png` 512x512
- [ ] `assets/tray.png` 16x16 + 32x32
- [ ] 랜딩페이지 히어로 스크린샷 (타이머 화면 풀샷)
- [ ] 업적 미리보기 스크린샷 3종 (첫 세션 / 레벨업 오버레이 / 업적 탭)
- [ ] 30초 GIF 데모 (READY → START → 25분 스킵 → 레벨업 → 업적 해금)

### 메타

- [ ] `package.json` `version` 을 `0.1.0` → 출시 버전으로 확정
- [ ] `package.json` `author` 에 실명/법인명 + 이메일 기입
- [ ] `LICENSE` 파일 추가 (MVP: proprietary / All Rights Reserved)
- [ ] `README.md` 의 배포 URL 플레이스홀더 교체

### 빌드 품질

- [ ] `npm install` 클린 상태에서 `npm start` 정상 구동
- [ ] `npm run build` 로 NSIS 인스톨러 생성
- [ ] 별도 Windows 10 / 11 가상머신에서 설치 및 실행 확인
- [ ] active-win 네이티브 모듈이 패키징 후에도 동작하는지 확인
- [ ] electron-store 가 `%APPDATA%\focus-fortress\config.json` 에 정상 저장되는지 확인

### 배포물

- [ ] 인스톨러 SHA256 체크섬 생성 및 공개
- [ ] CHANGELOG 첫 엔트리 작성 (v0.1.0 기능 목록)
- [ ] Privacy Policy 페이지 (오프라인 앱이지만 "데이터 수집 없음" 명시 필요)
- [ ] 라이선스 / 환불 정책 명시 (Gumroad 프로 티어 준비 시)

### 런치

- [ ] itch.io 페이지 작성 (가격, 태그, 설명, 스크린샷)
- [ ] Product Hunt 런치 포스트 준비
- [ ] r/productivity, r/getdisciplined 커뮤니티 소개 포스트 초안
- [ ] Twitter/X 런치 스레드 (GIF 포함)

---

## 5. 버전 업데이트 플로우 (수동)

1. 기능/수정 완료 → `package.json` `version` 증가 (semver)
2. `CHANGELOG.md` 에 엔트리 추가
3. `npm run build` 로 새 `.exe` 생성
4. 랜딩페이지 + itch.io 에 각각 업로드
5. 기존 사용자에게는 앱 내에 "새 버전 알림" 기능이 **없으므로** (MVP 한계), 소셜/뉴스레터로 공지

auto-update 는 v0.4+ 에서 `electron-updater` + GitHub Releases 로 도입 예정. 그 전까지는 수동 재설치.

---
**담당**: publisher
**최종 수정**: 2026-04-24
