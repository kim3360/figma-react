import { fetchAndPersistUserInfo } from '@/api/user';

/** OAuth 로그인 완료 후 부모 창에서 사용자 정보를 조회·저장 */
export async function handleGitHubOAuthSuccess() {
  if (!localStorage.getItem('accessToken')) return;

  await fetchAndPersistUserInfo();
}
