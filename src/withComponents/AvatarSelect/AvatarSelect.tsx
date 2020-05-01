import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

import { options } from './options';

import styles from './avatarSelect.module.css';

interface IAvatarSelectProps {
  defaultAvatar?: string;
  onAvatarChange: (src: string) => void;
  handleClose?: () => void;
}

export const AvatarSelect: React.FC<IAvatarSelectProps> = ({
  defaultAvatar = options[0].name,
  onAvatarChange,
  handleClose,
}) => {
  const [selectedAvatarName, setSelectedAvatarName] = useState(defaultAvatar);

  useEffect(() => {
    selectedAvatarName && onAvatarChange(selectedAvatarName);
  }, [selectedAvatarName]);

  const selectedAvatar = options.find(opt => opt.name === selectedAvatarName);

  return (
    <div className={clsx(styles.AvatarSelect, 'u-flex u-width100Percent u-flexAlignCenter u-flexJustifyBetween')}>
      <div className="u-flex u-flexAlignCenter u-flexJustifyCenter u-height100Percent">
        {selectedAvatar ? <img src={selectedAvatar.image} className={styles.avatarPreview} /> : null}
      </div>
      <div onClick={handleClose} className={clsx(styles.leaveControl, 'u-width100Percent')}>
        &lt; Pick an avatar
      </div>
      <div className={clsx(styles.optionGrid, 'u-flex u-flexWrap u-flexJustifyCenter')}>
        {options.map((av, idx) => {
          return (
            <div
              key={idx}
              style={{ backgroundImage: `url(${av.image})` }}
              className={clsx(styles.option, { [styles['option--selected']]: av.name === selectedAvatarName })}
              onClick={() => setSelectedAvatarName(av.name)}
            ></div>
          );
        })}
      </div>
    </div>
  );
};
