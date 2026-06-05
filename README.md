# Utility Token Project

Solana-first cryptocurrency implementation scaffold for a utility-backed token with staking.

This repository is intentionally devnet-first. Mainnet creation is blocked by default until the token configuration, legal posture, wallet custody, vesting, treasury controls, and staking program are reviewed.

## Direction

- Launch network: Solana
- Token model: fixed-supply utility token
- Initial supply target: 21,000,000 whole tokens
- Backing model: service utility, transparent treasury reserves, and platform revenue support
- Initial utility: AI automation credits, API quota staking, marketplace access, and platform fee discounts
- Later expansion: Cosmos appchain only if custom chain governance, validator economics, or IBC-native infrastructure become necessary

## Safety Rules

- Do not commit private keys, seed phrases, or wallet files.
- Do not run mainnet scripts unless `ALLOW_MAINNET=true` is explicitly set.
- Start on `devnet`, test, audit, then deploy.
- Revoke mint authority only after supply, vesting, treasury, and reward-vault funding are verified.
- Do not market the token as guaranteed profit, dividends, or fixed redemption value without legal review.

## Planned Components

- `src/create-token.ts`: creates the token mint, mints initial supply, and optionally revokes authorities.
- `token.config.example.json`: token launch configuration template.
- `programs/utility_staking`: Anchor staking program scaffold.
- `docs/research.md`: verifiable design rationale and source links.
- `docs/security.md`: security and launch checklist.

## Local Development

Prerequisites:

- Node.js 20+
- npm
- Solana CLI
- Rust
- Anchor CLI

Install dependencies:

```powershell
npm install
```

Create a devnet token:

```powershell
copy token.config.example.json token.config.json
npm run token:create -- --config token.config.json
```

Run tests:

```powershell
npm test
```

Build staking program:

```powershell
npm run anchor:build
```

Deploy to devnet after localnet verification:

```powershell
.\scripts\devnet-deploy.ps1
```

Devnet may require manual faucet funding if public airdrops are rate-limited.
