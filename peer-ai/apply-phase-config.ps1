# Applies phase-config.json to the peer-ai phase files:
#   1. replaces the "> **Model:" line with the project's choice
#   2. inserts the phase's block (skills + project notes) just after it
# Idempotent: a block whose first line is already present is not added twice.
# Runs from wherever the script lives (peer-ai/), so no hard-coded path.
# Pure ASCII source so PowerShell 5.1 parses it without a BOM.
# Reads/writes UTF-8 explicitly so em-dashes survive; writes LF line endings
# and a trailing newline so git shows a two-line change, not a 500-line one.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$cfgRaw = [System.IO.File]::ReadAllText((Join-Path $root "phase-config.json"), [System.Text.Encoding]::UTF8)
$cfg = $cfgRaw | ConvertFrom-Json

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$modelChanged = 0
$blockAdded = 0
$blockSkipped = 0
$missing = 0
$processed = 0

foreach ($prop in $cfg.PSObject.Properties) {
    if ($prop.Name -eq "_note") { continue }

    $rel  = $prop.Name -replace '/', '\'
    $path = Join-Path $root $rel

    if (-not (Test-Path -LiteralPath $path)) {
        Write-Output ("  MISSING  " + $prop.Name)
        $missing++
        continue
    }

    $lines = [System.Collections.Generic.List[string]]::new()
    foreach ($l in [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)) { $lines.Add($l) }

    # --- 1. replace the model line -------------------------------------
    $modelIdx = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i].StartsWith("> **Model:")) { $modelIdx = $i; break }
    }
    if ($modelIdx -ge 0) {
        if ($lines[$modelIdx] -ne $prop.Value.model) {
            $lines[$modelIdx] = $prop.Value.model
            $modelChanged++
        }
    } else {
        # no model line: put one after the title
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i].StartsWith("# ")) {
                $lines.Insert($i + 1, "")
                $lines.Insert($i + 2, $prop.Value.model)
                $modelIdx = $i + 2
                $modelChanged++
                break
            }
        }
    }

    # --- 2. insert the block -------------------------------------------
    $blk = @($prop.Value.block)
    if ($blk.Count -gt 0) {
        $first = $blk[0]
        $already = $false
        foreach ($l in $lines) {
            if ($l -eq $first) { $already = $true; break }
        }
        if ($already) {
            $blockSkipped++
        } else {
            $at = $modelIdx + 1
            $lines.Insert($at, "")
            $at++
            foreach ($b in $blk) { $lines.Insert($at, $b); $at++ }
            $blockAdded++
        }
    }

    [System.IO.File]::WriteAllText($path, (($lines -join "`n") + "`n"), $utf8NoBom)
    $processed++
    Write-Output ("  ok       " + $prop.Name)
}

Write-Output ""
Write-Output ("  model lines set : " + $modelChanged)
Write-Output ("  blocks added    : " + $blockAdded)
Write-Output ("  blocks already  : " + $blockSkipped)
Write-Output ("  files missing   : " + $missing)

# A post-pull script that reports success for doing nothing is worse than no
# script: the customisations are gone and the summary says they are fine. Two
# projects have already been bitten by exactly that, which is why
# CONTRIBUTING.md now asks vendored copies to fail loudly.
$failed = $false

if ($missing -gt 0) {
    Write-Output ""
    Write-Output ("  FAIL: " + $missing + " file(s) named in phase-config.json do not exist.")
    Write-Output "        An upstream rename moves a file out from under this script."
    $failed = $true
}

$accounted = $blockAdded + $blockSkipped
if ($processed -gt 0 -and $accounted -eq 0) {
    Write-Output ""
    Write-Output "  FAIL: zero skill blocks were added or found, but blocks were expected."
    Write-Output "        The stamp did not land. Do not run a phase against this copy."
    $failed = $true
}

if ($failed) { exit 1 }
