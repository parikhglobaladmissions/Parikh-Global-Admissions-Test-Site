# Screenshot helper (Puppeteer/Node is not installed on this machine, so this
# substitutes headless Edge for the node screenshot.mjs workflow described in CLAUDE.md).
# Usage: ./screenshot.ps1 <url> [label]
param(
    [Parameter(Mandatory=$true)][string]$Url,
    [Parameter(Mandatory=$false)][string]$Label = ""
)

$dir = Join-Path $PSScriptRoot "temporary screenshots"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

$existing = Get-ChildItem -Path $dir -Filter "screenshot-*.png" -ErrorAction SilentlyContinue
$maxN = 0
foreach ($f in $existing) {
    if ($f.Name -match '^screenshot-(\d+)') {
        $n = [int]$matches[1]
        if ($n -gt $maxN) { $maxN = $n }
    }
}
$next = $maxN + 1

$suffix = ""
if ($Label -ne "") { $suffix = "-$Label" }
$outFile = Join-Path $dir "screenshot-$next$suffix.png"

$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
& $edge --headless --disable-gpu --hide-scrollbars --window-size=1440,4000 --screenshot="$outFile" "$Url" | Out-Null

Write-Output "Saved $outFile"
