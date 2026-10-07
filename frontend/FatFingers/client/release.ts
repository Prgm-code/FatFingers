import type { GitHubRelease } from "../shared/release";
import type { AssetKind } from "./copy";

export const REPO_URL = "https://github.com/Prgm-code/FatFingers";
export const RELEASES_URL = `${REPO_URL}/releases`;
export const CHANGELOG_URL = `${REPO_URL}/blob/main/CHANGELOG.md`;
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;
export const RELEASE_BADGE_URL =
  "https://img.shields.io/github/v/release/Prgm-code/FatFingers?include_prereleases&sort=date";
const RELEASES_API = "https://api.github.com/repos/Prgm-code/FatFingers/releases?per_page=5";

export type Platform = "macos" | "windows" | "linux" | "unknown";

export type ResolvedRelease = {
  version: string;
  pageUrl: string;
  links: Partial<Record<AssetKind, string>>;
  primary: AssetKind | null;
};

export const ASSET_GROUPS: Array<{ name: string; kinds: AssetKind[] }> = [
  { name: "macOS", kinds: ["mac-arm", "mac-intel"] },
  { name: "Windows", kinds: ["windows"] },
  { name: "Linux", kinds: ["appimage", "deb", "rpm"] },
];

const ASSET_PATTERNS: Record<AssetKind, RegExp> = {
  "mac-arm": /darwin-aarch64\.dmg$/i,
  "mac-intel": /darwin-x64\.dmg$/i,
  windows: /windows.*setup\.exe$/i,
  appimage: /linux.*\.appimage$/i,
  deb: /linux.*\.deb$/i,
  rpm: /linux.*\.rpm$/i,
};

type NavigatorWithUAData = Navigator & {
  userAgentData?: {
    platform?: string;
    getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>;
  };
};

export function detectPlatform(): Platform {
  const nav = navigator as NavigatorWithUAData;
  const value = `${nav.userAgentData?.platform ?? ""} ${navigator.platform ?? ""} ${navigator.userAgent}`.toLowerCase();

  if (value.includes("mac")) return "macos";
  if (value.includes("win")) return "windows";
  if (value.includes("linux") || value.includes("x11")) return "linux";
  return "unknown";
}

async function detectArchitecture(): Promise<string> {
  const nav = navigator as NavigatorWithUAData;
  try {
    const values = await nav.userAgentData?.getHighEntropyValues?.(["architecture"]);
    return values?.architecture?.toLowerCase() ?? "";
  } catch {
    return "";
  }
}

function preferredKinds(platform: Platform, architecture: string): AssetKind[] {
  if (platform === "windows") return ["windows"];
  if (platform === "linux") return ["appimage", "deb", "rpm"];
  if (platform === "macos") return architecture.includes("x86") ? ["mac-intel", "mac-arm"] : ["mac-arm", "mac-intel"];
  return [];
}

function linksFor(release: GitHubRelease): Partial<Record<AssetKind, string>> {
  const links: Partial<Record<AssetKind, string>> = {};
  for (const kind of Object.keys(ASSET_PATTERNS) as AssetKind[]) {
    const asset = release.assets.find((candidate) => ASSET_PATTERNS[kind].test(candidate.name));
    if (asset) links[kind] = asset.browser_download_url;
  }
  return links;
}

// Asset names follow the stable pattern produced by the release workflow, so a
// tag is enough to build direct links without spending GitHub API quota.
function releaseFromTag(tag: string): GitHubRelease {
  const assetNames = [
    `FatFingers-${tag}-darwin-aarch64.dmg`,
    `FatFingers-${tag}-darwin-x64.dmg`,
    `FatFingers-${tag}-linux-amd64.AppImage`,
    `FatFingers-${tag}-linux-amd64.deb`,
    `FatFingers-${tag}-linux-x86_64.rpm`,
    `FatFingers-${tag}-windows-x64-setup.exe`,
  ];

  return {
    tag_name: tag,
    html_url: `${RELEASES_URL}/tag/${encodeURIComponent(tag)}`,
    assets: assetNames.map((name) => ({
      name,
      browser_download_url: `${RELEASES_URL}/download/${encodeURIComponent(tag)}/${encodeURIComponent(name)}`,
    })),
  };
}

async function releaseFromBadge(): Promise<GitHubRelease | null> {
  try {
    const response = await fetch(RELEASE_BADGE_URL);
    if (!response.ok) return null;

    const badge = await response.text();
    const tag = badge.match(/aria-label="release: ([^"]+)"/)?.[1]?.trim();
    if (!tag || !/^v?\d/.test(tag)) return null;
    return releaseFromTag(tag);
  } catch {
    return null;
  }
}

export async function resolveRelease(platform: Platform): Promise<ResolvedRelease> {
  const architecture = await detectArchitecture();
  const badgeRelease = await releaseFromBadge();
  let releases = badgeRelease ? [badgeRelease] : [];

  if (releases.length === 0) {
    const response = await fetch(RELEASES_API, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error("GitHub release unavailable");
    releases = (await response.json()) as GitHubRelease[];
  }

  const kinds = preferredKinds(platform, architecture);
  const candidates = releases.map((release) => ({ release, links: linksFor(release) }));
  const match = candidates.find((candidate) => kinds.some((kind) => candidate.links[kind])) ?? candidates[0];
  if (!match) throw new Error("No releases found");

  return {
    version: match.release.tag_name.replace(/^v/, ""),
    pageUrl: match.release.html_url,
    links: match.links,
    primary: kinds.find((kind) => match.links[kind]) ?? null,
  };
}
