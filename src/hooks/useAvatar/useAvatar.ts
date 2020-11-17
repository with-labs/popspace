import { options } from '../../utils/AvatarOptions';

export function useAvatar(avatarName: string) {
  return options.find((opt) => opt.name === avatarName);
}
