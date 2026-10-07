# 비트버너(Bitburner) 한글패치

**Steam판 Bitburner를 한국어로 즐기세요.** 메뉴와 화면, 게임 내 문서, 스토리를 한국어로 보여 주는 비공식 한글패치입니다. 한글이 깨지지 않도록 D2Coding 폰트도 함께 적용합니다.

[![최신 릴리스](https://img.shields.io/github/v/release/titato-water/Bitburner-Korean-Patch?label=%EC%B5%9C%EC%8B%A0%20%EB%A6%B4%EB%A6%AC%EC%8A%A4)](https://github.com/titato-water/Bitburner-Korean-Patch/releases/latest)
[![라이선스: MIT](https://img.shields.io/badge/%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4-MIT-blue)](LICENSE)

| | |
|---|---|
| 지원 게임 버전 | **Bitburner v3.0.1** (게임 왼쪽 사이드바 맨 위에 표시되는 버전) |
| 지원 환경 | Windows + Steam |
| 필요한 것 | [Node.js](https://nodejs.org/) 18 이상 |
| 되돌리기 | 언제든 `restore.bat` 한 번으로 원본 복원 |

> 게임 파일을 배포하지 않습니다. 내 컴퓨터에 설치된 게임에 번역을 적용하는 방식이라 게임 데이터와 세이브는 그대로입니다.

## 3분 설치

1. **[최신 릴리스](https://github.com/titato-water/Bitburner-Korean-Patch/releases/latest)에서 `bitburner-ko.zip`을 받아 압축을 풉니다.**
   (`Code` → `Download ZIP`으로 받아도 되지만, 그 경우 설치 때 `install.bat`이 필요한 구성요소를 인터넷에서 받습니다.)
2. [Node.js](https://nodejs.org/) LTS를 설치합니다. 이미 있다면 건너뜁니다.
3. **Bitburner를 완전히 종료합니다.**
4. 압축을 푼 폴더의 **`install.bat`을 더블클릭**합니다.
5. `적용이 끝났습니다`가 나오면 게임을 실행합니다.

되돌리려면 게임을 종료하고 **`restore.bat`을 더블클릭**하세요.
게임이 기본 Steam 경로가 아닌 곳에 있으면 `install.bat`이 경로를 물어봅니다.

## 번역 범위
- **번역됨:** 메뉴와 화면 문구, 게임 내 문서, 스토리와 문헌
- **번역하지 않음:** 변경 이력(Changelog), 스크립트용 API 레퍼런스(`ns` 함수 문서), 팩션/증강/범죄 같은 고유 이름, 개발자 메뉴
- 코드에서 키로도 쓰이는 일부 문자열(옵션 탭 이름 등)은 번역하면 게임이 오류를 내기 때문에 영어로 둡니다.

## 터미널로 직접 설치하기
`install.bat`을 쓰지 않고 직접 하고 싶은 경우입니다.

```
npm install        # 최초 1회 (zip에 node_modules가 들어 있다면 생략 가능)
node apply.js      # 패치 적용 (게임 종료 상태에서)
node restore.js    # 원래대로 되돌리기
```

게임이 기본 경로(`C:\Program Files (x86)\Steam\steamapps\common\Bitburner`)가 아닌 곳에 있다면 경로를 환경변수로 지정합니다.

PowerShell:
```
$env:BITBURNER_DIR = "D:\SteamLibrary\steamapps\common\Bitburner"
node apply.js
```
명령 프롬프트(cmd):
```
set BITBURNER_DIR=D:\SteamLibrary\steamapps\common\Bitburner
node apply.js
```

## 게임이 업데이트된 뒤
Steam 업데이트가 게임 파일을 원본으로 되돌립니다. Bitburner를 종료하고 `install.bat`(또는 `node apply.js`)을 **다시 실행**하면 됩니다. 업데이트로 바뀐 문장은 영어로 보일 수 있으며, 새 버전용 번역이 올라오면 이 저장소의 릴리스를 다시 받으세요.

## 문제 해결

**게임이 복구 모드로 뜨거나 화면이 하얗게 나옵니다.**
`restore.bat`으로 원본으로 되돌린 뒤, 어떤 화면에서 발생했는지 [이슈](https://github.com/titato-water/Bitburner-Korean-Patch/issues)로 알려 주세요.

**`패치된 번들인데 .orig 백업이 없습니다`라는 오류가 납니다.**
백업 파일이 지워진 경우입니다. Steam에서 Bitburner → 속성 → 설치된 파일 → `게임 파일 무결성 검사`를 실행해 원본을 복구한 뒤, 다시 적용하세요.

**`node`를 찾을 수 없다고 나옵니다.**
Node.js가 설치되지 않았거나 설치 후 창을 다시 열지 않은 경우입니다. 설치 후 `install.bat`을 다시 실행하세요.

**글자가 네모(□)로 보이거나 폰트가 이상합니다.**
`font/` 폴더의 `D2Coding.ttf`, `D2CodingBold.ttf`가 있는지 확인하고 다시 적용하세요.

**적용은 됐는데 일부가 영어입니다.**
번역하지 않는 항목이거나 게임 버전이 v3.0.1과 다른 경우입니다. 게임 버전은 게임 안 사이드바 맨 위(`Bitburner v3.0.1`)에서 볼 수 있고, 게임 폴더의 `resources\app\package.json`에 적힌 `version` 값과 같습니다. 참고로 게임 폴더 바로 아래의 `version` 파일은 게임이 아니라 Electron 버전이라 기준이 아닙니다.

## 안전성
- 패치는 게임 번들 파일 하나(`resources\app\dist\main.bundle.js`)와 폰트 두 개만 바꿉니다.
- 처음 적용할 때 원본을 `main.bundle.js.orig`로 백업하며, 적용은 항상 이 원본에서 다시 만들기 때문에 여러 번 실행해도 결과가 같습니다.
- 패치 결과의 문법 검사에 실패하면 아무것도 쓰지 않고 중단합니다.

## 기여와 개발
번역 수정이나 새 버전 대응은 [DEVELOPMENT.md](DEVELOPMENT.md)와 [glossary.md](glossary.md)를 참고하세요. 오역이나 어색한 표현은 이슈나 풀 리퀘스트로 알려 주시면 반영합니다.

## 크레딧과 라이선스
- Bitburner: [bitburner-official/bitburner-src](https://github.com/bitburner-official/bitburner-src) 개발진의 게임입니다. 이 프로젝트는 비공식 팬 번역이며 게임 개발진과 무관합니다.
- 폰트: Naver의 [D2Coding](https://github.com/naver/d2codingfont) (SIL Open Font License 1.1, `font/OFL.txt`)
- 이 저장소의 도구 코드와 번역: MIT ([LICENSE](LICENSE))
