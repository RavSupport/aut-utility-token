# Dependency Risk Register

Date: 2026-06-04

## Summary

`npm audit --json` currently reports 10 findings: 7 moderate and 3 high. No stable package upgrade is currently available for the direct Solana and Anchor packages used here.

Checked current stable versions:

- `@solana/web3.js`: current `1.98.4`, latest stable `1.98.4`
- `@solana/spl-token`: current `0.4.14`, latest stable `0.4.14`
- `@coral-xyz/anchor`: current `0.32.1`, latest stable `0.32.1`

## Findings

| Package | Severity | Path | Status |
| --- | --- | --- | --- |
| `bigint-buffer` | High | `@solana/spl-token -> @solana/buffer-layout-utils -> bigint-buffer` | No safe direct upgrade available through current stable SPL token package |
| `uuid` | Moderate | `@solana/web3.js -> jayson -> uuid` | No safe direct upgrade available through current stable web3 package |
| `@solana/web3.js` | Moderate | Direct and transitive | Current stable still reported by audit |
| `@solana/spl-token` | High | Direct | Current stable still reported by audit |
| `@coral-xyz/anchor` | Moderate | Direct | No fix currently available |

## Rejected Automatic Fix

`npm audit fix --force` suggests changing `@solana/spl-token` to `0.1.8`. That is an old incompatible major-version downgrade and should not be applied blindly.

## Mitigation

- Keep mainnet blocked.
- Use devnet-only keypairs for testing.
- Do not run launch scripts with production keys until risk is accepted or fixed.
- Re-check package versions before every launch review.
- Prefer upstream stable Solana package fixes over overrides that may break ABI or runtime behavior.

## Acceptance Rule

Mainnet can only proceed if either:

- upstream packages resolve the findings and all tests pass, or
- `MAINNET_DEPENDENCY_RISK_ACCEPTED=true` is set after explicit written review of these findings.
