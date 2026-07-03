import { logout } from '@/api/auth';
import { clearAppLocalStorage } from '@/lib/clearAppStorage';

/** POST /auth/logout 호출 후 로컬스토리지 전체 삭제 */
export async function logoutSession() {
  try {
    await logout();
  } finally {
    clearAppLocalStorage();
  }
}
