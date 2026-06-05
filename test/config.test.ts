import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { baseUnits, loadTokenConfig, tokenConfigSchema } from "../src/config.js";

const MAINNET_ENV = [
  "ALLOW_MAINNET",
  "MAINNET_LEGAL_REVIEW_COMPLETE",
  "MAINNET_SECURITY_REVIEW_COMPLETE",
  "MAINNET_MULTISIG_READY",
  "MAINNET_DEPENDENCY_RISK_ACCEPTED",
  "MAINNET_VALIDATOR_REHEARSED",
  "MAINNET_METADATA_READY"
] as const;

function writeConfig(cluster: "devnet" | "mainnet-beta") {
  const dir = mkdtempSync(join(tmpdir(), "aut-config-"));
  const path = join(dir, "token.config.json");
  writeFileSync(path, JSON.stringify({
    cluster,
    rpcUrl: cluster === "devnet" ? "https://api.devnet.solana.com" : "https://api.mainnet-beta.solana.com",
    name: "Agent Utility Token",
    symbol: "AUT",
    decimals: 6,
    initialSupply: "21000000",
    revokeMintAuthority: true,
    revokeFreezeAuthority: true,
    payerKeypairPath: ".secrets/mainnet-payer.json",
    recipientPublicKey: ""
  }));
  return { dir, path };
}

afterEach(() => {
  for (const name of MAINNET_ENV) {
    delete process.env[name];
  }
});

describe("token config", () => {
  it("converts whole tokens to base units", () => {
    expect(baseUnits("1000", 6)).toBe(1_000_000_000n);
  });

  it("rejects lowercase symbols", () => {
    expect(() => tokenConfigSchema.parse({
      cluster: "devnet",
      rpcUrl: "https://api.devnet.solana.com",
      name: "Agent Utility Token",
      symbol: "aut",
      decimals: 6,
      initialSupply: "1000000",
      revokeMintAuthority: true,
      revokeFreezeAuthority: true,
      payerKeypairPath: ".secrets/devnet-payer.json",
      recipientPublicKey: ""
    })).toThrow();
  });

  it("blocks mainnet config unless all launch gates are explicit", () => {
    const { dir, path } = writeConfig("mainnet-beta");
    try {
      process.env.ALLOW_MAINNET = "true";
      expect(() => loadTokenConfig(path)).toThrow(/MAINNET_LEGAL_REVIEW_COMPLETE/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("allows mainnet config only after every launch gate is explicit", () => {
    const { dir, path } = writeConfig("mainnet-beta");
    try {
      for (const name of MAINNET_ENV) {
        process.env[name] = "true";
      }
      expect(loadTokenConfig(path).cluster).toBe("mainnet-beta");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
