param(
  [Parameter(Mandatory = $true)]
  [string]$RunFile
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $RunFile -PathType Leaf)) {
  throw "Feature run does not exist: $RunFile"
}

$content = Get-Content -LiteralPath $RunFile -Raw
$requiredSections = @(
  "## Metadata",
  "## Status",
  "## Goals",
  "## Acceptance Criteria",
  "## Verification",
  "## Review",
  "## State History",
  "## Completion"
)

foreach ($section in $requiredSections) {
  if (-not $content.Contains($section)) {
    throw "Missing required section '$section' in $RunFile"
  }
}

$allowedStates = @(
  "Draft",
  "Loaded",
  "In Progress",
  "Verification Passed",
  "Verification Failed",
  "In Review",
  "Changes Requested",
  "Ready to Complete",
  "Completing",
  "Complete",
  "Blocked",
  "Cancelled"
)

$statusMatch = [regex]::Match(
  $content,
  "(?ms)^## Status\s*\r?\n\s*(?<status>[^\r\n]+)"
)

if (-not $statusMatch.Success) {
  throw "Could not read feature status from $RunFile"
}

$status = $statusMatch.Groups["status"].Value.Trim()
if ($status -notin $allowedStates) {
  throw "Invalid feature status '$status' in $RunFile"
}

$branchMatch = [regex]::Match(
  $content,
  '(?m)^- Branch:\s*`(?<branch>[^`]+)`\s*$'
)
$baseMatch = [regex]::Match(
  $content,
  '(?m)^- Base commit:\s*`(?<sha>[0-9a-fA-F]{7,40})`\s*$'
)

if (-not $branchMatch.Success) {
  throw "Missing or invalid Branch metadata in $RunFile"
}
if (-not $baseMatch.Success) {
  throw "Missing or invalid Base commit metadata in $RunFile"
}

[pscustomobject]@{
  RunFile = (Resolve-Path -LiteralPath $RunFile).Path
  Status = $status
  Branch = $branchMatch.Groups["branch"].Value
  BaseCommit = $baseMatch.Groups["sha"].Value
} | ConvertTo-Json
