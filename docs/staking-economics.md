# Staking Economics

Date: 2026-06-04

## Current State

The staking mechanics are functional. The economics are not final.

Current program behavior:

- Users stake the configured stake mint.
- Staked principal is held in a PDA-owned stake vault.
- Rewards are paid from a PDA-owned reward vault.
- The program does not mint rewards.
- Rewards can only be paid if the reward vault is funded.

## Production Requirement

A token people may want to buy needs credible utility, not a promise of profit. AUT should be positioned around platform use:

- AI automation credits.
- Staked quota for higher API or workflow limits.
- Marketplace access for templates, integrations, and verified workflows.
- Discounts or fee reductions for active platform users.

## Reward Source

Rewards should not be described as guaranteed yield. A production reward vault must have a transparent source, such as:

- fixed promotional reward allocation,
- platform revenue allocation,
- marketplace fee allocation,
- grants or treasury-approved incentive budget.

## Required Decisions

Before mainnet:

- final reward rate,
- reward emission duration,
- maximum reward budget,
- whether rewards are paid in AUT or another asset,
- whether reward rates can change,
- who can fund reward vaults,
- who can pause or upgrade the staking program,
- public explanation of risks and no guaranteed profit.

## Current Recommendation

Use staking primarily as an access-control and loyalty mechanism. Do not market staking as passive income. Keep reward budgets capped and funded from transparent vaults.
