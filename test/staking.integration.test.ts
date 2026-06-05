import { readFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { Program, AnchorProvider, Wallet, setProvider, type Idl } from "@coral-xyz/anchor";
import BN from "bn.js";
import { beforeAll, describe, expect, it } from "vitest";
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
  getMinimumBalanceForRentExemptAccount,
  mintTo,
  getMint
} from "@solana/spl-token";

const RUN_LOCALNET_TESTS = process.env.RUN_LOCALNET_TESTS === "true";
const describeLocalnet = RUN_LOCALNET_TESTS ? describe : describe.skip;
const PROGRAM_ID = new PublicKey("4kp8deHBoE6FQ7C3PD4QJ8Sw6rc9cSyJGtDxdBhwDmv2");
const RPC_URL = process.env.LOCALNET_RPC_URL ?? "http://127.0.0.1:8899";
const KEYPAIR_PATH = process.env.LOCALNET_KEYPAIR ?? ".secrets/devnet-payer.json";
const REWARD_SCALE = 1_000_000_000_000n;

function loadKeypair(path: string): Keypair {
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(path, "utf8")) as number[]));
}

async function expectRejects(fn: () => Promise<unknown>) {
  let failed = false;
  try {
    await fn();
  } catch {
    failed = true;
  }
  expect(failed).toBe(true);
}

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

describeLocalnet("utility staking localnet integration", () => {
  const connection = new Connection(RPC_URL, "confirmed");
  const payer = loadKeypair(KEYPAIR_PATH);
  const wallet = new Wallet(payer);
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  const idl = JSON.parse(readFileSync("target/idl/utility_staking.json", "utf8")) as Idl;
  const program = new Program(idl, provider);

  beforeAll(async () => {
    setProvider(provider);
    const balance = await connection.getBalance(payer.publicKey);
    expect(balance).toBeGreaterThan(1_000_000_000);
  });

  it("stakes, claims rewards, unstakes, and rejects invalid actions", async () => {
    const stakeMint = await createMint(connection, payer, payer.publicKey, null, 6);
    const rewardMint = await createMint(connection, payer, payer.publicKey, null, 6);
    const ownerStakeAccount = await createAssociatedTokenAccount(
      connection,
      payer,
      stakeMint,
      payer.publicKey
    );
    const ownerRewardAccount = await createAssociatedTokenAccount(
      connection,
      payer,
      rewardMint,
      payer.publicKey
    );
    await mintTo(connection, payer, stakeMint, ownerStakeAccount, payer, 1_000_000_000n);

    const [pool] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), stakeMint.toBuffer(), rewardMint.toBuffer()],
      PROGRAM_ID
    );
    const [poolSigner] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool-signer"), stakeMint.toBuffer(), rewardMint.toBuffer()],
      PROGRAM_ID
    );
    const [position] = PublicKey.findProgramAddressSync(
      [Buffer.from("position"), pool.toBuffer(), payer.publicKey.toBuffer()],
      PROGRAM_ID
    );
    const stakeVault = await createVaultTokenAccount(connection, payer, stakeMint, poolSigner);
    const rewardVault = await createVaultTokenAccount(connection, payer, rewardMint, poolSigner);
    await mintTo(connection, payer, rewardMint, rewardVault, payer, 5_000_000_000n);

    await program.methods
      .initializePool(new BN(REWARD_SCALE.toString()))
      .accounts({
        authority: payer.publicKey,
        stakeMint,
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

    await expectRejects(() =>
      program.methods
        .stake(new BN(0))
        .accounts({
          owner: payer.publicKey,
          pool,
          position,
          stakeMint,
          ownerStakeAccount,
          stakeVault,
          tokenProgram: TOKEN_PROGRAM_ID
        })
        .rpc()
    );

    await program.methods
      .stake(new BN(500_000_000))
      .accounts({
        owner: payer.publicKey,
        pool,
        position,
        stakeMint,
        ownerStakeAccount,
        stakeVault,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .rpc();

    expect((await getAccount(connection, stakeVault)).amount).toBe(500_000_000n);
    await delay(1500);

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

    expect((await getAccount(connection, ownerRewardAccount)).amount).toBeGreaterThan(0n);
    await expectRejects(() =>
      program.methods
        .unstake(new BN(600_000_000))
        .accounts({
          owner: payer.publicKey,
          pool,
          position,
          poolSigner,
          stakeMint,
          ownerStakeAccount,
          stakeVault,
          tokenProgram: TOKEN_PROGRAM_ID
        })
        .rpc()
    );

    await program.methods
      .unstake(new BN(500_000_000))
      .accounts({
        owner: payer.publicKey,
        pool,
        position,
        poolSigner,
        stakeMint,
        ownerStakeAccount,
        stakeVault,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .rpc();

    expect((await getAccount(connection, stakeVault)).amount).toBe(0n);
    expect((await getAccount(connection, ownerStakeAccount)).amount).toBe(1_000_000_000n);
    expect((await getMint(connection, stakeMint)).supply).toBe(1_000_000_000n);
  }, 60_000);
});
