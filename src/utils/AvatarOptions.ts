import { AvatarMetadata } from '../constants/AvatarMetadata';
export interface IAvatar {
  name: string;
  image: string;
  blink: string;
  backgroundColor: string;
}

const initAvatars = (avatars: Array<any>) => {
  const options: IAvatar[] = [];
  const addAvatar = (name: any, color: any) => {
    options.push({
      name: name,
      image: `https://s3.us-east-2.amazonaws.com/with.avatars/${name}.png`,
      blink: `https://s3.us-east-2.amazonaws.com/with.avatars/${name}_blink.png`,
      backgroundColor: color,
    });
  };
  for (const avatar of avatars) {
    addAvatar(avatar.name, avatar.color);
  }
  return options;
};

const options: IAvatar[] = initAvatars(AvatarMetadata);

const randomAvatar = () => {
  return options[Math.floor(Math.random() * options.length)];
};

export { options, randomAvatar };
