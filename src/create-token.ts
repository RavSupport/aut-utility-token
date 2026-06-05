import { program } from "commander";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import {
  AuthorityType,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToCheckedInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE
} from "@solana/spl-token";
import { baseUnits, loadTokenConfig } from "./config.js";
import { loadKeypair } from "./keypair.js";

program.requiredOption("-c, --config <path>", "Path to token config JSON");
program.parse();

const options = program.opts<{ config: string }>();
const config = loadTokenConfig(options.config);
const payer = loadKeypair(config.payerKeypairPath);
const connection = new Connection(config.rpcUrl, "confirmed");

const mint = Keypair.generate();
const recipient = config.recipientPublicKey
  ? new PublicKey(config.recipientPublicKey)
  : payer.publicKey;
const recipientTokenAccount = getAssociatedTokenAddressSync(mint.publicKey, recipient);
const lamports = await getMinimumBalanceForRentExemptMint(connection);

const createMintTx = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint.publicKey,
    lamports,
    space: MINT_SIZE,
    programId: TOKEN_PROGRAM_ID
  }),
  createInitializeMintInstruction(
    mint.publicKey,
    config.decimals,
    payer.publicKey,
    payer.publicKey,
    TOKEN_PROGRAM_ID
  ),
  createAssociatedTokenAccountInstruction(
    payer.publicKey,
    recipientTokenAccount,
    recipient,
    mint.publicKey,
    TOKEN_PROGRAM_ID
  ),
  createMintToCheckedInstruction(
    mint.publicKey,
    recipientTokenAccount,
    payer.publicKey,
    baseUnits(config.initialSupply, config.decimals),
    config.decimals,
    [],
    TOKEN_PROGRAM_ID
  )
);

if (config.revokeMintAuthority) {
  createMintTx.add(
    createSetAuthorityInstruction(
      mint.publicKey,
      payer.publicKey,
      AuthorityType.MintTokens,
      null,
      [],
      TOKEN_PROGRAM_ID
    )
  );
}

if (config.revokeFreezeAuthority) {
  createMintTx.add(
    createSetAuthorityInstruction(
      mint.publicKey,
      payer.publicKey,
      AuthorityType.FreezeAccount,
      null,
      [],
      TOKEN_PROGRAM_ID
    )
  );
}

const signature = await sendAndConfirmTransaction(connection, createMintTx, [payer, mint], {
  commitment: "confirmed"
});

console.log(JSON.stringify({
  cluster: config.cluster,
  signature,
  mint: mint.publicKey.toBase58(),
  recipient: recipient.toBase58(),
  recipientTokenAccount: recipientTokenAccount.toBase58(),
  initialSupply: config.initialSupply,
  decimals: config.decimals,
  mintAuthorityRevoked: config.revokeMintAuthority,
  freezeAuthorityRevoked: config.revokeFreezeAuthority
}, null, 2));
