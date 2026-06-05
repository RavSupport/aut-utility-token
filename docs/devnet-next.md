# Devnet Next Step

The localnet prototype is functional and public. The next engineering stage is devnet.

## Goal

Deploy the same verified token and staking system to Solana devnet:

- 21,000,000 AUT supply
- 6 decimals
- mint authority revoked
- freeze authority revoked
- staking program deployed
- devnet verification recorded

## Command

Run from PowerShell:

```powershell
.\scripts\devnet-deploy.ps1
```

The script:

1. Checks the devnet wallet balance.
2. Retries devnet airdrops.
3. Runs tests and type checks.
4. Validates token config.
5. Builds the Anchor staking program.
6. Mints the devnet token.
7. Deploys the staking program.
8. Writes `docs/devnet-results.md`.

## Known Constraint

Public Solana devnet faucet access can be rate-limited. If the script cannot get enough devnet SOL, manually fund this devnet wallet and rerun:

```text
8Nnsxq4Tps1Kubf5cYw1qU7UQgf3ksuFT5bmc1yYwLaJ
```

The script requires at least 4 devnet SOL because deploying the staking program can require multiple SOL for program/account rent.

## Mainnet Rule

Do not use this script for mainnet. Mainnet remains blocked until legal review, independent security review, multisig treasury setup, and launch controls are complete.

