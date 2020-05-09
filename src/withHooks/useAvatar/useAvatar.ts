import { options } from '../../withComponents/AvatarSelect/options';

export function useAvatar(avatarName: string) {
  return options.find(opt => opt.name === avatarName);
}
