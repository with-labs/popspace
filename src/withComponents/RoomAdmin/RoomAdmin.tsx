import React, { useState, MouseEvent, useRef } from 'react';
import clsx from 'clsx';
import Modal from 'react-modal';

import style from './roomAdmin.module.css';
import { BackgroundPicker } from '../BackgroundPicker';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

import { useRoomMetaContext } from '../../withHooks/useRoomMetaContext/useRoomMetaContext';
import { useRoomMetaContextBackground } from '../../withHooks/useRoomMetaContextBackground/useRoomMetaContextBackground';

type RoomAdminProps = {
  onClickChangeWallpaper: () => void;
};

const RoomAdmin = ({ onClickChangeWallpaper }: RoomAdminProps) => {
  const { properties } = useRoomMetaContext();
  const image: string = useRoomMetaContextBackground(properties);
  const { room } = useVideoContext();

  const copyInput = useRef<HTMLInputElement>(null);
  const [isBgPickerOpen, setIsBgPickerOpen] = useState(false);

  function onClickCopyLink(e: MouseEvent) {
    e.preventDefault();
    if (copyInput.current) {
      copyInput.current.select();
      document.execCommand('copy');
    }
  }

  const onBgOpen = () => {
    setIsBgPickerOpen(true);
    onClickChangeWallpaper && onClickChangeWallpaper();
  };

  return (
    <section className={style.root} style={{ backgroundImage: image }}>
      <h2 className={style.title}>{room && room.name ? room.name : ''}</h2>
      <button className={clsx(style.button, style['button--wallpaper'])} onClick={onBgOpen}>
        Change wallpaper
      </button>
      <button className={clsx(style.button, style['button--copyLink'])} onClick={onClickCopyLink}>
        Copy link to clipboard
      </button>
      <Modal
        isOpen={isBgPickerOpen}
        onRequestClose={() => setIsBgPickerOpen(false)}
        className={clsx(style.bgPicker, 'u-sm-sizeFull')}
        closeTimeoutMS={200}
      >
        <BackgroundPicker onExit={() => setIsBgPickerOpen(false)} />
      </Modal>
      <input ref={copyInput} type="text" value={document.location.href} readOnly className={style.copyInput} />
    </section>
  );
};

export { RoomAdmin };
