import { program } from "commander";
import { loadTokenConfig } from "./config.js";

program.requiredOption("-c, --config <path>", "Path to token config JSON");
program.parse();

const options = program.opts<{ config: string }>();
const config = loadTokenConfig(options.config);

console.log(JSON.stringify({
  ok: true,
  cluster: config.cluster,
  symbol: config.symbol,
  decimals: config.decimals,
  initialSupply: config.initialSupply,
  revokeMintAuthority: config.revokeMintAuthority,
  revokeFreezeAuthority: config.revokeFreezeAuthority
}, null, 2));

