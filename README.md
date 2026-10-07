# Bitburner 한글패치

Steam판 [Bitburner](https://store.steampowered.com/app/1812820/Bitburner/)의 화면, 게임 내 문서, 스토리를 한국어로 보여 주는 패치입니다. 한글이 깨지지 않도록 D2Coding 폰트도 함께 적용합니다.

- 지원 버전: **Bitburner 41.4.0** (다른 버전에서는 일부 문장이 영어로 남을 수 있습니다)
- 지원 환경: Windows + Steam
- 게임 파일을 직접 배포하지 않습니다. 내 컴퓨터에 설치된 게임에 번역을 적용하는 방식입니다.

## 번역 범위
- 번역됨: 메뉴와 화면 문구, 게임 내 문서, 스토리와 문헌
- 번역하지 않음: 변경 이력(Changelog), 스크립트용 API 레퍼런스(`ns` 함수 문서), 팩션/증강/범죄 같은 고유 이름, 개발자 메뉴
- 코드에서 키로도 쓰이는 일부 문자열(옵션 탭 이름 등)은 번역하면 게임이 오류를 내기 때문에 영어로 둡니다.

## 가장 쉬운 방법
1. [Node.js](https://nodejs.org/) LTS를 설치합니다.
2. Bitburner를 종료합니다.
3. 폴더의 **`install.bat`을 더블클릭**합니다. (필요한 구성요소 설치와 패치 적용을 한 번에 합니다.)
4. 되돌리려면 **`restore.bat`을 더블클릭**합니다.

게임이 기본 Steam 경로에 없으면 경로를 물어봅니다. 아래 "설치"는 터미널로 직접 하는 방법입니다.

## 설치

### 1. 준비물
- [Node.js](https://nodejs.org/) 18 이상 (LTS 권장). 설치 후 터미널에서 `node --version`으로 확인합니다.
- 이 저장소를 내려받아 압축을 풉니다 (`Code` → `Download ZIP`, 또는 `git clone`).

### 2. 의존성 설치 (최초 1회)
저장소 폴더에서 터미널(PowerShell 또는 명령 프롬프트)을 열고 실행합니다.
```
npm install
```
zip 파일로 받았고 `node_modules` 폴더가 이미 들어 있다면 이 단계는 건너뛰어도 됩니다.

### 3. 패치 적용
1. **Bitburner를 완전히 종료합니다.** 게임이 켜져 있으면 적용되지 않거나 오류가 날 수 있습니다.
2. 아래를 실행합니다.
```
node apply.js
```
3. `적용 완료`가 출력되면 게임을 실행합니다.

게임을 기본 Steam 경로(`C:\Program Files (x86)\Steam\steamapps\common\Bitburner`)가 아닌 곳에 설치했다면, 경로를 환경변수로 지정합니다.

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

## 원래대로 되돌리기
Bitburner를 종료한 뒤 실행합니다.
```
node restore.js
```
원본 파일로 복원되고 폰트 파일도 제거됩니다.

## 게임이 업데이트된 뒤
Steam 업데이트가 게임 파일을 원본으로 되돌립니다. Bitburner를 종료하고 `node apply.js`를 **다시 실행**하면 됩니다. 업데이트로 바뀐 문장은 영어로 보일 수 있으며, 새 버전용 번역이 올라오면 이 저장소를 다시 받으세요.

## 문제 해결

**게임이 복구 모드로 뜨거나 화면이 하얗게 나옵니다.**
`node restore.js`로 원본으로 되돌린 뒤, 어떤 화면에서 발생했는지 이슈로 알려 주세요.

**`패치된 번들인데 .orig 백업이 없습니다`라는 오류가 납니다.**
백업 파일이 지워진 경우입니다. Steam에서 Bitburner → 속성 → 설치된 파일 → `게임 파일 무결성 검사`를 실행해 원본을 복구한 뒤, `node apply.js`를 다시 실행하세요.

**`node`를 찾을 수 없다고 나옵니다.**
Node.js가 설치되지 않았거나 설치 후 터미널을 다시 열지 않은 경우입니다. 터미널을 닫았다가 다시 여세요.

**글자가 네모(□)로 보이거나 폰트가 이상합니다.**
`font/` 폴더의 `D2Coding.ttf`, `D2CodingBold.ttf`가 있는지 확인하고 `node apply.js`를 다시 실행하세요.

**적용은 됐는데 일부가 영어입니다.**
번역하지 않는 항목이거나 게임 버전이 41.4.0과 다른 경우입니다. 버전은 게임 폴더의 `version` 파일에서 확인할 수 있습니다.

## 안전성
- 패치는 게임 번들 파일 하나(`resources\app\dist\main.bundle.js`)와 폰트 두 개만 바꿉니다.
- 처음 적용할 때 원본을 `main.bundle.js.orig`로 백업하며, `node apply.js`는 항상 이 원본에서 다시 만들기 때문에 여러 번 실행해도 결과가 같습니다.
- 패치 결과의 문법 검사에 실패하면 아무것도 쓰지 않고 중단합니다.

## 기여와 개발
번역 수정이나 새 버전 대응은 [DEVELOPMENT.md](DEVELOPMENT.md)와 [glossary.md](glossary.md)를 참고하세요.

## 크레딧과 라이선스
- Bitburner: [bitburner-official/bitburner-src](https://github.com/bitburner-official/bitburner-src) 개발진의 게임입니다. 이 프로젝트는 비공식 팬 번역이며 게임 개발진과 무관합니다.
- 폰트: Naver의 [D2Coding](https://github.com/naver/d2codingfont) (SIL Open Font License 1.1, `font/OFL.txt`)
- 이 저장소의 도구 코드와 번역: MIT ([LICENSE](LICENSE))
