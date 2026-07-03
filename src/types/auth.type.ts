export type GitHubAuthUrlResult = {
  url: string;
  state?: string;
};

export type GitHubCallbackResult = {
  accessToken?: string;
  refreshToken?: string;
  githubAppInstalled?: boolean;
};
