@echo off
chcp 65001 > nul
setlocal
cd /d "%~dp0"

echo ==============================
echo  Bitburner 한글패치 설치
echo ==============================
echo.

rem 동봉된 node가 있으면 그것을 쓰고, 없으면 설치된 Node.js를 쓴다
set "NODE=%~dp0node\node.exe"
set "BUNDLED=1"
if not exist "%NODE%" (
  set "BUNDLED=0"
  set "NODE=node"
  where node > nul 2>&1
  if errorlevel 1 (
    echo [오류] Node.js를 찾을 수 없습니다.
    echo 릴리스의 bitburner-ko.zip에는 Node.js가 들어 있습니다. 그 파일을 받아 다시 실행하세요.
    echo 소스를 직접 받았다면 https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행하세요.
    echo.
    pause
    exit /b 1
  )
)

rem 게임이 기본 경로에 없고 BITBURNER_DIR도 없으면 경로를 묻는다
if not defined BITBURNER_DIR (
  if not exist "C:\Program Files (x86)\Steam\steamapps\common\Bitburner\resources\app\dist\main.bundle.js" (
    echo Bitburner를 기본 Steam 경로에서 찾지 못했습니다.
    echo 게임 설치 폴더 경로를 입력하세요. 예: D:\SteamLibrary\steamapps\common\Bitburner
    set /p BITBURNER_DIR=경로:
  )
)

if not exist "node_modules\acorn" (
  if "%BUNDLED%"=="1" (
    echo [오류] node_modules 폴더가 없습니다. 릴리스의 bitburner-ko.zip을 다시 받아 압축을 푼 뒤 실행하세요.
    echo.
    pause
    exit /b 1
  )
  echo 필요한 구성요소를 설치합니다. 잠시 기다려 주세요...
  call npm install
  if errorlevel 1 (
    echo.
    echo [오류] npm install에 실패했습니다. 인터넷 연결을 확인하세요.
    pause
    exit /b 1
  )
)

tasklist /FI "IMAGENAME eq bitburner.exe" 2> nul | find /I "bitburner.exe" > nul
if not errorlevel 1 (
  echo.
  echo [주의] Bitburner가 실행 중입니다. 게임을 완전히 종료한 뒤 계속하세요.
  pause
)

echo.
"%NODE%" apply.js
if errorlevel 1 (
  echo.
  echo [오류] 패치 적용에 실패했습니다. 위의 메시지를 확인하세요.
  echo 게임이 올바르게 설치되어 있는지, 버전이 v3.0.1인지 확인해 보세요.
  echo.
  pause
  exit /b 1
)

echo.
echo 적용이 끝났습니다. 이제 Bitburner를 실행하세요.
echo 원래대로 되돌리려면 restore.bat을 실행하세요.
echo.
pause
