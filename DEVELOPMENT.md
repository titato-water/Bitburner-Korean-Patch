# 개발자 / 번역 기여자용 문서

사용자용 설치 안내는 [README.md](README.md)를 본다.

## 번역 작업
`node tools/todo.js <area>` → 번역 → `node tools/fill.js <area> <file.json>` → `node apply.js` → 게임에서 확인.
규칙과 용어는 `glossary.md`.

## 게임 업데이트 후
Steam 업데이트가 번들을 덮어쓰면 `node extract.js && node apply.js`를 실행한다.
원문이 바뀐 항목은 미번역으로 돌아가고 기존 번역은 `ko/_stale.json`에 보관된다. 미번역은 `node tools/stats.js`로 확인한다.

## 테스트
`node --test tests/*.test.js`

## 환경변수
`BITBURNER_DIR`로 게임 설치 경로를 바꿀 수 있다.

## 현재 상태
- 번역 완료: ui, game, story, docs 전부 (Bitburner v3.0.1 기준. 게임 폴더의 `version` 파일 `41.4.0`은 게임이 아니라 Electron 버전이다. 게임 버전은 `resources/app/package.json`의 `version`). 폰트는 D2Coding 번들.
- 번역하지 않는 것: 변경 이력 문서(Changelog), NS API 레퍼런스 문서, 열거형 이름(팩션/증강/범죄 등), 다크넷 인증 응답, 개발자 메뉴, 식별자·키로 쓰이는 문자열(옵션 탭 이름, 스탯 행 이름 등 약 240개). 근거는 `exclude.json`과 `work/progress.md`의 `Ruling:` 줄.

## 크래시 주의
같은 문장이 코드의 키로도 쓰이면 번역 시 크래시(복구 모드)가 난다. 스캐너(`lib/scan.js`)가 비교/키/속성 이름/식별자형 문자열 연결(`"BitNode"+n`)을 보호하지만, 새로 번역을 넣은 뒤에는 게임을 한 번 띄워 사이드바를 전부 열어 본다. 점검용으로는 게임을 `bitburner.exe --remote-debugging-port=9333`으로 띄우고 `work/walk.js`로 사이드바를 순회한다.

## 한계
- 번역은 `.orig`(원본 번들)에서 매번 다시 만든다. 게임이 업데이트되면 `extract.js`로 변경된 원문만 미번역으로 돌아온다.
- 문서/스토리의 조각난 JSX 문장은 조사를 고정해서 번역했다. 원문의 요소(팩션 이름 등)가 바뀌면 어색해질 수 있다.

## 릴리스 만들기
`pwsh tools/build-release.ps1` — 공식 포터블 `node.exe`를 받아 체크섬을 검증하고, `node_modules`와 함께 `dist/bitburner-ko.zip`으로 묶는다 (PowerShell 7 필요, `dist/`와 `node/`는 git에 올리지 않는다). 만든 zip은 GitHub 릴리스에 `bitburner-ko.zip` 이름 그대로 올린다 (README의 직접 다운로드 링크가 이 이름을 쓴다).
