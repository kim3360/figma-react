/**
 * GitHub Actions run 26774725583 로그 → todoDeployLog.payload.json
 * GITHUB_TOKEN 있으면 API에서 전체 로그 다운로드, 없으면 scripts/log-steps/*.txt 사용
 *
 * 실행: node scripts/generate-todo-deploy-log.mjs
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RUN_ID = '26774725583';
const JOB_ID = '78923198985';
const REPO = 'dldnsgkr/my-todo-app';
const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(ROOT, '../src/mocks/project/todoDeployLog.payload.json');
const LOG_STEPS_DIR = join(ROOT, 'log-steps');

function parseGithubLogText(raw) {
  const lines = [];
  for (const row of raw.split('\n')) {
    const match = row.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\s+(.*)$/);
    if (match) {
      lines.push({ timestamp: match[1], message: match[2] });
    } else if (row.trim()) {
      lines.push({ timestamp: '', message: row });
    }
  }
  return lines;
}

function interpolateLines(step, messages) {
  const startMs = new Date(step.started_at).getTime();
  const endMs = new Date(step.completed_at).getTime();
  const span = Math.max(endMs - startMs, 1);
  const count = Math.max(messages.length, 1);

  return messages.map((message, index) => ({
    timestamp: new Date(startMs + (span * index) / Math.max(count - 1, 1)).toISOString(),
    message,
  }));
}

function loadLinesFromStepFiles(apiSteps) {
  const files = readdirSync(LOG_STEPS_DIR)
    .filter((name) => name.endsWith('.txt'))
    .sort();

  const bySlug = new Map();
  for (const file of files) {
    const slug = file.replace(/\.txt$/, '');
    const raw = readFileSync(join(LOG_STEPS_DIR, file), 'utf8');
    const messages = raw.split('\n').filter((line) => line.length > 0);
    bySlug.set(slug, messages);
  }

  return apiSteps.map((step) => {
    const slug = step.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const messages = bySlug.get(slug) ?? [];
    const lines =
      messages.length > 0
        ? interpolateLines(step, messages)
        : [{ timestamp: step.started_at, message: `${step.name} completed` }];

    return {
      name: step.name,
      result: step.conclusion ?? 'success',
      startedAt: step.started_at,
      completedAt: step.completed_at,
      lines,
    };
  });
}

async function fetchRunMeta() {
  const [runRes, jobsRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${REPO}/actions/runs/${RUN_ID}`, {
      headers: { Accept: 'application/vnd.github+json' },
    }),
    fetch(`https://api.github.com/repos/${REPO}/actions/runs/${RUN_ID}/jobs`, {
      headers: { Accept: 'application/vnd.github+json' },
    }),
  ]);

  if (!runRes.ok || !jobsRes.ok) {
    throw new Error('Failed to fetch GitHub Actions metadata');
  }

  const run = await runRes.json();
  const jobs = await jobsRes.json();
  const deployJob = jobs.jobs.find((job) => job.name === 'deploy') ?? jobs.jobs[0];

  const startedAt = run.run_started_at ?? run.created_at;
  const updatedAt = run.updated_at;
  const durationSec = Math.round(
    (new Date(updatedAt).getTime() - new Date(startedAt).getTime()) / 1000,
  );

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      runId: String(run.id),
      workflow: run.name ?? 'Dvely Deploy to GitHub Pages',
      repository: REPO,
      branch: run.head_branch ?? 'main',
      trigger: run.event ?? 'workflow_dispatch',
      status: run.conclusion ?? 'success',
      startedAt,
      duration: `${durationSec}s`,
    },
    apiSteps: deployJob.steps ?? [],
  };
}

async function fetchLogsFromApi(token) {
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/actions/jobs/${JOB_ID}/logs`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
      redirect: 'follow',
    },
  );

  if (!response.ok) {
    throw new Error(`Log download failed: ${response.status}`);
  }

  return parseGithubLogText(await response.text());
}

function groupLogLinesByStep(apiSteps, logLines) {
  const steps = [];
  let lineIndex = 0;

  for (const apiStep of apiSteps) {
    const bucket = [];
    while (lineIndex < logLines.length) {
      const line = logLines[lineIndex];
      bucket.push(line);
      lineIndex += 1;
      if (line.message.startsWith('##[group]') && line.message.includes(apiStep.name)) {
        break;
      }
    }

    steps.push({
      name: apiStep.name,
      result: apiStep.conclusion ?? 'success',
      startedAt: apiStep.started_at,
      completedAt: apiStep.completed_at,
      lines: bucket.length > 0 ? bucket : interpolateLines(apiStep, [`${apiStep.name}`]),
    });
  }

  return steps;
}

async function main() {
  const { meta, apiSteps } = await fetchRunMeta();
  const token = process.env.GITHUB_TOKEN;

  let steps;
  if (token) {
    const logLines = await fetchLogsFromApi(token);
    steps = groupLogLinesByStep(apiSteps, logLines);
  } else {
    steps = loadLinesFromStepFiles(apiSteps);
  }

  const payload = {
    meta,
    jobs: [{ name: 'deploy', result: meta.status, steps }],
  };

  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${steps.length} steps → ${OUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
