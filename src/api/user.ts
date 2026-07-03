import { useQuery } from '@tanstack/react-query';
import { clearStoredUser, readStoredUser, writeStoredUser } from '@/lib/userStorage';
import { dummyGetUserInfo } from '@/mocks/fixtures/dummyData';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

async function getUserInfo() {
  return dummyGetUserInfo();
}

async function fetchAndPersistUserInfo() {
  const response = await getUserInfo();
  if (response.data) {
    writeStoredUser(response.data);
  }
  return response;
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

export { getUserInfo, fetchAndPersistUserInfo, useUserInfoQuery, clearStoredUser, readStoredUser };
