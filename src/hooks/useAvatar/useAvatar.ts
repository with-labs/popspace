import { options } from '@utils/AvatarOptions';

export function useAvatar(avatarName: string) {
  return options[avatarName] ?? null;
}
