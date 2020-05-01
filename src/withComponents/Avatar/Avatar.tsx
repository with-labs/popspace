import React from 'react';

import { options } from '../AvatarSelect/options';

interface IAvatarProps {
  name: string;
  onClick?: () => void;
}

export const Avatar: React.FC<IAvatarProps> = ({ name, onClick }) => {
  const avatar = options.find(opt => opt.name === name);

  if (avatar) {
    const avStyle = {
      backgroundImage: `url(${avatar.image})`,
      backgroundSize: 'cover',
    };
    return <div onClick={onClick} className="u-width100Percent u-height100Percent" style={avStyle}></div>;
  }

  return <div></div>;
};
