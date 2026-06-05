param(
  [Parameter(Mandatory = $true)]
  [string]$RepositoryName,

  [string]$GitHubCli = "C:\tmp\gh-cli\bin\gh.exe",

  [switch]$Private
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $GitHubCli)) {
  throw "GitHub CLI not found at $GitHubCli"
}

& $GitHubCli auth status

if (-not (Test-Path ".git")) {
  git init
  git branch -M main
}

git add .
git commit -m "Publish AUT localnet project" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "No new git commit was created, continuing with existing changes."
}

$visibility = if ($Private) { "--private" } else { "--public" }
& $GitHubCli repo create $RepositoryName $visibility --source . --remote origin --push

Write-Host ""
Write-Host "Repository pushed. Enable GitHub Pages:"
Write-Host "1. Open the repository settings."
Write-Host "2. Go to Pages."
Write-Host "3. Deploy from branch: main."
Write-Host "4. Folder: /public."
Write-Host ""
Write-Host "This publishes public/index.html at the GitHub Pages URL."

