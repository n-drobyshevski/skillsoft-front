#Requires -Version 7.0
<#
.SYNOPSIS
    Start the E2E test environment for SkillSoft.

.DESCRIPTION
    This script starts all services needed for E2E testing:
    - PostgreSQL database (assumes already running)
    - Backend Spring Boot application
    - Frontend Next.js application

.EXAMPLE
    .\scripts\Start-E2EEnv.ps1

.EXAMPLE
    .\scripts\Start-E2EEnv.ps1 -UseRemote
    # Uses remote database and backend (e.g., Railway) - only starts frontend locally

.EXAMPLE
    .\scripts\Start-E2EEnv.ps1 -UseRemoteDb -UseRemoteBackend
    # Same as -UseRemote

.NOTES
    Prerequisites:
    - PostgreSQL running on localhost:5432 (or use -UseRemoteDb for Railway)
    - Java 21+ installed (or use -UseRemoteBackend for Railway)
    - Node.js 20+ installed
    - Maven installed (not needed with -UseRemoteBackend)
#>

param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$SkipSeed,
    [switch]$UseRemoteDb,
    [switch]$UseRemoteBackend,
    [switch]$UseRemote  # Shorthand for both UseRemoteDb and UseRemoteBackend
)

# Handle -UseRemote shorthand
if ($UseRemote) {
    $UseRemoteDb = $true
    $UseRemoteBackend = $true
}

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Status { param($Message) Write-Host "🔧 $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

# Project paths
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$BackendPath = Join-Path $ProjectRoot "assessment-backend"
$FrontendPath = Join-Path $ProjectRoot "frontend-app"
$LogsPath = Join-Path $ProjectRoot "logs"

# Create logs directory
if (-not (Test-Path $LogsPath)) {
    New-Item -ItemType Directory -Path $LogsPath -Force | Out-Null
}

Write-Host ""
Write-Host "🚀 Starting E2E Test Environment" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta
Write-Host ""

# ==========================================
# Check PostgreSQL
# ==========================================
if ($UseRemoteDb) {
    Write-Status "Using remote database (Railway)..."
    Write-Success "Skipping local PostgreSQL check"
} else {
    Write-Status "Checking PostgreSQL..."

    try {
        $pgResult = & psql -h localhost -p 5432 -U postgres -c "SELECT 1" 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "PostgreSQL connection failed"
        }
        Write-Success "PostgreSQL is running"
    } catch {
        Write-Error "PostgreSQL is not running on localhost:5432"
        Write-Host "   Please start PostgreSQL first." -ForegroundColor Yellow
        Write-Host "   Or use -UseRemoteDb flag for Railway database." -ForegroundColor Yellow
        exit 1
    }
}

# ==========================================
# Create/Reset E2E Test Database
# ==========================================
if ($UseRemoteDb) {
    Write-Status "Using existing remote database..."
    Write-Success "Skipping local database setup"
} elseif (-not $SkipSeed) {
    Write-Status "Setting up E2E test database..."

    try {
        # Create database if not exists
        & psql -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS skillsoft_e2e_test;" 2>&1 | Out-Null
        & psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE skillsoft_e2e_test;" 2>&1 | Out-Null
        Write-Success "E2E test database created"
    } catch {
        Write-Warning "Could not create database. It may already exist."
    }
}

# ==========================================
# Start Backend
# ==========================================
if ($UseRemoteBackend) {
    Write-Status "Using remote backend (Railway)..."
    Write-Success "Skipping local backend startup"
} elseif (-not $SkipBackend) {
    Write-Status "Starting backend server (port 8080)..."

    # Check if backend is already running
    $backendRunning = $false
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendRunning = $true
            Write-Warning "Backend is already running on port 8080"
        }
    } catch {
        # Backend not running, which is expected
    }

    if (-not $backendRunning) {
        # Set environment variables
        $env:SPRING_PROFILES_ACTIVE = "e2e-test"

        if (-not $UseRemoteDb) {
            $env:PGDATABASE = "skillsoft_e2e_test"
            $env:DATABASE_URL = "jdbc:postgresql://localhost:5432/skillsoft_e2e_test"
        } else {
            Write-Status "Using DATABASE_URL from environment..."
        }

        # Start backend in background
        $backendLogFile = Join-Path $LogsPath "backend-e2e.log"
        $backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "mvn spring-boot:run" -WorkingDirectory $BackendPath -PassThru -RedirectStandardOutput $backendLogFile -RedirectStandardError (Join-Path $LogsPath "backend-e2e-error.log") -WindowStyle Hidden

        # Save PID
        $backendProcess.Id | Out-File -FilePath (Join-Path $LogsPath "backend.pid") -Force

        Write-Host "   Backend PID: $($backendProcess.Id)" -ForegroundColor Gray

        # Wait for backend to be ready
        Write-Status "Waiting for backend to start..."
        $maxAttempts = 60
        $attempt = 0
        $backendReady = $false

        while ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 2
            $attempt++

            try {
                $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    $backendReady = $true
                    break
                }
            } catch {
                Write-Host "   Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
            }
        }

        if ($backendReady) {
            Write-Success "Backend is ready"
        } else {
            Write-Error "Backend failed to start within timeout"
            Write-Host "   Check logs at: $backendLogFile" -ForegroundColor Yellow
            exit 1
        }
    }
}

