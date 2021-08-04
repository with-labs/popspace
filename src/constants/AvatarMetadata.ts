import seedRandom from 'seed-random';

export const avatarMetadata = {
  brandedPatterns: [
    { name: 'brand_pattern_01', color: '#FFF0DF' },
    { name: 'brand_pattern_02', color: '#FFF0DF' },
    { name: 'brand_pattern_03', color: '#FFF0DF' },
    { name: 'brand_pattern_04', color: '#FFF0DF' },
    { name: 'brand_pattern_05', color: '#FFF0DF' },
    { name: 'brand_pattern_06', color: '#FFF0DF' },
    { name: 'brand_pattern_07', color: '#FFF0DF' },
    { name: 'brand_pattern_08', color: '#FFF0DF' },
    { name: 'brand_pattern_09', color: '#FFF0DF' },
    { name: 'brand_pattern_10', color: '#FFF0DF' },
    { name: 'brand_pattern_11', color: '#FFF0DF' },
    { name: 'brand_pattern_12', color: '#FFF0DF' },
    { name: 'brand_pattern_13', color: '#FFF0DF' },
    { name: 'brand_pattern_14', color: '#FFF0DF' },
    { name: 'brand_pattern_15', color: '#FFF0DF' },
    { name: 'brand_pattern_16', color: '#FFF0DF' },
    { name: 'brand_pattern_17', color: '#FFF0DF' },
    { name: 'brand_pattern_18', color: '#FFF0DF' },
    { name: 'brand_pattern_19', color: '#FFF0DF' },
    { name: 'brand_pattern_20', color: '#FFF0DF' },
  ],
} as const;

export interface AvatarOption {
  name: string;
  image: string;
  blink: string;
  backgroundColor: string;
  category: string;
}

const AVATAR_HOST = `https://s3.us-east-2.amazonaws.com/with.avatars`;

export const avatarOptions = Object.entries(avatarMetadata).reduce((all, [sectionName, avatars]) => {
  for (const avatar of avatars) {
    all[avatar.name] = {
      name: avatar.name,
      image: `${AVATAR_HOST}/${avatar.name}.png`,
      blink: `${AVATAR_HOST}/${avatar.name}_blink.png`,
      backgroundColor: avatar.color,
      category: sectionName,
    };
  }
  return all;
}, {} as Record<string, AvatarOption>);

// Takes in the avatar section to select from
// and the user id and returns an avatar
export const getAvatarFromUserId = (sectionName: keyof typeof avatarMetadata, userId: string) => {
  const sectionAvatars = avatarMetadata[sectionName];
  if (!sectionAvatars) throw new Error(`Unknown avatar section name ${sectionName}`);
  const pos = seedRandom(userId)();
  const randomAvatar = sectionAvatars[Math.floor(pos * sectionAvatars.length)];
  return randomAvatar.name;
};
