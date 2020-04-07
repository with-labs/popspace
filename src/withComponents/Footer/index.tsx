import React, { useState } from 'react';
import clsx from 'clsx';
import DropDownMenu from '../DropDownMenu';
import './index.css';

import addImg from './images/emoji_ADD.svg';
import cancelImg from './images/emoji_OUT.svg';

import PostLink from '../PostLink';

import useRoomState from '../../hooks/useRoomState/useRoomState';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';

type FooterProps = {
  classNames?: string;
};

const Footer = ({ classNames }: FooterProps) => {
  const roomState = useRoomState();
  const { addWidget } = useWidgetContext();

  const [isAddAppOpen, setIsAddAppOpen] = useState(false);

  const onUrlSubmitHandler = (url: string) => {
    addWidget(url);
    setIsAddAppOpen(false);
  };

  return (
    <footer className={clsx('Footer', classNames)}>
      {roomState === 'disconnected' ? null : (
        <DropDownMenu
          buttonSrc={!isAddAppOpen ? addImg : cancelImg}
          buttonAltText={isAddAppOpen ? 'addImg' : 'cancelImg'}
          onButtonClickHandler={() => {
            setIsAddAppOpen(!isAddAppOpen);
          }}
          classNames="Footer-btn"
          isOpenDirectionDown={false}
          isActive={isAddAppOpen}
        >
          <PostLink onSubmitHandler={onUrlSubmitHandler} />
        </DropDownMenu>
      )}
    </footer>
  );
};

export default Footer;
