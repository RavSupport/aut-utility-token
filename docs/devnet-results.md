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

An end-to-end staking smoke test passed on devnet using the deployed AUT mint.

- Pool: `ES4dRMfJ5Gphmvd2Hm8DsxPDzQB9cUDnnN4HRY6QekJa`
- Pool signer: `3UqGbF8hgpFCApymbue7PrAendNfn26ABjWvyitoh4mq`
- Position: `HZ1mhjevn8XBjC1FFRpqpoG2Hk38h2U3xeXhcrfABjCW`
- Stake vault: `ETsrpvfGJprMcLQ46Yyxm5vAKHMoh1ESYRy1QWmEFL7X`
- Reward vault: `7Dji7HYgmxRPWML7RaDdpCsJiB7p9Ju4BZw8gubvaRvP`
- Owner token account: `55bx8NAZH5WiASz18xbtzwGkUouhHdMCpXyxYnh2MRJa`
- Owner balance before: `21,000,000,000,000` base units
- Owner balance after: `20,999,800,000,000` base units
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
