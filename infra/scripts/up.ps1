$ErrorActionPreference = 'Stop'

& "$PSScriptRoot/check-docker.ps1"

Write-Host 'Starting stack...' -ForegroundColor Cyan
docker compose up -d --build

Write-Host 'Stack started.' -ForegroundColor Green
Write-Host 'Frontend: http://localhost:8080'
Write-Host 'API:      http://localhost:4000/health'
Write-Host 'MinIO:    http://localhost:9001'
