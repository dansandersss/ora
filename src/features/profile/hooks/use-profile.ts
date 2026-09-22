import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authQueryKeys } from '@/features/auth/session/auth-session';
import type { AuthUser } from '@/features/auth/types';
import type { AvatarUpload, ChangePinInput, OraProfile, ProfileUpdateInput } from '@/features/profile/types';
import { changeProfilePin, getProfile, getProfileStatistics, removeProfileAvatar, updateProfile, uploadProfileAvatar } from '@/lib/backend';

export const profileQueryKeys = {
  all: ['profile'] as const,
  detail: ['profile', 'detail'] as const,
  statistics: ['profile', 'statistics'] as const,
};

function syncIdentity(queryClient: ReturnType<typeof useQueryClient>, profile: OraProfile) {
  queryClient.setQueryData<AuthUser | undefined>(authQueryKeys.currentUser, (current) => current ? {
    ...current,
    avatarUrl: profile.avatarUrl,
    name: profile.fullName ?? current.name,
    phone: profile.phone,
  } : current);
}

export function useProfile() {
  return useQuery({ queryFn: getProfile, queryKey: profileQueryKeys.detail, refetchOnMount: 'always', retry: false, staleTime: 0 });
}

export function useProfileStatistics() {
  return useQuery({ queryFn: getProfileStatistics, queryKey: profileQueryKeys.statistics, retry: false });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: ProfileUpdateInput) => updateProfile(input), onSuccess: (profile) => { queryClient.setQueryData(profileQueryKeys.detail, profile); syncIdentity(queryClient, profile); queryClient.invalidateQueries({ queryKey: profileQueryKeys.all }).catch(() => undefined); } });
}

export function useChangeProfilePin() {
  return useMutation({ mutationFn: (input: ChangePinInput) => changeProfilePin(input) });
}

export function useUploadProfileAvatar() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (upload: AvatarUpload) => uploadProfileAvatar(upload), onSuccess: (profile) => { queryClient.setQueryData(profileQueryKeys.detail, profile); syncIdentity(queryClient, profile); queryClient.invalidateQueries({ queryKey: profileQueryKeys.all }).catch(() => undefined); } });
}

export function useRemoveProfileAvatar() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: removeProfileAvatar, onSuccess: (profile) => { queryClient.setQueryData(profileQueryKeys.detail, profile); syncIdentity(queryClient, profile); queryClient.invalidateQueries({ queryKey: profileQueryKeys.all }).catch(() => undefined); } });
}
