import { apiErrorBodySchema } from '@/types/response.type';
import {
  githubRepositoryNameSchema,
  githubRepositorySchema,
  type GithubRepository,
  type PostProjectRepositoryResType,
} from '@/types/projects.type';

const ALREADY_CONNECTED_REPOSITORY_PATTERN = /^이미 GitHub 저장소가 연결된 프로젝트입니다:\s*(.+)$/;

function toSuggestedGithubRepositoryName(value: string) {
  const suggested = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[._-]+|[._-]+$/g, '')
    .slice(0, 100);
  const parsed = githubRepositoryNameSchema.safeParse({ repositoryName: suggested });
  return parsed.success ? parsed.data.repositoryName : '';
}

function parseRepositoryApiErrorMessage(error: unknown) {
  const fallback = '저장소 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  if (!(error instanceof Error)) return fallback;

  try {
    const parsed = apiErrorBodySchema.safeParse(JSON.parse(error.message));
    if (parsed.success) return parsed.data.message;
  } catch {
    // 백엔드가 JSON이 아닌 문자열을 준 경우 그대로 사용한다.
  }

  return error.message.trim() || fallback;
}

function parseAlreadyConnectedRepository(error: unknown) {
  const message = parseRepositoryApiErrorMessage(error);
  const match = message.match(ALREADY_CONNECTED_REPOSITORY_PATTERN);
  const repositoryFullName = match?.[1]?.trim();
  if (!repositoryFullName) return null;

  const parsed = githubRepositorySchema.pick({ fullName: true }).safeParse({
    fullName: repositoryFullName,
  });
  return parsed.success ? parsed.data.fullName : null;
}

function toGithubRepositoryFromBinding(result: PostProjectRepositoryResType): GithubRepository {
  const [owner, name] = result.repositoryFullName.split('/');

  return githubRepositorySchema.parse({
    fullName: result.repositoryFullName,
    name: name ?? '',
    owner: owner ?? '',
    description: null,
    visibility: result.repositoryVisibility,
    defaultBranch: 'main',
    updatedAt: new Date().toISOString(),
  });
}

export {
  parseAlreadyConnectedRepository,
  parseRepositoryApiErrorMessage,
  toGithubRepositoryFromBinding,
  toSuggestedGithubRepositoryName,
};
