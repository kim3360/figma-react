export type GithubActionsLogLine = {
  timestamp: string;
  message: string;
};

export type GithubActionsLogStep = {
  name: string;
  result: string;
  startedAt: string;
  completedAt: string;
  lines: GithubActionsLogLine[];
};

export type GithubActionsLogJob = {
  name: string;
  result: string;
  steps: GithubActionsLogStep[];
};

export type GithubActionsLogPayload = {
  meta: {
    generatedAt: string;
    runId: string;
    workflow: string;
    repository: string;
    branch: string;
    trigger: string;
    status: string;
    startedAt: string;
    duration: string;
  };
  jobs: GithubActionsLogJob[];
};
