import { readFile, writeFile } from "node:fs/promises";

const version = process.argv[2];
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

if (!version || !semverPattern.test(version)) {
  throw new Error(`Expected a valid SemVer argument; received ${version ?? "nothing"}`);
}

async function updateJson(path) {
  const source = await readFile(path, "utf8");
  let document;

  try {
    document = JSON.parse(source);
  } catch (error) {
    throw new Error(`Expected valid JSON in ${path}`, { cause: error });
  }

  if (
    !document ||
    typeof document !== "object" ||
    Array.isArray(document) ||
    typeof document.version !== "string"
  ) {
    throw new Error(`Expected one top-level string version in ${path}`);
  }

  const versionProperties = [
    ...source.matchAll(/^([ \t]*)"version"(\s*:\s*)"([^"\r\n]*)"/gm),
  ];
  const minimumIndent = Math.min(...versionProperties.map((match) => match[1].length));
  const topLevelMatches = versionProperties.filter(
    (match) => match[1].length === minimumIndent,
  );

  if (topLevelMatches.length !== 1 || topLevelMatches[0][3] !== document.version) {
    throw new Error(`Could not locate the top-level version in ${path}`);
  }

  const match = topLevelMatches[0];
  const start = match.index;
  const replacement = `${match[1]}"version"${match[2]}"${version}"`;
  await writeFile(
    path,
    `${source.slice(0, start)}${replacement}${source.slice(start + match[0].length)}`,
  );
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
