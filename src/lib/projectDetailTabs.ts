export const PROJECT_DETAIL_TABS = [
  'overview',
  'changes',
  'approvals',
  'deployments',
  'domains',
  'environment',
  'agent-preview',
  'activity',
  'settings',
] as const;

export type ProjectDetailTab = (typeof PROJECT_DETAIL_TABS)[number];

export function isProjectDetailTab(value: unknown): value is ProjectDetailTab {
  return (
    typeof value === 'string' &&
    (PROJECT_DETAIL_TABS as readonly string[]).includes(value)
  );
}

/** 탭 → URL path segment. overview는 세그먼트 없이 /project/:id */
export function projectDetailTabPath(tab: ProjectDetailTab): string | undefined {
  return tab === 'overview' ? undefined : tab;
}