# ==========================================
# Seed Test Data
# ==========================================
if ($UseRemoteDb) {
    Write-Status "Using existing data in remote database..."
    Write-Success "Skipping local seed (remote DB assumed to have data)"
} elseif (-not $SkipSeed) {
    Write-Status "Seeding test data..."

    $seedScript = Join-Path $FrontendPath "scripts\seed-e2e-data.sql"
    if (Test-Path $seedScript) {
        try {
            & psql -h localhost -p 5432 -U postgres -d skillsoft_e2e_test -f $seedScript 2>&1 | Out-Null
            Write-Success "Test data seeded"
        } catch {
            Write-Warning "Could not seed test data. Tests may have limited data."
        }
    } else {
        Write-Warning "Seed script not found: $seedScript"
    }
}

# ==========================================
# Start Frontend
# ==========================================
if (-not $SkipFrontend) {
    Write-Status "Starting frontend server (port 3000)..."

    # Check if frontend is already running
    $frontendRunning = $false
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendRunning = $true
            Write-Warning "Frontend is already running on port 3000"
        }
    } catch {
        # Frontend not running, which is expected
    }

    if (-not $frontendRunning) {
        # Set environment variables
        $env:NEXT_PUBLIC_API_URL = "http://localhost:8080/api"

        # Start frontend in background
        $frontendLogFile = Join-Path $LogsPath "frontend-e2e.log"
        $frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev" -WorkingDirectory $FrontendPath -PassThru -RedirectStandardOutput $frontendLogFile -RedirectStandardError (Join-Path $LogsPath "frontend-e2e-error.log") -WindowStyle Hidden

        # Save PID
        $frontendProcess.Id | Out-File -FilePath (Join-Path $LogsPath "frontend.pid") -Force

        Write-Host "   Frontend PID: $($frontendProcess.Id)" -ForegroundColor Gray

        # Wait for frontend to be ready
        Write-Status "Waiting for frontend to start..."
        $maxAttempts = 30
        $attempt = 0
        $frontendReady = $false

        while ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 2
            $attempt++

            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 307) {
                    $frontendReady = $true
                    break
                }
            } catch {
                Write-Host "   Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
            }
        }

        if ($frontendReady) {
            Write-Success "Frontend is ready"
        } else {
            Write-Error "Frontend failed to start within timeout"
            Write-Host "   Check logs at: $frontendLogFile" -ForegroundColor Yellow
            exit 1
        }
    }
}

# ==========================================
# Summary
# ==========================================
Write-Host ""
Write-Host "✨ E2E environment is ready!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
if ($UseRemoteBackend) {
    Write-Host "📍 Backend:  Remote (Railway)" -ForegroundColor Cyan
} else {
    Write-Host "📍 Backend:  http://localhost:8080" -ForegroundColor Cyan
}
if ($UseRemoteDb) {
    Write-Host "📍 Database: Remote (Railway)" -ForegroundColor Cyan
} else {
    Write-Host "📍 Database: skillsoft_e2e_test" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "📝 Run tests with:" -ForegroundColor Yellow
Write-Host "   npm run test:e2e" -ForegroundColor White
Write-Host "   npm run test:e2e:smoke" -ForegroundColor White
Write-Host "   npm run test:e2e:ui" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Stop environment with:" -ForegroundColor Yellow
Write-Host "   npm run e2e:teardown" -ForegroundColor White
Write-Host ""
