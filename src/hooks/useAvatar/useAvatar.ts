import { options } from '../../components/AvatarSelect/options';

export function useAvatar(avatarName: string) {
  return options.find((opt) => opt.name === avatarName);
}
