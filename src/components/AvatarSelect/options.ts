export interface IAvatar {
  name: string;
  image: string;
  blink: string;
  backgroundColor: string;
}

const avatars = [
  { name: 'bakedpotato', color: '#FFD7C0' },
  { name: 'bear', color: '#FFCD96' },
  { name: 'beermug', color: '#77C6FF' },
  { name: 'blobby', color: '#FFE2A1' },
  { name: 'bluebird', color: '#e1f3fe' },
  { name: 'bluepup', color: '#e1f3fe' },
  { name: 'bluerobot', color: '#FFD8C1' },
  { name: 'burger', color: '#D7EBB7' },
  { name: 'cake', color: '#D7EBB7' },
  { name: 'cloud', color: '#ecf3ef' },
  { name: 'corgi', color: '#D7EBB7' },
  { name: 'croissant', color: '#FFEDAE' },
  { name: 'cup', color: '#fff5ea' },
  { name: 'donut', color: '#fff5ea' },
  { name: 'fox', color: '#fffae0' },
  { name: 'funky', color: '#FFE2A1' },
  { name: 'greenparrot', color: '#FFE2A1' },
  { name: 'icecream', color: '#FFE2A1' },
  { name: 'jackal', color: '#fbeee4' },
  { name: 'kitty', color: '#f9fae5' },
  { name: 'leaf', color: '#edf9e6' },
  { name: 'molly', color: '#FFE2A1' },
  { name: 'neko', color: '#EA4600' },
  { name: 'onigiri', color: '#FF835B' },
  { name: 'orangecat', color: '#FFE2A1' },
  { name: 'orc', color: '#eaecf5' },
  { name: 'panda', color: '#77C6FF' },
  { name: 'penguin', color: '#FFE2A1' },
  { name: 'pepperoni', color: '#D7EBB7' },
  { name: 'polly', color: '#FFE2A1' },
  { name: 'poop', color: '#ffd3d3' },
  { name: 'puppy', color: '#fef3e1' },
  { name: 'redpup', color: '#e8f8f6' },
  { name: 'redrobot', color: '#8BE0CC' },
  { name: 'rolly', color: '#FFE2A1' },
  { name: 'ruff', color: '#fbeee4' },
  { name: 'sally', color: '#FFE2A1' },
  { name: 'shaggydog', color: '#f7eae8' },
  { name: 'taco', color: '#FFECD6' },
  { name: 'tilly', color: '#FFE2A1' },
  { name: 'trex', color: '#FFDFB9' },
  { name: 'unicorn', color: '#9AAAFF' },
];

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

const options: IAvatar[] = initAvatars(avatars);

const randomAvatar = () => {
  return options[Math.floor(Math.random() * options.length)];
};

export { options, randomAvatar };
