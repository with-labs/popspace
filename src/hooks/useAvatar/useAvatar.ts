import { options } from '../../utils/AvatarOptions';

export function useAvatar(avatarName: string) {
  for (const category in options) {
    const avatar = options[category].find((opt) => opt.name === avatarName);
    if (!!avatar) {
      return avatar;
    }
  }
}
