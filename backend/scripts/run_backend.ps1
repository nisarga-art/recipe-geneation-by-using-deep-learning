param(
    [switch]$SkipInstall
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir '..\..')
Set-Location $repoRoot

$venvPath = Join-Path $repoRoot 'backend\.venv'
$pythonPath = Join-Path $venvPath 'Scripts\python.exe'
$pipPath = Join-Path $venvPath 'Scripts\pip.exe'

if (-not (Test-Path $venvPath)) {
    Write-Host "Creating virtualenv at backend\\.venv..."
    python -m venv "$venvPath"
}

if (-not (Test-Path $pythonPath)) {
    Write-Error "Python executable not found in $venvPath. Ensure Python is installed and on PATH."
    exit 1
}

if (-not $SkipInstall) {
    Write-Host "Upgrading pip and installing requirements..."
    & "$pipPath" install --upgrade pip
    & "$pipPath" install -r backend/requirements.txt
}

Write-Host "Starting uvicorn server..."
& "$pythonPath" -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
