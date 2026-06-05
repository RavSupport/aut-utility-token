# Localnet Verification Results

Date: 2026-06-04

## Environment

- Runtime: WSL2 Ubuntu
- Local validator: running at `http://127.0.0.1:8899`
- Agave/Solana CLI: 4.0.0 in WSL
- Anchor CLI: 0.32.1
- Project wallet: `8Nnsxq4Tps1Kubf5cYw1qU7UQgf3ksuFT5bmc1yYwLaJ`

## Token Mint

- Cluster: localnet
- Symbol: AUT
- Mint: `EnibLkmB89dB7ANdPc5R65Xf3ujZkHwfZpaV9N4RFQaH`
- Recipient token account: `EVhQFRfXR3KnyerHco4yGTyu2Jc7zn4HKVDsNwsCDDph`
- Supply: `21,000,000`
- Base units: `21,000,000,000,000`
- Decimals: `6`
- Mint authority: not set
- Freeze authority: not set
- Mint transaction: `Q1fMP5HsEHprq6sbDJNweCaUvGr7iLSzPAepF3bHxtDPt4t1Tpi9MVCk27RxnUtejwzPekmCXXdzFfSZZfjVSpZ`

Verified with:

```bash
spl-token display EnibLkmB89dB7ANdPc5R65Xf3ujZkHwfZpaV9N4RFQaH --url http://127.0.0.1:8899
spl-token balance EnibLkmB89dB7ANdPc5R65Xf3ujZkHwfZpaV9N4RFQaH --owner 8Nnsxq4Tps1Kubf5cYw1qU7UQgf3ksuFT5bmc1yYwLaJ --url http://127.0.0.1:8899
solana confirm Q1fMP5HsEHprq6sbDJNweCaUvGr7iLSzPAepF3bHxtDPt4t1Tpi9MVCk27RxnUtejwzPekmCXXdzFfSZZfjVSpZ --url http://127.0.0.1:8899
```

## Staking Program

- Program id: `4kp8deHBoE6FQ7C3PD4QJ8Sw6rc9cSyJGtDxdBhwDmv2`
- Program data address: `EFuFmjxUkHADGoLD7dd5Hys5NcoLGD9b5PtYgsLbmaFZ`
- Upgrade authority: `8Nnsxq4Tps1Kubf5cYw1qU7UQgf3ksuFT5bmc1yYwLaJ`
- Deploy transaction: `35B8zLfg9i4SSwS2q4crzSAm56GiZj2Q5DmmH3CDBjsvF64WfUcEsQ3pGG4LnTp1QRuuJryfYc2BdzY1E9CpuhNo`

Verified with:

```bash
solana program show 4kp8deHBoE6FQ7C3PD4QJ8Sw6rc9cSyJGtDxdBhwDmv2 --url http://127.0.0.1:8899 --keypair .secrets/devnet-payer.json
```

## Tests

Passed:

```bash
npm test
RUN_LOCALNET_TESTS=true npm test
npx tsc --noEmit
anchor build
```

The localnet staking integration test verifies:

- pool initialization
- position initialization
- zero-amount stake rejection
- staking transfer into PDA-owned vault
- reward accrual
- reward claim
- over-unstake rejection
- unstake principal return
- total supply preservation

## Current Limits

- This is localnet, not devnet or mainnet.
- Devnet minting is waiting on public devnet faucet funding; the faucet rejected the airdrop request due rate limiting.
- Mainnet is intentionally blocked until legal review, independent security review, treasury setup, and launch controls are complete.

