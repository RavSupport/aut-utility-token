import { readFileSync } from "node:fs";
import { Keypair } from "@solana/web3.js";

export function loadKeypair(path: string): Keypair {
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!Array.isArray(raw) || raw.length !== 64 || !raw.every((value) => Number.isInteger(value))) {
    throw new Error(`Invalid Solana keypair file: ${path}`);
  }

  return Keypair.fromSecretKey(Uint8Array.from(raw as number[]));
}

