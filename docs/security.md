# Security And Launch Checklist

## Before Devnet

- Confirm token name, symbol, decimals, and supply.
- Confirm whether mint authority and freeze authority should be revoked.
- Create a dedicated devnet payer wallet.
- Never reuse a personal wallet seed phrase in scripts.
- Keep `.secrets/` out of git.

## Devnet Verification

- Validate token config with `npm run token:validate-config`.
- Create token only on devnet.
- Confirm mint address and token account on a Solana explorer.
- Confirm total supply.
- Confirm mint authority status.
- Confirm freeze authority status.
- Test staking deposits, withdrawals, and reward claims on localnet.
- Test insufficient balance, zero amount, double claim, and over-unstake failures.

## Mainnet Blockers

Mainnet must not proceed until these are complete:

- Mainnet config gate passes only after all required launch environment variables are set.
- Dependency risk register is reviewed and either resolved or formally accepted.
- Legal review of token sale, marketing, treasury, staking, and rewards.
- Independent smart contract review.
- Public tokenomics document.
- Public vesting schedule.
- Treasury multisig configured.
- Reward vault funding policy defined.
- Liquidity plan reviewed.
- Incident response plan written.
- Admin key rotation and custody plan verified.

Required launch gate variables:

- `ALLOW_MAINNET`
- `MAINNET_LEGAL_REVIEW_COMPLETE`
- `MAINNET_SECURITY_REVIEW_COMPLETE`
- `MAINNET_MULTISIG_READY`
- `MAINNET_DEPENDENCY_RISK_ACCEPTED`
- `MAINNET_VALIDATOR_REHEARSED`
- `MAINNET_METADATA_READY`

## Staking Safety Rules

- Staked principal must be held in an on-chain vault owned by a PDA, not by the host machine.
- The host machine may run monitoring, indexing, dashboards, local validators, and automation jobs.
- The host machine must not custody user funds.
- Rewards must be paid only from a pre-funded reward vault or transparent revenue allocation.
- Reward calculations must use checked arithmetic.
- Users must be able to withdraw principal according to the published staking rules.

## Compliance Risk Notes

- Do not say buyers will profit from team efforts.
- Do not promise guaranteed yield.
- Do not present staking rewards as passive investment income without legal review.
- Do not call the treasury "backing" if holders do not have redemption rights.
- If redemption rights are added, stablecoin, money transmission, securities, commodities, and state licensing issues may apply.
