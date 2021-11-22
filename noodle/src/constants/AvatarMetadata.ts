import seedRandom from 'seed-random';

const brandedAvatars = [
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
];

export const avatarNames = [
  'abstract_frog',
  'abstract_lion',
  'abstract_pig',
  'abstract_rabbit',
  'avocado',
  'baked_potato',
  'baseball',
  'basketball',
  'bear',
  'black_cat',
  'blue_robot',
  'bunny',
  'burger',
  'cake',
  'comet',
  'croissant',
  'donut',
  'earth',
  'felix',
  'football',
  'ice_cream',
  'leaf',
  'moon',
  'orange_cat',
  'parrot',
  'pepperoni',
  'pineapple',
  'red_robot',
  'retriever',
  'ruby',
  'soccerball',
  'sun',
  't_rex',
  'taco',
  'tennisball',
  'unicorn',
  ...brandedAvatars,
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
  const randomAvatar = brandedAvatars[Math.floor(pos * 20)];
  return randomAvatar;
};
