import { AvatarMetadata } from '../constants/AvatarMetadata';
import seedRandom from 'seed-random';

export interface IAvatar {
  name: string;
  image: string;
  blink: string;
  backgroundColor: string;
}

const AVATAR_HOST = `https://s3.us-east-2.amazonaws.com/with.avatars`;

const initAvatars = (avatars: Array<any>): IAvatar[] => {
  return avatars.map(({ name, color }) => ({
    name,
    image: `${AVATAR_HOST}/${name}.png`,
    blink: `${AVATAR_HOST}/${name}_blink.png`,
    backgroundColor: color,
  }));
};

const options: IAvatar[] = initAvatars(AvatarMetadata);

const randomAvatar = (seed?: string) => {
  return options[Math.floor(seedRandom(seed)() * options.length)];
};

export { options, randomAvatar };
