export const HELP_QUICK_LINK_IDS = [
  'gettingStarted',
  'projects',
  'github',
  'account',
] as const;

export type HelpQuickLinkId = (typeof HELP_QUICK_LINK_IDS)[number];

export const HELP_FAQ_IDS = [
  'createProject',
  'githubPermission',
  'agentChat',
  'credits',
  'restoreTrash',
  'changeLanguage',
] as const;

export type HelpFaqId = (typeof HELP_FAQ_IDS)[number];
