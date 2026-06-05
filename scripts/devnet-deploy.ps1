param(
  [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\.."),
  [string]$SolanaBin = "$env:USERPROFILE\.local\share\solana\install\active_release\bin",
  [string]$WslProjectRoot = "/mnt/c/Users/aali9/Documents/Codex/2026-06-04/i-want-you-to-do-some",
  [int]$MinBalanceSol = 4,
  [int]$MaxAirdropAttempts = 8
)

$ErrorActionPreference = "Stop"
Set-Location $ProjectRoot

$Wallet = "8Nnsxq4Tps1Kubf5cYw1qU7UQgf3ksuFT5bmc1yYwLaJ"
$Rpc = "https://api.devnet.solana.com"
$WslPath = "/home/ravadmin1/.local/bin:/home/ravadmin1/.cargo/bin:/home/ravadmin1/.avm/bin:/home/ravadmin1/.local/share/solana/install/releases/stable-a5517b2955dbd2ac6bc07637c4921b7079480b00/solana-release/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

function Invoke-WslProject {
  param([Parameter(Mandatory = $true)][string]$Command)
  $output = wsl bash -lc "export PATH=$WslPath; cd $WslProjectRoot && $Command" 2>&1
  if ($LASTEXITCODE -ne 0) {
    $output | Write-Host
    throw "WSL command failed with exit code $LASTEXITCODE`: $Command"
  }
  return $output
}

Write-Host "Checking devnet balance for $Wallet"
$balanceText = Invoke-WslProject "solana balance $Wallet --url $Rpc"
Write-Host $balanceText

for ($i = 1; $i -le $MaxAirdropAttempts; $i++) {
  $balanceText = Invoke-WslProject "solana balance $Wallet --url $Rpc"
  $balance = [decimal]($balanceText -replace ' SOL','')
  if ($balance -ge $MinBalanceSol) {
    break
  }

  Write-Host "Devnet balance is $balance SOL. Airdrop attempt $i of $MaxAirdropAttempts."
  try {
    Invoke-WslProject "solana airdrop 2 $Wallet --url $Rpc"
  } catch {
    Write-Host "Airdrop attempt failed, waiting before retry."
  }
  Start-Sleep -Seconds (10 * $i)
}

$finalBalanceText = Invoke-WslProject "solana balance $Wallet --url $Rpc"
$finalBalance = [decimal]($finalBalanceText -replace ' SOL','')
if ($finalBalance -lt $MinBalanceSol) {
  throw "Devnet wallet has $finalBalance SOL, but at least $MinBalanceSol SOL is required. Fund $Wallet with devnet SOL and rerun."
}

Write-Host "Running verification."
Invoke-WslProject "npm test"
Invoke-WslProject "npx tsc --noEmit"
Invoke-WslProject "npm run token:validate-config -- --config token.config.example.json"
Invoke-WslProject "anchor build"

Write-Host "Creating devnet token."
$tokenJson = Invoke-WslProject "npm run token:create -- --config token.config.example.json"
Write-Host $tokenJson

$tokenText = ($tokenJson -join "`n")
$jsonStart = $tokenText.IndexOf("{")
if ($jsonStart -lt 0) {
  throw "Could not parse token creation output."
}
$tokenResult = $tokenText.Substring($jsonStart) | ConvertFrom-Json

Write-Host "Deploying staking program to devnet."
$deployOutput = Invoke-WslProject "anchor deploy --provider.cluster $Rpc --provider.wallet .secrets/devnet-payer.json"
Write-Host $deployOutput

$resultPath = Join-Path $ProjectRoot "docs\devnet-results.md"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
@"
# Devnet Verification Results

Date: $timestamp

## Token

- Cluster: devnet
- Mint: ``$($tokenResult.mint)``
- Recipient: ``$($tokenResult.recipient)``
- Recipient token account: ``$($tokenResult.recipientTokenAccount)``
- Supply: ``$($tokenResult.initialSupply)``
- Decimals: ``$($tokenResult.decimals)``
- Mint authority revoked: ``$($tokenResult.mintAuthorityRevoked)``
- Freeze authority revoked: ``$($tokenResult.freezeAuthorityRevoked)``
- Transaction: ``$($tokenResult.signature)``

## Staking Program

- Program id: ``4kp8deHBoE6FQ7C3PD4QJ8Sw6rc9cSyJGtDxdBhwDmv2``
- Deployment output:

````text
$deployOutput
````

## Verification Commands

````bash
spl-token display $($tokenResult.mint) --url https://api.devnet.solana.com
spl-token balance $($tokenResult.mint) --owner $($tokenResult.recipient) --url https://api.devnet.solana.com
solana program show 4kp8deHBoE6FQ7C3PD4QJ8Sw6rc9cSyJGtDxdBhwDmv2 --url https://api.devnet.solana.com --keypair .secrets/devnet-payer.json
````
"@ | Set-Content -Path $resultPath -Encoding utf8

Write-Host "Devnet results written to $resultPath"
