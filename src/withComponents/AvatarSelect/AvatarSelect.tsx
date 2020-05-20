import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

import { IAvatar, options } from './options';

import { ReactComponent as BackGlyph } from '../../images/glyphs/back.svg';

import { Avatar } from '../Avatar/Avatar';

import styles from './avatarSelect.module.css';

interface IAvatarSelectProps {
  defaultAvatar?: IAvatar;
  onAvatarChange: (avatar: IAvatar) => void;
  handleClose?: () => void;
}

export const AvatarSelect: React.FC<IAvatarSelectProps> = ({
  defaultAvatar = options[0],
  onAvatarChange,
  handleClose,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar);

  useEffect(() => {
    selectedAvatar && onAvatarChange(selectedAvatar);
  }, [selectedAvatar]);

  const headerControls = (
    <div onClick={handleClose} className={clsx(styles.leaveControl, 'u-cursorPointer u-flex u-flexAlignItemsCenter')}>
      <BackGlyph /> Pick an avatar
    </div>
  );

  return (
    <div className="u-height100Percent">
      <div className="u-sm-displayNone">{headerControls}</div>
      <div className="u-flex u-flexRow u-sm-flexCol">
        <div className="u-flex u-flexAlignItemsCenter u-flexJustifyCenter u-size1of2 u-sm-sizeFull">
          {selectedAvatar ? (
            <div
              className={clsx(styles.avatarPreview, 'u-round')}
              style={{ backgroundColor: selectedAvatar.backgroundColor }}
            >
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
                className={clsx(styles.option, 'u-cursorPointer u-round', {
                  [styles['option--selected']]: av.name === selectedAvatar.name,
                })}
                onClick={() => setSelectedAvatar(av)}
                style={{ backgroundColor: av.backgroundColor }}
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
