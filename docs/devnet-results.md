# Devnet Verification Results

Date: 2026-06-04

## Environment

- Cluster: Solana devnet
- Project wallet: `8Nnsxq4Tps1Kubf5cYw1qU7UQgf3ksuFT5bmc1yYwLaJ`
- Funding source: Solana Foundation web faucet with GitHub verification

## Token

- Symbol: AUT
- Mint: `3SRkJBHkko3BPQp5qpf9G5TfoGyPShhUg9HUFagKErWw`
- Recipient: `8Nnsxq4Tps1Kubf5cYw1qU7UQgf3ksuFT5bmc1yYwLaJ`
- Recipient token account: `55bx8NAZH5WiASz18xbtzwGkUouhHdMCpXyxYnh2MRJa`
- Supply: `21,000,000`
- Base units: `21,000,000,000,000`
- Decimals: `6`
- Mint authority: not set
- Freeze authority: not set
- Token transaction: `5SnXmQboAN1CyidqyxEL1v5Tw8dqNzW7u5EBB67L2fWiyDnMHqch5GxF33WcdFXeNveB4FB3iByCXSk2AbYhRcLh`

Verified with:

```bash
spl-token display 3SRkJBHkko3BPQp5qpf9G5TfoGyPShhUg9HUFagKErWw --url https://api.devnet.solana.com
spl-token balance 3SRkJBHkko3BPQp5qpf9G5TfoGyPShhUg9HUFagKErWw --owner 8Nnsxq4Tps1Kubf5cYw1qU7UQgf3ksuFT5bmc1yYwLaJ --url https://api.devnet.solana.com
solana confirm 5SnXmQboAN1CyidqyxEL1v5Tw8dqNzW7u5EBB67L2fWiyDnMHqch5GxF33WcdFXeNveB4FB3iByCXSk2AbYhRcLh --url https://api.devnet.solana.com
```

## Staking Program

- Program id: `4kp8deHBoE6FQ7C3PD4QJ8Sw6rc9cSyJGtDxdBhwDmv2`
- Program data address: `EFuFmjxUkHADGoLD7dd5Hys5NcoLGD9b5PtYgsLbmaFZ`
- Upgrade authority: `8Nnsxq4Tps1Kubf5cYw1qU7UQgf3ksuFT5bmc1yYwLaJ`
- Last deployed in slot: `467217519`
- Data length: `297992` bytes
- Program account balance: `2.0752284 SOL`
- Deploy transaction: `5a4wTnZt3JKTFDuTbYjuiYBXvBf8xHXTtMa46sk1qJ5a7YQ95fCaoJuDvTkg1QFgGg8KPRnf5ptQL8hFJWbCB6ci`

Verified with:

```bash
solana program show 4kp8deHBoE6FQ7C3PD4QJ8Sw6rc9cSyJGtDxdBhwDmv2 --url https://api.devnet.solana.com --keypair .secrets/devnet-payer.json
solana confirm 5a4wTnZt3JKTFDuTbYjuiYBXvBf8xHXTtMa46sk1qJ5a7YQ95fCaoJuDvTkg1QFgGg8KPRnf5ptQL8hFJWbCB6ci --url https://api.devnet.solana.com
```

## Staking Smoke Test

An end-to-end staking smoke test passed on devnet using the deployed AUT mint as the stake asset. The repeatable smoke test creates a temporary reward mint on each run so the pool PDA is unique and can be tested more than once without reminting AUT.

- Stake mint: `3SRkJBHkko3BPQp5qpf9G5TfoGyPShhUg9HUFagKErWw`
- Reward mint: `EgDgYTAN23G9wzYKA4FtAR6HWe96eM2dyNy27Bf1furp`
- Pool: `A1bLrgsTCkCPZKka8dUA1Ac62RLHFhpF8vC69bed7BvB`
- Pool signer: `W4Cz3KxmUQgEC2THVd1RdWBAgyRxfCRmnZC6vx3tSpe`
- Position: `CwcV4UwDyZHTNwR7hgLGsh2SxTDyihZ7CiC46m7e6sRN`
- Stake vault: `rNVityX8SUi8WCxKATbQELsP91YUUFYAdvLd94Dsttw`
- Reward vault: `Bat4KScW7jdoXV5QJeDhCMtPvmxQmuBYqS57uYaErUs2`
- Owner token account: `55bx8NAZH5WiASz18xbtzwGkUouhHdMCpXyxYnh2MRJa`
- Owner reward account: `5TJQ7r2v8QFpLbcpS4dYpZaWHbLx1wu7UuPMzFBAX5t6`
- Owner AUT balance before: `20,999,800,000,000` base units
- Owner AUT balance after: `20,999,800,000,000` base units
- Owner reward balance after: `300,000,000` base units
- Stake vault balance after unstake: `0`
- Reward vault balance after claim: `200,000,000` base units

Verified with:

```bash
npm run devnet:staking-smoke
```

The smoke test:

- created PDA-owned stake and reward vaults
- funded the reward vault
- initialized the staking pool
- initialized the wallet staking position
- staked AUT
- claimed rewards
- unstaked AUT
- verified principal returned and the stake vault ended at zero

## Mainnet Rule

This is not a mainnet launch. Mainnet remains blocked until legal review, independent security review, multisig treasury setup, token metadata finalization, and launch controls are complete.
