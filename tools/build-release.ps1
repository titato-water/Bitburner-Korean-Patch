#requires -Version 7
<#
  릴리스 zip(dist/bitburner-ko.zip)을 만든다.
  - 포터블 node.exe(공식 배포본)를 받아 SHASUMS256.txt와 대조한 뒤 node/ 에 넣는다.
  - node_modules(npm ci)와 이 저장소의 배포용 파일을 함께 담는다.
  사용: pwsh tools/build-release.ps1 [-NodeVersion v24.19.0]
#>
param([string]$NodeVersion = 'v24.19.0')

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$work = Join-Path ([IO.Path]::GetTempPath()) ("bitburner-ko-build-" + [guid]::NewGuid().ToString('N'))
$stage = Join-Path $work 'bitburner-ko'
$dist = Join-Path $root 'dist'
New-Item -ItemType Directory -Path $stage, $dist -Force | Out-Null

try {
  # 1) node.exe 다운로드와 체크섬 검증
  $base = "https://nodejs.org/dist/$NodeVersion"
  $nodeDir = Join-Path $stage 'node'
  New-Item -ItemType Directory -Path $nodeDir | Out-Null
  Invoke-WebRequest "$base/win-x64/node.exe" -OutFile (Join-Path $nodeDir 'node.exe')
  Invoke-WebRequest "$base/SHASUMS256.txt" -OutFile (Join-Path $work 'SHASUMS256.txt')
  Invoke-WebRequest "https://raw.githubusercontent.com/nodejs/node/$NodeVersion/LICENSE" -OutFile (Join-Path $nodeDir 'LICENSE')

  $line = Select-String -Path (Join-Path $work 'SHASUMS256.txt') -Pattern 'win-x64/node\.exe$' | Select-Object -First 1
  if (-not $line) { throw 'SHASUMS256.txt에서 win-x64/node.exe를 찾지 못했습니다.' }
  $expected = ($line.Line -split '\s+')[0].ToLower()
  $actual = (Get-FileHash (Join-Path $nodeDir 'node.exe') -Algorithm SHA256).Hash.ToLower()
  if ($expected -ne $actual) { throw "node.exe 체크섬 불일치: $actual (기대값 $expected)" }
  Write-Host "node.exe $NodeVersion 체크섬 확인 완료"

  # 2) node_modules 준비 (없으면 npm ci)
  if (-not (Test-Path (Join-Path $root 'node_modules\acorn'))) {
    Push-Location $root; npm ci; Pop-Location
  }

  # 3) 배포용 파일 복사 (.git, 개발용 폴더와 이전 빌드 결과 제외)
  $exclude = '.git', '.gitignore', '.gitattributes', 'work', 'dist', 'node'
  Get-ChildItem $root -Force | Where-Object { $_.Name -notin $exclude } |
    Copy-Item -Destination $stage -Recurse -Force

  # 4) zip 생성
  $zip = Join-Path $dist 'bitburner-ko.zip'
  if (Test-Path $zip) { Remove-Item $zip -Force }
  Compress-Archive -Path $stage -DestinationPath $zip
  $mb = [math]::Round((Get-Item $zip).Length / 1MB, 1)
  Write-Host "생성 완료: $zip ($mb MB)"
}
finally {
  if (Test-Path $work) { Remove-Item $work -Recurse -Force }
}
