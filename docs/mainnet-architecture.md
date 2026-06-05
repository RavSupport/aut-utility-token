# Mainnet Architecture

Date: 2026-06-04

## Status

Mainnet is blocked by design. AUT is a verified localnet and devnet prototype, not a production launch.

## Architecture Standard

The production architecture must satisfy four separate standards before launch:

- Functional correctness: token supply, staking, claiming, unstaking, and failure paths behave as tested.
- Operational safety: keys, validators, monitoring, backups, and recovery are documented and rehearsed.
- Economic clarity: rewards, utility, treasury funding, and supply allocation are published and internally consistent.
- External review: legal and independent smart contract review are complete.

## Mainnet Gate

The token creation script refuses `mainnet-beta` unless every gate below is explicitly set to `true`:

- `ALLOW_MAINNET`
- `MAINNET_LEGAL_REVIEW_COMPLETE`
- `MAINNET_SECURITY_REVIEW_COMPLETE`
- `MAINNET_MULTISIG_READY`
- `MAINNET_DEPENDENCY_RISK_ACCEPTED`
- `MAINNET_VALIDATOR_REHEARSED`
- `MAINNET_METADATA_READY`

This does not make mainnet safe by itself. It prevents accidental launch before the required decisions are made.

## Wallet And Authority Model

Devnet currently uses one project wallet for convenience. Mainnet must not.

- Token mint authority: should be revoked after minting fixed supply.
- Freeze authority: should be revoked unless a specific compliance requirement is approved by counsel.
- Program upgrade authority: must move to multisig or be intentionally removed after audit and final deployment.
- Treasury and reward vault funding: must be controlled by multisig.
- Validator identity and vote keys: must be stored separately from treasury keys.

## Staking Model

The current staking program supports:

- PDA-owned stake vaults.
- PDA-owned reward vaults.
- Stake.
- Claim.
- Unstake.
- Checked arithmetic.
- Rejection of zero stake and over-unstake.

Production staking still requires:

- Final reward rate.
- Reward budget.
- Funding source.
- Abuse analysis.
- Public reward disclosure.
- Rules for reward changes.
- Rules for program upgrades.

## Dependency Position

The deployed Solana program is Rust/SBF bytecode. The npm audit findings affect the JavaScript/TypeScript operational toolchain and client scripts, not the already deployed on-chain bytecode.

Those findings still block mainnet because launch scripts touch keypairs, RPC endpoints, and token creation. They require either a safe upstream fix or a documented risk acceptance after review.

## Validator Position

The host machine may be used for validator experimentation and later migration to Hyper-V. It must not custody user funds. Mainnet validator operations require:

- Dedicated validator identity.
- Separate vote account.
- Snapshot and ledger storage plan.
- Monitoring and alerting.
- Firewall rules.
- Recovery drill.
- Hyper-V migration rehearsal.
- Documented key backup and rotation plan.

## Mainnet Decision

AUT should not move to mainnet until the gates above are complete and the result is committed to this repository.
