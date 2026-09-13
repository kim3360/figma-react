import { z } from 'zod';

/**
 * GET /users/me 현재 사용자 정보
 */
const userSchema = z.object({
  /** 사용자 ID */
  id: z.number().int(),
  /** GitHub 사용자명 */
  username: z.string().prefault(''),
  /** 프로필 이미지 URL */
  avatarUrl: z.string().nullable().prefault(''),
  /** GitHub App 설치 여부 */
  githubAppInstalled: z.boolean(),
  /** GitHub App User Token 연동 여부 */
  githubAppTokenLinked: z.boolean().nullable().prefault(null),
  /**
   * GitHub App User Token 만료 여부. 진단용이다.
   * 액세스 토큰 수명이 8시간이라 자주 true가 되지만, 서버가 GitHub을 호출하는 경로마다
   * 리프레시 토큰으로 자동 재발급하므로 이 값만으로 재인증을 요구하면 안 된다.
   */
  githubAppTokenExpired: z.boolean().nullable().prefault(null),
  /** 자동 재발급이 불가능해 사용자 재인증이 필요한지. 리프레시 토큰이 없거나 만료됐을 때만 true */
  githubAppReauthorizationRequired: z.boolean().nullable().prefault(null),
  /** GitHub App Access Token 만료 시각. 없으면 null */
  githubAppAccessTokenExpiresAt: z.string().nullable().prefault(''),
  /** GitHub App Refresh Token 만료 시각. 없으면 null */
  githubAppRefreshTokenExpiresAt: z.string().nullable().prefault(''),
});

/**
 * GET /users/me 응답
 */
const getUserMeResSchema = z.object({
  status: z.number().int(),
  code: z.string().prefault(''),
  message: z.string().prefault(''),
  data: userSchema.optional(),
});

type User = z.infer<typeof userSchema>;
type GetUserMeResType = z.infer<typeof getUserMeResSchema>;

export { userSchema, getUserMeResSchema, type User, type GetUserMeResType };
