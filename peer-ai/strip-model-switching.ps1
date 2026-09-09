# Removes peer-ai's "ask the user to switch to a cheaper model" dance from the
# PDF-export steps and rule files. Project convention is Opus for build, Fable
# otherwise; swapping models mid-phase to save pennies is not part of it.
# Runs from wherever the script lives (peer-ai/). Pure ASCII source.
# Reads/writes UTF-8 explicitly.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# 1. the "switch model, wait, then generate" preamble -> just "generate"
$rxSwitch = [regex]'tell the user: "Switch to your \*\*fastest model\*\*.*?Let me know when you''ve switched\." Wait for confirmation, then generate'
# 2. the "switch back afterwards" reminder -> gone
$rxBack   = [regex]'\s*After the export, remind the user to switch back to the previous model\.'

$files = Get-ChildItem -Path $root -Filter *.md -Recurse -File |
         Where-Object { $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\docs\\' }

$total = 0
foreach ($f in $files) {
    $text = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $orig = $text

    $text = $rxSwitch.Replace($text, 'generate')
    $text = $rxBack.Replace($text, '')

    if ($text -ne $orig) {
        [System.IO.File]::WriteAllText($f.FullName, $text, $utf8NoBom)
        Write-Output ("  cleaned  " + $f.FullName.Replace($root + '\',''))
        $total++
    }
}

Write-Output ""
Write-Output ("  files cleaned: " + $total)
Write-Output ""
Write-Output "  remaining mentions of downgrade guidance (docs/ excluded on purpose):"
$left = Get-ChildItem -Path $root -Filter *.md -Recurse -File |
        Where-Object { $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\docs\\' } |
        Select-String -Pattern 'fastest model|mid-tier model|Gemini Flash|GPT-4.1 mini|switch back to the previous model'
if ($left) { $left | ForEach-Object { Write-Output ("    " + $_.Filename + ":" + $_.LineNumber) } } else { Write-Output "    none" }
