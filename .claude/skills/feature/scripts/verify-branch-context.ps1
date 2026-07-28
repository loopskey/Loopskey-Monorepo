param(
  [Parameter(Mandatory = $true)]
  [string]$RunFile
)

$ErrorActionPreference = "Stop"

$validator = Join-Path $PSScriptRoot "validate-feature-state.ps1"
$state = & $validator -RunFile $RunFile | ConvertFrom-Json

$currentBranch = (git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0) {
  throw "Unable to determine the current Git branch"
}

if ($currentBranch -ne $state.Branch) {
  throw "Branch mismatch: run expects '$($state.Branch)', current branch is '$currentBranch'"
}

git cat-file -e "$($state.BaseCommit)^{commit}"
if ($LASTEXITCODE -ne 0) {
  throw "Recorded base commit does not exist: $($state.BaseCommit)"
}

[pscustomobject]@{
  Valid = $true
  Branch = $currentBranch
  BaseCommit = $state.BaseCommit
  Status = $state.Status
} | ConvertTo-Json

