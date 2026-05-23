# Run from server/ after setting DATABASE_URL in .env
# Example: postgresql://postgres:YOUR_PASSWORD@localhost:5432/dcms?schema=public

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Checking database connection..." -ForegroundColor Cyan
npm run db:migrate -- --name init
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Migration failed. Update DATABASE_URL in server/.env with your PostgreSQL password." -ForegroundColor Yellow
  Write-Host "Then create database 'dcms' in pgAdmin if it does not exist." -ForegroundColor Yellow
  exit 1
}

Write-Host "Seeding demo data..." -ForegroundColor Cyan
npm run db:seed
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "Done. Start the API with: npm run dev" -ForegroundColor Green
Write-Host "Logins: manager / password123  |  field.officer / password123" -ForegroundColor Green
