import { z } from 'zod';

/**
 * GET /auth/github/url GitHub 로그인 URL 응답 data
 */
const githubUrlDataSchema = z.object({
  /** GitHub 인증 URL */
  url: z.string().prefault(''),
  /** OAuth state. 없으면 null */
  state: z.string().nullable().prefault(''),
});

const getGitHubAuthUrlResSchema = z.object({
  status: z.number().int(),
  code: z.string().prefault(''),
  message: z.string().prefault(''),
  data: githubUrlDataSchema.optional(),
});

const authTokenDataSchema = z.object({
  /** Access Token */
  accessToken: z.string().prefault(''),
  /** Refresh Token. 없으면 null */
  refreshToken: z.string().nullable().prefault(''),
  /** GitHub App 설치 여부 */
  githubAppInstalled: z.boolean().nullable().prefault(null),
});

const getGitHubCallbackResSchema = z.object({
  status: z.number().int(),
  code: z.string().prefault(''),
  message: z.string().prefault(''),
  data: authTokenDataSchema.optional(),
});

/**
 * POST /auth/refresh Access Token 재발급 요청
 */
const postAuthRefreshReqSchema = z.object({
  /** Refresh Token */
  refreshToken: z.string().min(1, 'Refresh Token을 입력해주세요.').prefault(''),
});

const postAuthRefreshResSchema = getGitHubCallbackResSchema;

type GitHubAuthUrlResult = z.infer<typeof githubUrlDataSchema>;
type GitHubCallbackResult = z.infer<typeof authTokenDataSchema>;
type GetGitHubAuthUrlResType = z.infer<typeof getGitHubAuthUrlResSchema>;
type GetGitHubCallbackResType = z.infer<typeof getGitHubCallbackResSchema>;
type PostAuthRefreshReqType = z.infer<typeof postAuthRefreshReqSchema>;
type PostAuthRefreshResType = z.infer<typeof postAuthRefreshResSchema>;

export {
  githubUrlDataSchema,
  getGitHubAuthUrlResSchema,
  authTokenDataSchema,
  getGitHubCallbackResSchema,
  postAuthRefreshReqSchema,
  postAuthRefreshResSchema,
  type GitHubAuthUrlResult,
  type GitHubCallbackResult,
  type GetGitHubAuthUrlResType,
  type GetGitHubCallbackResType,
  type PostAuthRefreshReqType,
  type PostAuthRefreshResType,
};
