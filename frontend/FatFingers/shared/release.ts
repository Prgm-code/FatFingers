export type ReleaseAsset = {
  name: string;
  browser_download_url: string;
};

export type GitHubRelease = {
  tag_name: string;
  html_url: string;
  assets: ReleaseAsset[];
};
