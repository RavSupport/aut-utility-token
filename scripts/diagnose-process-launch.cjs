const { spawnSync } = require("node:child_process");
const os = require("node:os");

const commands = [
  ["cmd.exe", ["/c", "whoami"]],
  ["powershell.exe", ["-NoProfile", "-Command", "whoami"]],
  ["git.exe", ["--version"]],
  ["wsl.exe", ["--status"]],
  ["C:\\tmp\\gh-cli\\bin\\gh.exe", ["--version"]]
];

console.log(JSON.stringify({
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  user: os.userInfo().username,
  cwd: process.cwd()
}, null, 2));

for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    cwd: process.cwd(),
    windowsHide: true
  });
  console.log(`\n--- ${command} ${args.join(" ")}`);
  console.log(`status=${result.status}`);
  console.log(`signal=${result.signal ?? ""}`);
  console.log(`error=${result.error ? result.error.message : ""}`);
  if (result.stdout) console.log(`stdout=${result.stdout.trim()}`);
  if (result.stderr) console.log(`stderr=${result.stderr.trim()}`);
}

