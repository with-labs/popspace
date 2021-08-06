import seedRandom from 'seed-random';

export const avatarNames = [
  'brand_pattern_01',
  'brand_pattern_02',
  'brand_pattern_03',
  'brand_pattern_04',
  'brand_pattern_05',
  'brand_pattern_06',
  'brand_pattern_07',
  'brand_pattern_08',
  'brand_pattern_09',
  'brand_pattern_10',
  'brand_pattern_11',
  'brand_pattern_12',
  'brand_pattern_13',
  'brand_pattern_14',
  'brand_pattern_15',
  'brand_pattern_16',
  'brand_pattern_17',
  'brand_pattern_18',
  'brand_pattern_19',
  'brand_pattern_20',
  'avocado',
  'baked_potato',
  'black_cat',
  'blue_robot',
  'bunny',
  'ice_cream',
  'orange_cat',
  'red_robot',
  'retriever',
  'ruby',
  't_rex',
  'unicorn',
];

export interface AvatarOption {
  name: string;
  image: string;
  blink: string;
  backgroundColor: string;
  category: string;
}

// Takes in the avatar section to select from
// and the user id and returns an avatar
export const getAvatarFromUserId = (userId: string) => {
  const pos = seedRandom(userId)();
  // select from the brand_pattern avatars only
  const randomAvatar = avatarNames.slice(0, 20)[Math.floor(pos * 20)];
  return randomAvatar;
};
