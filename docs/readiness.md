# Readiness Status

Date: 2026-06-04

## Current Status

Functional on localnet. Not yet production-ready.

The token minting path and staking program have been built, deployed, and tested on a local Solana validator. Devnet deployment is blocked only by public faucet rate limiting. Mainnet remains intentionally blocked.

## Implemented

- Solana-first token plan.
- 21,000,000 fixed-supply default.
- Devnet-first token configuration.
- Mainnet safety block unless `ALLOW_MAINNET=true`.
- Token creation script scaffold.
- Devnet wallet generator.
- Anchor staking program scaffold.
- Localnet token mint verified.
- Localnet staking program deployed.
- Localnet staking behavior tests passed.
- Validator operations plan.
- Security and launch checklist.
- Research notes with primary-source links.

## Verification Results

- `npm test`: passed.
- `npx tsc --noEmit`: passed.
- `anchor build`: passed in WSL.
- `RUN_LOCALNET_TESTS=true npm test`: passed.
- Localnet token supply: 21,000,000 AUT.
- Mint authority: not set.
- Freeze authority: not set.
- Staking program deployed: `4kp8deHBoE6FQ7C3PD4QJ8Sw6rc9cSyJGtDxdBhwDmv2`.

See `docs/localnet-results.md` for addresses, transactions, and commands.

## Ready-To-Run Commands

```powershell
npm install
npm test
npm run token:validate-config -- --config token.config.example.json
```

WSL localnet:

```bash
RUN_LOCALNET_TESTS=true npm test
anchor build
```

## Functional Gate

The localnet project is functional because all of these passed:

- Dependencies install successfully.
- TypeScript tests pass.
- Anchor program builds.
- Localnet staking tests pass.
- Localnet wallet is created and funded.
- Localnet token is minted with 21,000,000 supply.
- Mint authority status is verified.
- Freeze authority status is verified.
- Staking vault accepts deposits.
- Unstaking returns principal correctly.
- Reward claims behave correctly.
- Invalid actions fail correctly.

Devnet remains pending:

- Devnet wallet funding.
- Devnet token mint.
- Devnet staking deployment and test pass.

## Production Gate

Mainnet remains blocked until:

- Legal review is complete.
- Independent smart contract review is complete.
- Treasury multisig is configured.
- Vesting and allocation schedule are final.
- Validator operations are tested.
- Hyper-V migration plan is rehearsed.
- Monitoring and incident response are live.
