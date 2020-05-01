import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

import { options } from './options';

import styles from './avatarSelect.module.css';

import { Avatar } from '../Avatar/Avatar';

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
        {selectedAvatar ? (
          <div className={styles.avatarPreview}>
            <Avatar name={selectedAvatar.name} />
          </div>
        ) : null}
      </div>
      <div onClick={handleClose} className={clsx(styles.leaveControl, 'u-width100Percent u-cursorPointer')}>
        &lt; Pick an avatar
      </div>
      <div className={clsx(styles.optionGrid, 'u-flex u-flexWrap u-flexJustifyCenter')}>
        {options.map((av, idx) => {
          return (
            <div
              key={idx}
              className={clsx(styles.option, 'u-cursorPointer', {
                [styles['option--selected']]: av.name === selectedAvatarName,
              })}
              onClick={() => setSelectedAvatarName(av.name)}
            >
              <Avatar name={av.name} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
