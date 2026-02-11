#Requires -Version 7.0
<#
.SYNOPSIS
    Stop the E2E test environment for SkillSoft.

.DESCRIPTION
    This script stops all services started by Start-E2EEnv.ps1:
    - Backend Spring Boot application
    - Frontend Next.js application

.EXAMPLE
    .\scripts\Stop-E2EEnv.ps1

.NOTES
    This script reads PIDs from the logs directory to stop processes.
#>

param(
    [switch]$Force
)

$ErrorActionPreference = "Continue"

# Colors for output
function Write-Status { param($Message) Write-Host "🔧 $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

# Project paths
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$LogsPath = Join-Path $ProjectRoot "logs"

Write-Host ""
Write-Host "🛑 Stopping E2E Test Environment" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta
Write-Host ""

# ==========================================
# Stop Backend
# ==========================================
Write-Status "Stopping backend..."

$backendPidFile = Join-Path $LogsPath "backend.pid"
if (Test-Path $backendPidFile) {
    $backendPid = Get-Content $backendPidFile -ErrorAction SilentlyContinue

    if ($backendPid) {
        try {
            $process = Get-Process -Id $backendPid -ErrorAction SilentlyContinue
            if ($process) {
                Stop-Process -Id $backendPid -Force
                Write-Success "Backend stopped (PID: $backendPid)"
            } else {
                Write-Warning "Backend process not found (PID: $backendPid)"
            }
        } catch {
            Write-Warning "Could not stop backend: $_"
        }
    }

    Remove-Item $backendPidFile -Force -ErrorAction SilentlyContinue
} else {
    Write-Warning "Backend PID file not found"
}

# Also try to kill any Java processes running the backend
if ($Force) {
    Write-Status "Force-killing Java processes..."
    Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*spring-boot*" -or $_.CommandLine -like "*assessment-backend*"
    } | ForEach-Object {
        Stop-Process -Id $_.Id -Force
        Write-Host "   Killed Java process: $($_.Id)" -ForegroundColor Gray
    }
}

# ==========================================
# Stop Frontend
# ==========================================
Write-Status "Stopping frontend..."

$frontendPidFile = Join-Path $LogsPath "frontend.pid"
if (Test-Path $frontendPidFile) {
    $frontendPid = Get-Content $frontendPidFile -ErrorAction SilentlyContinue

    if ($frontendPid) {
        try {
            $process = Get-Process -Id $frontendPid -ErrorAction SilentlyContinue
            if ($process) {
                Stop-Process -Id $frontendPid -Force
                Write-Success "Frontend stopped (PID: $frontendPid)"
            } else {
                Write-Warning "Frontend process not found (PID: $frontendPid)"
            }
        } catch {
            Write-Warning "Could not stop frontend: $_"
        }
    }

    Remove-Item $frontendPidFile -Force -ErrorAction SilentlyContinue
} else {
    Write-Warning "Frontend PID file not found"
}

# Also try to kill any Node processes running the frontend
if ($Force) {
    Write-Status "Force-killing Node processes..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*next*" -or $_.CommandLine -like "*frontend-app*"
    } | ForEach-Object {
        Stop-Process -Id $_.Id -Force
        Write-Host "   Killed Node process: $($_.Id)" -ForegroundColor Gray
    }
}

# ==========================================
# Kill processes on ports (fallback)
# ==========================================
Write-Status "Checking ports..."

# Check port 8080 (backend)
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($port8080) {
    try {
        Stop-Process -Id $port8080.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Success "Killed process on port 8080"
    } catch {
        Write-Warning "Could not kill process on port 8080"
    }
}

# Check port 3000 (frontend)
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($port3000) {
    try {
        Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Success "Killed process on port 3000"
    } catch {
        Write-Warning "Could not kill process on port 3000"
    }
}

# ==========================================
# Cleanup logs (optional)
# ==========================================
# Uncomment to clean up logs after stopping
# if (Test-Path $LogsPath) {
#     Remove-Item -Path (Join-Path $LogsPath "*.log") -Force -ErrorAction SilentlyContinue
#     Write-Status "Log files cleaned up"
# }

# ==========================================
# Summary
# ==========================================
Write-Host ""
Write-Host "✅ E2E environment stopped" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Verify services are stopped
$backendStopped = $true
$frontendStopped = $true

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -TimeoutSec 1 -ErrorAction SilentlyContinue
    $backendStopped = $false
} catch { }

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 1 -ErrorAction SilentlyContinue
    $frontendStopped = $false
} catch { }

if (-not $backendStopped) {
    Write-Warning "Backend may still be running on port 8080"
    Write-Host "   Run with -Force to kill all related processes" -ForegroundColor Yellow
}

if (-not $frontendStopped) {
    Write-Warning "Frontend may still be running on port 3000"
    Write-Host "   Run with -Force to kill all related processes" -ForegroundColor Yellow
}

if ($backendStopped -and $frontendStopped) {
    Write-Host "   All services confirmed stopped" -ForegroundColor Gray
}
