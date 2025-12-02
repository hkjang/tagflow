# PowerShell script to package NW.js application

param(
    [string]$nwjsPath = "C:\nwjs"  # Change this to your NW.js SDK path
)

Write-Host "Packaging TagFlow with NW.js..." -ForegroundColor Green

# Create resources directory structure
$resourcesDir = Join-Path $PSScriptRoot "resources"
if (Test-Path $resourcesDir) {
    Remove-Item -Recurse -Force $resourcesDir
}
New-Item -ItemType Directory -Path $resourcesDir | Out-Null

# Copy backend
Write-Host "Copying backend..." -ForegroundColor Yellow
$backendDest = Join-Path $resourcesDir "backend"
New-Item -ItemType Directory -Path $backendDest | Out-Null

Copy-Item -Path (Join-Path $PSScriptRoot "..\backend\dist") -Destination (Join-Path $backendDest "dist") -Recurse
Copy-Item -Path (Join-Path $PSScriptRoot "..\backend\node_modules") -Destination (Join-Path $backendDest "node_modules") -Recurse

# Copy frontend
Write-Host "Copying frontend..." -ForegroundColor Yellow
$frontendDest = Join-Path $resourcesDir "frontend"
Copy-Item -Path (Join-Path $PSScriptRoot "..\frontend\out") -Destination $frontendDest -Recurse

Write-Host "Resources copied successfully!" -ForegroundColor Green

# If NW.js path is provided, copy everything there
if (Test-Path $nwjsPath) {
    Write-Host "Copying to NW.js directory: $nwjsPath" -ForegroundColor Yellow
    
    # Copy all nwjs folder contents to NW.js directory
    Copy-Item -Path (Join-Path $PSScriptRoot "*") -Destination $nwjsPath -Recurse -Force -Exclude "node_modules","*.md","*.ps1"
    
    Write-Host "`nPackaging complete!" -ForegroundColor Green
    Write-Host "To run: $nwjsPath\nw.exe" -ForegroundColor Cyan
} else {
    Write-Host "`nResources prepared in: $resourcesDir" -ForegroundColor Green
    Write-Host "Download NW.js SDK from https://nwjs.io/downloads/" -ForegroundColor Cyan
    Write-Host "Then copy all files from nwjs folder to NW.js directory and run nw.exe" -ForegroundColor Cyan
}
