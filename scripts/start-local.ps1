$root = Split-Path -Parent $PSScriptRoot

Write-Host "NetWorth Hub local launch checks" -ForegroundColor Cyan

$backendEnv = Join-Path $root "backend\.env"
$frontendEnv = Join-Path $root "frontend\.env"

if (-not (Test-Path $backendEnv)) {
  Write-Host "Missing backend/.env" -ForegroundColor Red
}

if (-not (Test-Path $frontendEnv)) {
  Write-Host "Missing frontend/.env" -ForegroundColor Red
}

Write-Host ""
Write-Host "Required values:" -ForegroundColor Yellow
Write-Host "backend/.env -> DATABASE_URL, CLERK_SECRET_KEY"
Write-Host "frontend/.env -> VITE_CLERK_PUBLISHABLE_KEY"
Write-Host ""
Write-Host "Backend start:" -ForegroundColor Green
Write-Host "  cd backend"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Frontend start:" -ForegroundColor Green
Write-Host "  cd frontend"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "If Postgres is not installed locally, use your Neon connection string for DATABASE_URL."
