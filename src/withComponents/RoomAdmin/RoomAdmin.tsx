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
  const { properties, setProperty } = useRoomMetaContext();
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

  function setSpatialAudio(mode: string) {
    if (properties.spatialAudio !== mode) {
      setProperty('spatialAudio', mode);
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
      <div className={clsx('u-marginTop8', style.spatialToggles)}>
        <button
          className={clsx(style.spatialToggle, { [style['is-selected']]: properties.spatialAudio === 'on' })}
          onClick={() => setSpatialAudio('on')}
        >
          <div className={clsx('u-round', style.nightsky12)}></div>
          <div className={clsx('u-round', style.turquise18)}></div>
          <div className={clsx('u-round', style.mandarin8)}></div>
          <div className={clsx('u-round', style.cherry6)}></div>
          <div className={clsx('u-fontB2', style['spatialToggle-title'])}>Spatial audio</div>
        </button>
        <button
          className={clsx(style.spatialToggle, { [style['is-selected']]: properties.spatialAudio === 'off' })}
          onClick={() => setSpatialAudio('off')}
        >
          <div className={clsx('u-round', style.nightsky12)}></div>
          <div className={clsx('u-round', style.turquise12)}></div>
          <div className={clsx('u-round', style.mandarin12)}></div>
          <div className={clsx('u-round', style.cherry12)}></div>
          <div className={clsx('u-fontB2', style['spatialToggle-title'])}>Global audio</div>
        </button>
      </div>
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
