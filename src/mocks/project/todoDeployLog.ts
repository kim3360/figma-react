import type { GithubActionsLogPayload } from '@/types/githubActionsLog.type';
import todoDeployLogPayloadJson from '@/mocks/project/todoDeployLog.payload.json';

/** dldnsgkr/my-todo-app Actions run 26774725583 — Dvely Deploy to GitHub Pages */
export const todoDeployLogPayload = todoDeployLogPayloadJson as GithubActionsLogPayload;

export const todoDeployJob = todoDeployLogPayload.jobs[0];
