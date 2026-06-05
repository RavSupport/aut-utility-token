# Research Notes

Date: 2026-06-04

## Decision

Build first on Solana. Treat Cosmos as a later appchain path after product-market fit is proven.

## Solana Findings

Solana SPL tokens are represented by a mint account and token accounts. The official Solana token docs cover mint creation, token accounts, minting, transfers, authority changes, burns, freezing, and thawing:

https://solana.com/docs/tokens/basics

Token-2022 adds token extensions such as transfer fees and metadata pointers. Solana warns that extensions generally need to be planned before account initialization, and some extensions are incompatible:

https://solana.com/hi/docs/tokens/extensions

Implementation choice:

- Use the standard SPL Token Program first for broad wallet and DEX compatibility.
- Avoid transfer taxes in the initial launch because they can break or complicate liquidity integrations.
- Revoke mint authority after the initial supply is minted if the launch needs hard supply scarcity.
- Revoke freeze authority unless a compliant/permissioned token model requires freezing.
- Set the initial fixed supply target to 21,000,000 whole tokens. With 6 decimals, this equals 21,000,000,000,000 base units.

## Cosmos Findings

The Cosmos SDK is a modular framework for building application-specific blockchains. Modules encapsulate state, messages, queries, keepers, params, and business logic:

https://docs.cosmos.network/sdk/latest/learn/concepts/modules

IBC ICS-20 supports cross-chain fungible token transfers and denomination tracing:

https://docs.cosmos.network/ibc/latest/spec/app/ics-020-fungible-token-transfer/README

Interchain Security lets Cosmos Hub validators validate consumer chains, reducing the burden of bootstrapping a validator set:

https://docs.cosmos.network/hub/v25/interchain-security/README

Implementation choice:

- Do not start with a Cosmos chain unless the product needs custom consensus, custom staking economics, chain-level governance, or IBC-native protocol behavior.
- Revisit Cosmos after the Solana token and utility platform show actual usage.

## Regulatory Sources

The SEC explains that non-security crypto assets may still be sold as part of an investment contract when the Howey elements are present:

https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/transactions-involving-crypto-assets

The SEC describes digital tools as crypto assets with practical functions such as membership, tickets, credentials, title instruments, or identity badges:

https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/crypto-assets-federal-securities-laws

FinCEN guidance distinguishes users from administrators and exchangers of convertible virtual currency and explains when money transmission obligations can be triggered:

https://www.fincen.gov/resources/statutes-regulations/guidance/application-fincens-regulations-persons-administering

## Product Thesis

The token should behave like a practical digital tool, not an investment promise.

Initial niche:

- AI-agent and business automation credits
- API usage and rate-limit staking
- Marketplace access for agent templates, integrations, and workflows
- Platform fee discounts

Backing model:

- Utility: token buys real platform services.
- Treasury: platform revenue can fund transparent USDC/SOL reserves.
- Rewards: staking rewards should come from pre-funded reward vaults or rule-based revenue allocations.

Avoid:

- Guaranteed returns
- Dividend language
- Fixed redemption claims
- Hidden mint authority
- Unclear treasury control
- Anonymous or unaudited staking custody
