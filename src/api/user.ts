import Http from '@/utils/httpClients';
import { errorResponse, succesResponse } from '@/utils/response';
import { getUserMeResSchema, userSchema, type GetUserMeResType } from '@/types/user.type';
import { clearStoredUser, readStoredUser, writeStoredUser } from '@/lib/userStorage';
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
  }
  return response;
}

function useUserInfoQuery(queryKey: unknown) {
  if (!queryKey) throw new Error('queryKey is required');

  const hasAccessToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  return useQuery({
    queryKey: ['user-info', queryKey],
    queryFn: fetchAndPersistUserInfo,
    enabled: hasAccessToken,
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

export { getUserInfo, fetchAndPersistUserInfo, useUserInfoQuery, clearStoredUser, readStoredUser };
