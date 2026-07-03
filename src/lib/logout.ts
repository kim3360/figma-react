import { clearAppLocalStorage } from '@/lib/clearAppStorage';

/** 로컬 스토리지를 비우고 홈으로 이동할 때 사용 */
export async function logoutSession() {
  clearAppLocalStorage();
}
