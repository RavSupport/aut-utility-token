# Pre-Mainnet Test Report

Date: 2026-06-04

## Decision

Do not deploy to mainnet yet.

AUT is functional on Solana localnet and devnet, but it is not production-ready. The functional tests passed, while the mainnet risk gates remain open.

## Passed Checks

- `npm test`: passed on Windows.
- `npx tsc --noEmit`: passed on Windows.
- `anchor build`: passed in WSL.
- `RUN_LOCALNET_TESTS=true npm test`: passed against a clean local Solana validator.
- Localnet staking integration: stake, claim, unstake, zero-stake rejection, and over-unstake rejection passed.
- Devnet token verification: supply is `21,000,000,000,000` base units with 6 decimals.
- Devnet mint authority: not set.
- Devnet freeze authority: not set.
- Devnet program verification: program `4kp8deHBoE6FQ7C3PD4QJ8Sw6rc9cSyJGtDxdBhwDmv2` is deployed.
- Devnet staking smoke: passed with AUT as the stake mint and a temporary reward mint.

## Current Devnet Smoke Result

- Stake mint: `3SRkJBHkko3BPQp5qpf9G5TfoGyPShhUg9HUFagKErWw`
- Reward mint: `EgDgYTAN23G9wzYKA4FtAR6HWe96eM2dyNy27Bf1furp`
- Pool: `A1bLrgsTCkCPZKka8dUA1Ac62RLHFhpF8vC69bed7BvB`
- Position: `CwcV4UwDyZHTNwR7hgLGsh2SxTDyihZ7CiC46m7e6sRN`
- Owner AUT balance before: `20,999,800,000,000`
- Owner AUT balance after: `20,999,800,000,000`
- Owner reward balance after: `300,000,000`
- Stake vault balance after unstake: `0`

## Open Mainnet Blockers

- `npm audit --json` reports 10 vulnerabilities: 7 moderate and 3 high.
- The audit fix suggestion for `@solana/spl-token` is a breaking downgrade to `0.1.8`; do not apply it blindly.
- No independent smart contract audit has been completed.
- No legal review has been completed for token sale, marketing, staking rewards, or jurisdictional compliance.
- No treasury multisig has been configured.
- Devnet upgrade authority is still a single wallet.
- Mainnet token metadata, logo, website disclosures, and holder-facing documentation are not finalized.
- Validator operations have not been rehearsed on the target Hyper-V environment.
- Monitoring, incident response, backups, and key-rotation procedures are not live.

## Build Notes

Anchor build emits Rust `unexpected cfg` warnings from Anchor/Solana macros. The build succeeds, but these warnings should be reviewed during dependency hardening before mainnet.

## Next Gate

Mainnet deployment should only proceed after dependency hardening, legal review, independent security review, multisig setup, metadata finalization, and validator operations rehearsal are complete.
