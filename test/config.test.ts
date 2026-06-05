import { describe, expect, it } from "vitest";
import { baseUnits, tokenConfigSchema } from "../src/config.js";

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
});

