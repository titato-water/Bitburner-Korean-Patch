@echo off
chcp 65001 > nul
setlocal
cd /d "%~dp0"

echo ==============================
echo  Bitburner 한글패치 제거
echo ==============================
echo.

where node > nul 2>&1
if errorlevel 1 (
  echo [오류] Node.js가 설치되어 있지 않습니다.
  echo https://nodejs.org 에서 LTS 버전을 설치한 뒤 이 파일을 다시 실행하세요.
  echo.
  pause
  exit /b 1
)

rem 게임이 기본 경로에 없고 BITBURNER_DIR도 없으면 경로를 묻는다
if not defined BITBURNER_DIR (
  if not exist "C:\Program Files (x86)\Steam\steamapps\common\Bitburner\resources\app\dist\main.bundle.js" (
    echo Bitburner를 기본 Steam 경로에서 찾지 못했습니다.
    echo 게임 설치 폴더 경로를 입력하세요. 예: D:\SteamLibrary\steamapps\common\Bitburner
    set /p BITBURNER_DIR=경로:
  )
)

tasklist /FI "IMAGENAME eq bitburner.exe" 2> nul | find /I "bitburner.exe" > nul
if not errorlevel 1 (
  echo.
  echo [주의] Bitburner가 실행 중입니다. 게임을 완전히 종료한 뒤 계속하세요.
  pause
)

echo.
node restore.js
if errorlevel 1 (
  echo.
  echo [오류] 복원에 실패했습니다. 위의 메시지를 확인하세요.
  echo 백업이 없다면 Steam에서 Bitburner의 게임 파일 무결성 검사를 실행하세요.
  echo.
  pause
  exit /b 1
)

echo.
echo 원래 상태로 되돌렸습니다.
echo.
pause
