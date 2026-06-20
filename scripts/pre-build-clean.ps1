# Pre-build-clean.ps1 (game app)
# Limpia caches antes de `npx cap sync android` para no meter basura al APK.
#
# Uso:  powershell -ExecutionPolicy Bypass -File scripts\pre-build-clean.ps1

[CmdletBinding()]
param(
    [string]$WwwDir = "$PSScriptRoot\..\www",
    [switch]$DryRun
)

Write-Host "=== Pre-build clean (game) ===" -ForegroundColor Cyan
Write-Host "www dir: $WwwDir"

if (-not (Test-Path -LiteralPath $WwwDir)) {
    Write-Host "ERROR: directorio no existe" -ForegroundColor Red
    exit 1
}

$problems = 0

# Borrar caches tipicos que se generan en runtime
$caches = @("cache-*.bin", "external-cache.bin", "*.zip", "*.tar.gz")
foreach ($p in $caches) {
    $files = Get-ChildItem -Path $WwwDir -Recurse -File -Filter $p -ErrorAction SilentlyContinue
    if ($files.Count -gt 0) {
        $bytes = ($files | Measure-Object -Property Length -Sum).Sum
        Write-Host "  [clean] $($files.Count) archivos '$p' ($([math]::Round($bytes/1MB,2)) MB)" -ForegroundColor Yellow
        if (-not $DryRun) { $files | Remove-Item -Force }
    }
}

# Mostrar tamano final
$finalSize = (Get-ChildItem -LiteralPath $WwwDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
Write-Host ""
Write-Host ("www/ final: {0:N2} MB" -f ($finalSize/1MB)) -ForegroundColor Green
Write-Host ""
Write-Host "Listo. Ahora podes correr:" -ForegroundColor Cyan
Write-Host "  npx cap sync android" -ForegroundColor White
Write-Host "  cd android; .\gradlew.bat assembleDebug" -ForegroundColor White