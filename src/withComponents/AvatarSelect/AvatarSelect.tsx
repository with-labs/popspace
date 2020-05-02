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

  const headerControls = (
    <div onClick={handleClose} className={clsx(styles.leaveControl, 'u-cursorPointer')}>
      &lt; Pick an avatar
    </div>
  );

  return (
    <div className="u-height100Percent">
      <div className="u-sm-displayNone">{headerControls}</div>
      <div className="u-flex u-flexRow u-sm-flexCol">
        <div className="u-flex u-flexAlignItemsCenter u-flexJustifyCenter u-size1of2 u-sm-sizeFull">
          {selectedAvatar ? (
            <div className={styles.avatarPreview}>
              <Avatar name={selectedAvatar.name} />
            </div>
          ) : null}
        </div>
        <div className="u-md-displayNone u-lg-displayNone u-sm-flex">{headerControls}</div>
        <div className={clsx(styles.optionGrid, 'u-flex u-flexWrap u-flexJustifyCenter  u-size1of2 u-sm-sizeFull')}>
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
    </div>
  );
};
