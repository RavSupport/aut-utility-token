import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { Keypair } from "@solana/web3.js";

const path = process.argv[2] ?? ".secrets/devnet-payer.json";

if (existsSync(path)) {
  throw new Error(`Refusing to overwrite existing keypair: ${path}`);
}

const keypair = Keypair.generate();
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, JSON.stringify(Array.from(keypair.secretKey)), { mode: 0o600 });

console.log(JSON.stringify({
  keypairPath: path,
  publicKey: keypair.publicKey.toBase58(),
  nextStep: "Fund this wallet with devnet SOL before creating a token."
}, null, 2));

