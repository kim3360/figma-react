import { z } from 'zod';

/**
 * GET /users/me 현재 사용자 정보
 */
const userSchema = z.object({
  /** 사용자 ID */
  id: z.number().int(),
  /** GitHub 사용자명 */
  username: z.string().min(1, '사용자명이 없습니다.').prefault(''),
  /** 프로필 이미지 URL */
  avatarUrl: z.string().nullable().prefault(''),
  /** GitHub App 설치 여부 */
  githubAppInstalled: z.boolean(),
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
