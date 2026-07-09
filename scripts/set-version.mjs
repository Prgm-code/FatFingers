import { readFile, writeFile } from "node:fs/promises";

const version = process.argv[2];
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

if (!version || !semverPattern.test(version)) {
  throw new Error(`Expected a valid SemVer argument; received ${version ?? "nothing"}`);
}

async function updateJson(path) {
  const source = await readFile(path, "utf8");
  const pattern = /("version"\s*:\s*")[^"]+("\s*,)/;
  const matches = source.match(new RegExp(pattern.source, "g"));

  if (matches?.length !== 1) {
    throw new Error(`Expected exactly one top-level version in ${path}`);
  }

  await writeFile(path, source.replace(pattern, `$1${version}$2`));
}

async function replaceVersion(path, pattern, label) {
  const source = await readFile(path, "utf8");
  const matches = source.match(new RegExp(pattern.source, `${pattern.flags}g`));

  if (matches?.length !== 1) {
    throw new Error(`Expected exactly one ${label} version in ${path}`);
  }

  await writeFile(path, source.replace(pattern, `$1${version}$2`));
}

await Promise.all([
  updateJson("package.json"),
  updateJson("src-tauri/tauri.conf.json"),
  replaceVersion(
    "src-tauri/Cargo.toml",
    /(\[package\][\s\S]*?\nversion\s*=\s*")[^"]+("\s*\n)/,
    "Cargo package",
  ),
  replaceVersion(
    "src-tauri/Cargo.lock",
    /(\[\[package\]\]\nname = "fatfingers"\nversion = ")[^"]+("\n)/,
    "Cargo lock package",
  ),
]);

console.log(`Synchronized FatFingers version ${version}`);
