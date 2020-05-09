import React, { useState } from 'react';
import clsx from 'clsx';

import { FormInputV2 as FormInput } from '../FormInputV2/FormInputV2';
import './index.css';

import { useRoomMetaContext } from '../../withHooks/useRoomMetaContext/useRoomMetaContext';

import { options, BackgroundName } from './options';

export const BackgroundPicker: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { properties, setProperties } = useRoomMetaContext();
  const [customBg, setCustomBg] = useState('');

  const onCustomBackgoundHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProperties({
      bg: BackgroundName.Custom,
      customBG: customBg,
    });
  };

  const selectBackground = (bg: BackgroundName) => {
    setProperties({
      bg,
      customBG: '',
    });
    setCustomBg('');
  };

  return (
    <div className="BackgroundPicker u-flex u-flexAlignItemsCenter u-flexCol">
      <div className="u-flex u-flexJustifyBetween u-flexAlignItemsCenter u-width100Percent">
        <div onClick={onExit} className="u-cursorPointer BackgroundPicker-exit">
          &lt; Change Wallpaper
        </div>
        <div className="u-size1of2">
          <form className="BackgroundPicker-form" onSubmit={onCustomBackgoundHandler}>
            <FormInput
              placeholderText={'URL to an image (jpg, png, gif)'}
              value={customBg}
              onChangeHandler={setCustomBg}
              classNames={clsx('BackgroundPicker-customBgImg', {
                'is-selected': properties.bg === BackgroundName.Custom,
              })}
            />
          </form>
        </div>
      </div>
      <div className="BackgroundPicker-defaultContainer u-flex u-flexJustifyCenter">
        <div className="u-flex u-flexWrap">
          {options.map(opt => (
            <div
              key={opt.name}
              className="BackgroundPicker-defaultBg u-size1of4 u-sm-size1of2"
              onClick={() => selectBackground(opt.name)}
            >
              <img
                src={opt.image}
                alt={`background ${opt.name}`}
                className={clsx('BackgroundPicker-defaultBgImg u-width100Percent', {
                  'is-selected': properties.bg === opt.name,
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
