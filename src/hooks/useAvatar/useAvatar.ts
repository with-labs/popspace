import { avatarOptions } from '@constants/AvatarMetadata';

export function useAvatar(avatarName: string) {
  return avatarOptions[avatarName] ?? null;
}
