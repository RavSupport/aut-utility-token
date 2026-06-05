import { readFileSync, writeFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { AnchorProvider, Program, Wallet, type Idl } from "@coral-xyz/anchor";
import BN from "bn.js";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import {
  ACCOUNT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createInitializeAccountInstruction,
  createMint,
  getAccount,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptAccount,
  mintTo
} from "@solana/spl-token";
import { loadKeypair } from "./keypair.js";

const RPC_URL = process.env.DEVNET_RPC_URL ?? "https://api.devnet.solana.com";
const PAYER_KEYPAIR = process.env.DEVNET_KEYPAIR ?? ".secrets/devnet-payer.json";
const PROGRAM_ID = new PublicKey("4kp8deHBoE6FQ7C3PD4QJ8Sw6rc9cSyJGtDxdBhwDmv2");
const AUT_MINT = new PublicKey(process.env.AUT_MINT ?? "3SRkJBHkko3BPQp5qpf9G5TfoGyPShhUg9HUFagKErWw");
const DECIMALS = 6;
const STAKE_AMOUNT = 100_000_000n;
const REWARD_VAULT_FUNDING = 500_000_000n;
const REWARD_SCALE = 1_000_000_000_000n;

async function createVaultTokenAccount(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const tokenAccount = Keypair.generate();
  const lamports = await getMinimumBalanceForRentExemptAccount(connection);
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: tokenAccount.publicKey,
        lamports,
        space: ACCOUNT_SIZE,
        programId: TOKEN_PROGRAM_ID
      }),
      createInitializeAccountInstruction(tokenAccount.publicKey, mint, owner, TOKEN_PROGRAM_ID)
    ),
    [payer, tokenAccount],
    { commitment: "confirmed" }
  );
  return tokenAccount.publicKey;
}

const connection = new Connection(RPC_URL, "confirmed");
const payer = loadKeypair(PAYER_KEYPAIR);
const provider = new AnchorProvider(connection, new Wallet(payer), { commitment: "confirmed" });
const idl = JSON.parse(readFileSync("target/idl/utility_staking.json", "utf8")) as Idl;
const program = new Program(idl, provider);

const ownerTokenAccount = getAssociatedTokenAddressSync(AUT_MINT, payer.publicKey);
const rewardMint = await createMint(connection, payer, payer.publicKey, null, DECIMALS);
const ownerRewardAccount = await createAssociatedTokenAccount(
  connection,
  payer,
  rewardMint,
  payer.publicKey
);
const [pool] = PublicKey.findProgramAddressSync(
  [Buffer.from("pool"), AUT_MINT.toBuffer(), rewardMint.toBuffer()],
  PROGRAM_ID
);
const [poolSigner] = PublicKey.findProgramAddressSync(
  [Buffer.from("pool-signer"), AUT_MINT.toBuffer(), rewardMint.toBuffer()],
  PROGRAM_ID
);
const [position] = PublicKey.findProgramAddressSync(
  [Buffer.from("position"), pool.toBuffer(), payer.publicKey.toBuffer()],
  PROGRAM_ID
);

const beforeOwner = await getAccount(connection, ownerTokenAccount);
const stakeVault = await createVaultTokenAccount(connection, payer, AUT_MINT, poolSigner);
const rewardVault = await createVaultTokenAccount(connection, payer, rewardMint, poolSigner);
await mintTo(connection, payer, rewardMint, rewardVault, payer, REWARD_VAULT_FUNDING);

await program.methods
  .initializePool(new BN(REWARD_SCALE.toString()))
  .accounts({
    authority: payer.publicKey,
    stakeMint: AUT_MINT,
    rewardMint,
    pool,
    poolSigner,
    stakeVault,
    rewardVault,
    systemProgram: SystemProgram.programId
  })
  .rpc();

await program.methods
  .initializePosition()
  .accounts({
    owner: payer.publicKey,
    pool,
    position,
    systemProgram: SystemProgram.programId
  })
  .rpc();

await program.methods
  .stake(new BN(STAKE_AMOUNT.toString()))
  .accounts({
    owner: payer.publicKey,
    pool,
    position,
    stakeMint: AUT_MINT,
    ownerStakeAccount: ownerTokenAccount,
    stakeVault,
    tokenProgram: TOKEN_PROGRAM_ID
  })
  .rpc();

await delay(2000);

await program.methods
  .claim()
  .accounts({
    owner: payer.publicKey,
    pool,
    position,
    poolSigner,
    rewardMint,
    ownerRewardAccount,
    rewardVault,
    tokenProgram: TOKEN_PROGRAM_ID
  })
  .rpc();

await program.methods
  .unstake(new BN(STAKE_AMOUNT.toString()))
  .accounts({
    owner: payer.publicKey,
    pool,
    position,
    poolSigner,
    stakeMint: AUT_MINT,
    ownerStakeAccount: ownerTokenAccount,
    stakeVault,
    tokenProgram: TOKEN_PROGRAM_ID
  })
  .rpc();

const afterOwner = await getAccount(connection, ownerTokenAccount);
const afterOwnerReward = await getAccount(connection, ownerRewardAccount);
const afterStakeVault = await getAccount(connection, stakeVault);
const afterRewardVault = await getAccount(connection, rewardVault);
const result = {
  cluster: "devnet",
  stakeMint: AUT_MINT.toBase58(),
  rewardMint: rewardMint.toBase58(),
  programId: PROGRAM_ID.toBase58(),
  owner: payer.publicKey.toBase58(),
  ownerTokenAccount: ownerTokenAccount.toBase58(),
  ownerRewardAccount: ownerRewardAccount.toBase58(),
  pool: pool.toBase58(),
  poolSigner: poolSigner.toBase58(),
  position: position.toBase58(),
  stakeVault: stakeVault.toBase58(),
  rewardVault: rewardVault.toBase58(),
  ownerBalanceBefore: beforeOwner.amount.toString(),
  ownerBalanceAfter: afterOwner.amount.toString(),
  ownerRewardBalanceAfter: afterOwnerReward.amount.toString(),
  stakeVaultBalanceAfter: afterStakeVault.amount.toString(),
  rewardVaultBalanceAfter: afterRewardVault.amount.toString()
};

writeFileSync("docs/devnet-staking-smoke.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
