$ErrorActionPreference = 'Stop'

Write-Host 'Checking Docker CLI...'
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error 'Docker CLI is not installed or not in PATH.'
}

Write-Host 'Checking Docker daemon connection...'
try {
  docker version | Out-Null
  Write-Host 'Docker daemon is reachable.' -ForegroundColor Green
} catch {
  Write-Host 'Docker daemon is NOT reachable.' -ForegroundColor Red
  Write-Host 'Try the following:'
  Write-Host '  1) Start Docker Desktop manually.'
  Write-Host '  2) Wait until status is "Engine running".'
  Write-Host '  3) Ensure Windows Containers mode is disabled (use Linux containers).'
  Write-Host '  4) Run: docker context ls and make sure "default" is active.'
  Write-Host '  5) If needed: docker context use default'
  exit 1
}

Write-Host 'Active context:'
docker context show

Write-Host 'Done.' -ForegroundColor Green
