import React, { useCallback, useState } from 'react';
import clsx from 'clsx';
import { ReactComponent as BackGlyph } from '../../images/glyphs/back.svg';
import { TextField } from '@material-ui/core';
import './index.css';
import { options, BackgroundName } from './options';
import { useCoordinatedDispatch } from '../../features/room/CoordinatedDispatchProvider';
import { actions, selectors } from '../../features/room/roomSlice';
import { useSelector } from 'react-redux';

export const BackgroundPicker: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [customBg, setCustomBg] = useState('');

  const backgroundState = useSelector(selectors.selectBackground);

  const coordinatedDispatch = useCoordinatedDispatch();
  const setBackground = useCallback(
    (state: { backgroundName: BackgroundName; customBackgroundUrl?: string }) => {
      coordinatedDispatch(actions.updateRoomBackground(state));
    },
    [coordinatedDispatch]
  );

  const onCustomBackgoundHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBackground({
      backgroundName: BackgroundName.Custom,
      customBackgroundUrl: customBg,
    });
  };

  const selectBackground = (bg: BackgroundName) => {
    setBackground({
      backgroundName: bg,
    });
    setCustomBg('');
  };

  return (
    <div className="BackgroundPicker u-flex u-flexAlignItemsCenter u-flexCol">
      <div className="u-flex u-flexJustifyBetween u-flexAlignItemsCenter u-width100Percent">
        <div onClick={onExit} className="u-cursorPointer BackgroundPicker-exit u-flex u-flexAlignItemsCenter">
          <BackGlyph /> Change Wallpaper
        </div>
        <div className="u-size1of2">
          <form className="BackgroundPicker-form" onSubmit={onCustomBackgoundHandler}>
            <TextField
              id="bgPicker"
              placeholder={'URL to an image (jpg, png, gif)'}
              value={customBg}
              onChange={(event) => setCustomBg(event.target.value)}
              className={clsx('BackgroundPicker-customBgImg', {
                'is-selected': backgroundState.backgroundName === BackgroundName.Custom,
              })}
            />
          </form>
        </div>
      </div>
      <div className="BackgroundPicker-defaultContainer u-flex u-flexJustifyCenter">
        <div className="u-flex u-flexWrap">
          {options.map((opt) => (
            <div
              key={opt.name}
              className="BackgroundPicker-defaultBg u-size1of4 u-sm-size1of2"
              onClick={() => selectBackground(opt.name)}
            >
              <img
                src={opt.image}
                alt={`background ${opt.name}`}
                className={clsx('BackgroundPicker-defaultBgImg u-width100Percent', {
                  'is-selected': backgroundState.backgroundName === opt.name,
                })}
              />
            </div>
          ))}
        </div>
      </div>
      <div></div>
    </div>
  );
};
