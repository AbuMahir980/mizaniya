# Removes peer-ai's cost-tiering -- the "switch to a cheaper model, then switch
# back" dance -- from the vendored copy. Project convention is Opus for build,
# Fable for everything else, never downgraded mid-phase; swapping models to save
# pennies is not part of it, least of all on a quality gate for an app that
# handles the user's money.
#
# Run after every upstream pull, alongside apply-phase-config.ps1. Idempotent.
#
# TWO PARTS, and the difference matters:
#   1. REPLACE -- sentence-level switch instructions. Regex handles these safely
#      and they are restored verbatim by every upstream pull, so they are worth
#      automating.
#   2. REPORT  -- structural residue: the model-tier tables, the setup question,
#      the workflow-driver settings row. Rewriting a table with a regex is how
#      you silently mangle a file, so the script lists them and a human replaces
#      them with the one-line convention. "none" means the copy is clean.
#
# Patterns match the upstream wording as of the 2026-09 pull. If a pull renames
# things, part 2 will report leftovers rather than quietly cleaning nothing --
# that is the intended failure mode. Update the patterns then, and re-run.
#
# Runs from wherever the script lives (peer-ai/). Pure ASCII source so
# PowerShell 5.1 parses it without a BOM; non-ASCII in the upstream text is
# matched with \u escapes. Reads/writes UTF-8, no BOM.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# --- part 1: sentence-level replacements --------------------------------
# — is an em-dash, ’ a curly apostrophe. Upstream uses both.

$rules = @(
    @{
        name = "workflow-driver Model selector setting (upstream re-adds it on every pull)"
        # This project never switches models, so a setting that decides whether to
        # *ask* the user to switch has nothing to decide. Removing it by hand each
        # pull is how a post-pull script rots; removing it here is why the script exists.
        rx   = [regex]'?
\| \*\*Model selector\*\* \| `\[PLACEHOLDER:[^
]*?\]` \|'
        to   = ""
    },
    @{
        name = "docs-pdf-export model recommendation section"
        rx   = [regex]'(?s)## Model recommendation\r?\n\r?\nIf the project’?''?s tool has a per-phase model selector.*?just generate\.'
        to   = "## Model" + "`n`n" + "Project convention: Opus for build, Fable for everything else; never downgrade mid-phase. The export is generated on whichever model the phase is already running. There is no model switch here."
    },
    @{
        name = "shared.md PDF-export switch clause"
        rx   = [regex]' If the tool has a per-phase model selector \(Project settings in the workflow driver\), ask the user to switch to their fastest model.*?just generate\.'
        to   = ""
    },
    @{
        name = "phase-file PDF-export parenthetical"
        rx   = [regex]', fastest model only if the tool has a model selector\)'
        to   = ", no model switch)"
    },
    @{
        name = "build-phase multimodal switch bullet"
        rx   = [regex]'- Tell the user: "Switch to your \*\*best multimodal model\*\*.*?Let me know when you’?''?ve switched\."\r?\n- \*\*Wait for confirmation\*\*, then create'
        to   = "- Create"
    },
    @{
        name = "build-phase switch-back to fast coding model"
        rx   = [regex]', tell the user to switch back to your \*\*fast coding model\*\* for coding'
        to   = ", continue to the build steps below. No model switch (see ``shared/rules/shared.md``, Models)"
    },
    @{
        name = "build-phase switch-back for generated code"
        rx   = [regex]' Tell the user to switch back to your \*\*fast coding model\*\* for integrating the generated code into the app structure'
        to   = " No model switch (see ``shared/rules/shared.md``, Models)."
    },
    @{
        name = "build-phase stay-on-fast-coding-model bullet"
        rx   = [regex]'\r?\n- No model switch needed — stay on your \*\*fast coding model\*\*'
        to   = ""
    },
    @{
        name = "generic switch-and-wait preamble"
        rx   = [regex]'tell the user: "Switch to your \*\*fastest model\*\*.*?Let me know when you’?''?ve switched\." Wait for confirmation, then generate'
        to   = "generate"
    },
    @{
        name = "generic switch-back reminder"
        rx   = [regex]'\s*After the export, remind the user to switch back to the previous model\.'
        to   = ""
    }
)

$files = Get-ChildItem -Path $root -Filter *.md -Recurse -File |
         Where-Object { $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\docs\\' }

$total = 0
foreach ($f in $files) {
    $text = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $orig = $text
    $applied = @()

    foreach ($rule in $rules) {
        $before = $text
        $text = $rule.rx.Replace($text, $rule.to)
        if ($text -ne $before) { $applied += $rule.name }
    }

    if ($text -ne $orig) {
        [System.IO.File]::WriteAllText($f.FullName, $text, $utf8NoBom)
        Write-Output ("  cleaned  " + $f.FullName.Replace($root + '\','') + "  [" + ($applied -join "; ") + "]")
        $total++
    }
}

Write-Output ""
Write-Output ("  files cleaned: " + $total)

# --- part 2: report structural residue ----------------------------------
# Each of these needs a human to replace it with the one-line convention.
# docs/ is excluded on purpose: peer-ai-feedback.md quotes the old wording as
# evidence, and rewriting the evidence would defeat the point of the record.

$residue = @(
    'fastest model',
    'best multimodal model',
    'fast coding model',
    '[Mm]id-tier',
    'Gemini Flash',
    'GPT-4\.1 mini',
    'switch back to the previous model',
    '[Mm]odel selector',
    'Model recommendations',
    'cost-appropriate',
    'model tier'
)
$rxResidue = ($residue -join '|')

Write-Output ""
Write-Output "  structural residue needing a human (docs/ excluded on purpose):"
$left = Get-ChildItem -Path $root -Filter *.md -Recurse -File |
        Where-Object { $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\docs\\' } |
        Select-String -Pattern $rxResidue
if ($left) {
    $left | ForEach-Object { Write-Output ("    " + $_.Filename + ":" + $_.LineNumber + "  " + $_.Matches[0].Value) }
    Write-Output ""
    Write-Output "  Replace each with the one-line convention, then re-run until this says none."
    exit 1
} else {
    Write-Output "    none"
}
