import { readFileSync } from "node:fs";
import { z } from "zod";

export const tokenConfigSchema = z.object({
  cluster: z.enum(["localnet", "devnet", "testnet", "mainnet-beta"]),
  rpcUrl: z.string().url(),
  name: z.string().min(1).max(64),
  symbol: z.string().min(1).max(10).regex(/^[A-Z0-9]+$/),
  decimals: z.number().int().min(0).max(9),
  initialSupply: z.string().regex(/^[0-9]+$/),
  revokeMintAuthority: z.boolean(),
  revokeFreezeAuthority: z.boolean(),
  payerKeypairPath: z.string().min(1),
  recipientPublicKey: z.string().optional().default("")
});

export type TokenConfig = z.infer<typeof tokenConfigSchema>;

export function loadTokenConfig(path: string): TokenConfig {
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  const config = tokenConfigSchema.parse(raw);

  if (config.cluster === "mainnet-beta" && process.env.ALLOW_MAINNET !== "true") {
    throw new Error("Mainnet is blocked. Set ALLOW_MAINNET=true only after review.");
  }

  if (config.initialSupply === "0") {
    throw new Error("Initial supply must be greater than zero.");
  }

  return config;
}

export function baseUnits(amount: string, decimals: number): bigint {
  const multiplier = 10n ** BigInt(decimals);
  return BigInt(amount) * multiplier;
}
