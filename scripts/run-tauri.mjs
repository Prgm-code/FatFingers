import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, join } from "node:path";

const env = { ...process.env };
const pathKey = Object.keys(env).find((key) => key.toLowerCase() === "path") ?? "PATH";
const currentPath = env[pathKey] ?? "";
const cargoBin = join(homedir(), ".cargo", "bin");

if (existsSync(cargoBin)) {
  const pathEntries = currentPath.split(delimiter).filter(Boolean);

  if (!pathEntries.includes(cargoBin)) {
    env[pathKey] = [cargoBin, ...pathEntries].join(delimiter);
  }
}

const isWindows = process.platform === "win32";
const command = isWindows ? "tauri.cmd" : "tauri";
const child = spawn(command, process.argv.slice(2), {
  env,
  shell: isWindows,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Failed to run Tauri CLI: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
