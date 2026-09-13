import Http from '@/utils/httpClients';
import { errorResponse, succesResponse } from '@/utils/response';
import { getUserMeResSchema, userSchema, type GetUserMeResType } from '@/types/user.type';
import { clearStoredUser, readStoredUser, writeStoredUser } from '@/lib/userStorage';
import { dispatchGitHubAppReauthorizationRequired } from '@/constants/authEvents';
import { useQuery } from '@tanstack/react-query';

const endpoint = '/users';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

function parseUserMeResponse(raw: unknown): GetUserMeResType {
  const wrapped = getUserMeResSchema.safeParse(raw);
  if (wrapped.success) return wrapped.data;

  const userOnly = userSchema.safeParse(raw);
  if (userOnly.success) {
    return {
      status: 200,
      code: '',
      message: '',
      data: userOnly.data,
    };
  }

  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = userSchema.safeParse((raw as { data: unknown }).data);
    if (inner.success) {
      return {
        status: 200,
        code: '',
        message: '',
        data: inner.data,
      };
    }
  }

  return getUserMeResSchema.parse(raw);
}

/** GET /users/me — 현재 사용자 정보 조회 */
async function getUserInfo() {
  return Http.instance
    .get<GetUserMeResType>(`${endpoint}/me`)
    .then((response) => {
      const data = succesResponse<GetUserMeResType>(response);
      return parseUserMeResponse(data);
    })
    .catch(errorResponse());
}

/** GET /users/me 호출 후 로컬스토리지에 사용자 정보 저장 */
async function fetchAndPersistUserInfo() {
  const response = await getUserInfo();
  if (response.data) {
    writeStoredUser(response.data);
    // 서버가 재인증이 필요하다고 하면 어디서 읽었든 화면에 진입점이 뜨게 한다.
    // 이 값이 true 인데 버튼이 없으면 사용자는 서버 오류 문구만 보고 막힌다
    if (response.data.githubAppReauthorizationRequired) {
      dispatchGitHubAppReauthorizationRequired();
    }
  }
  return response;
}

/**
 * 사용자 정보를 배경에서 다시 읽는다. 실패는 삼킨다.
 *
 * 호출부는 전부 "겸사겸사 갱신"이다 — 재인증 진입점을 띄우거나 만료 플래그를 씻어내는
 * 용도라, 실패했다고 진행 중인 화면을 막을 이유가 없다. 그런데 `void fetch...()` 로
 * 두면 토큰이 만료됐을 때 잡히지 않은 rejection 이 콘솔에 쌓인다. 실제 오류를 찾을 때
 * 그 잡음이 눈을 가린다.
 */
function refreshUserInfoInBackground() {
  return fetchAndPersistUserInfo().catch((error: unknown) => {
    if (import.meta.env.DEV) {
      console.debug('[user] 사용자 정보 배경 갱신 실패 — 무시합니다', error);
    }
    return null;
  });
}

function useUserInfoQuery(queryKey: unknown) {
  if (!queryKey) throw new Error('queryKey is required');

  return useQuery({
    queryKey: ['user-info', queryKey],
    queryFn: fetchAndPersistUserInfo,
    enabled: true,
    placeholderData: () => {
      const user = readStoredUser();
      if (!user) return undefined;
      return {
        status: 200,
        code: '',
        message: '',
        data: user,
      };
    },
    ...defaultQueryOptions,
  });
}

export {
  getUserInfo,
  fetchAndPersistUserInfo,
  refreshUserInfoInBackground,
  useUserInfoQuery,
  clearStoredUser,
  readStoredUser,
};
