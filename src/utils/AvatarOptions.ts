import { AvatarMetadata, AvatarMetadataType } from '../constants/AvatarMetadata';
import seedRandom from 'seed-random';

export interface IAvatar {
  name: string;
  image: string;
  blink: string;
  backgroundColor: string;
}

const AVATAR_HOST = `https://s3.us-east-2.amazonaws.com/with.avatars`;

const initAvatars = (avatarList: { [key: string]: AvatarMetadataType[] }) => {
  const options: { [key: string]: IAvatar[] } = {};

  for (const avatarCategory in avatarList) {
    const rawMetaData = avatarList[avatarCategory];
    const avatars = [];
    for (const avatar of rawMetaData) {
      avatars.push({
        name: avatar.name,
        image: `${AVATAR_HOST}/${avatar.name}.png`,
        blink: `${AVATAR_HOST}/${avatar.name}_blink.png`,
        backgroundColor: avatar.color,
      });
    }
    options[avatarCategory] = avatars;
  }
  return options;
};

const options: { [key: string]: IAvatar[] } = initAvatars(AvatarMetadata);

const randomAvatar = (seed?: string) => {
  // get the sections
  const categories = Object.keys(options);
  // randomly select a section
  const randomCategory = categories[Math.floor(seedRandom(seed)() * categories.length)];
  // return a random avatar from that section
  return options[randomCategory][Math.floor(seedRandom(seed)() * options[randomCategory].length)];
};

export { options, randomAvatar };
