# Validator Operations Plan

Date: 2026-06-04

## Goal

Use the current host for development, local validation, monitoring, and early validator practice. Later migrate validator operations to a dedicated Hyper-V virtual machine.

This plan does not make the host machine a custodian of user staking funds. User token staking must remain on-chain through the staking program vaults.

## Source Basis

Agave is the Solana validator client maintained by Anza. The current validator documentation covers CLI setup, clusters, validator vs RPC node differences, system requirements, and validator quick start:

https://docs.anza.xyz/

Solana Foundation validator FAQ confirms that validators can be started on testnet and mainnet, while foundation delegation and vote-cost coverage have separate eligibility and performance requirements:

https://solana.org/faq

Solana's advanced node guidance recommends automatic restarts, monitoring with `solana-watchtower`, known validators for snapshot safety, ledger-size limits, and careful network port exposure:

https://solana.com/developers/guides/advanced/exchange

## Roles

### Project Token

- Solana SPL token mint.
- Created on devnet first.
- Mainnet minting blocked until reviewed.

### Project Staking Program

- Custom Anchor program for staking the project token.
- User principal is held in program-controlled token vaults.
- Rewards are paid from a funded reward vault.
- The host machine does not hold user funds.

### Solana Validator

- Runs Agave validator software.
- Participates in Solana consensus if configured as a voting validator.
- Uses identity and vote-account keys.
- Requires operational monitoring, version updates, network exposure, and funding for vote costs.

## Phase 1: Local Development Host

Use the current machine for:

- `solana-test-validator` localnet testing.
- Anchor program builds and local tests.
- Devnet token creation.
- Devnet staking tests.
- Validator practice on testnet only after CLI/toolchain installation is verified.

Do not use the current host for:

- Mainnet validator production.
- Long-term key custody.
- User token custody.
- Unreviewed reward automation.

## Phase 2: Testnet Validator Practice

Before mainnet:

- Install Agave/Solana CLI.
- Create separate keypairs:
  - validator identity key
  - vote account key
  - authorized withdrawer key
- Keep the authorized withdrawer key offline.
- Fund testnet as required.
- Start a testnet validator.
- Monitor vote credits, skip rate, uptime, and software version.
- Practice restart, upgrade, snapshot recovery, and key rotation.

## Phase 3: Hyper-V Migration

Hyper-V VM target:

- Dedicated Ubuntu Server VM.
- Fixed CPU and memory allocation.
- High-performance NVMe-backed virtual disk.
- Stable network interface and static IP or stable DNS.
- Separate disk for ledger/account data where possible.
- Host firewall rules limited to required validator ports.
- Monitoring and alerting enabled.

Migration steps:

1. Build and patch the Hyper-V VM.
2. Install Agave/Solana CLI.
3. Configure time sync.
4. Configure firewall and router/NAT rules.
5. Copy only the keys required for the validator role.
6. Keep withdrawer and treasury keys offline.
7. Start as non-voting or testnet first.
8. Confirm catch-up, health, and vote behavior.
9. Move production identity only after a clean test window.
10. Keep the old host available for rollback until the VM is stable.

## Key Management Rules

- Never commit keypair JSON files.
- Store keypairs outside the repository or under `.secrets/`, which is git-ignored.
- Keep authorized withdrawer, treasury, and mint-control keys offline.
- Use separate keys for:
  - token payer
  - mint authority
  - treasury multisig
  - validator identity
  - vote account
  - vote withdrawer
- Rotate keys after test migrations.

## Monitoring

Minimum monitoring:

- Validator process health.
- Disk capacity.
- Ledger growth.
- CPU load.
- Memory pressure.
- Network reachability.
- Vote credits.
- Skip rate.
- Software version.
- Restart count.

Recommended:

- `solana-watchtower`
- Prometheus/Grafana or equivalent
- External uptime monitor
- Alert channel for restart, version mismatch, vote failures, and disk exhaustion

## Mainnet Validator Gate

Do not start a mainnet voting validator until:

- Hardware and bandwidth meet current official requirements.
- Vote cost economics are understood.
- Mainnet SOL operating budget is approved.
- Key custody plan is tested.
- Monitoring is live.
- Upgrade procedure is documented.
- Rollback procedure is documented.
- At least one sustained testnet run has completed.

