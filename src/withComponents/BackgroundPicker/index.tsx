import React, { useState } from 'react';
import FormInput from '../FormInput';
import './index.css';

import bgThumb1 from '../../images/wallpaper1_thumb.jpg';
import bgThumb2 from '../../images/wallpaper2_thumb.jpg';
import bgThumb3 from '../../images/wallpaper3_thumb.jpg';

enum Background {
  BG_1,
  BG_2,
  BG_3,
  BG_CUSTOM,
}

const BackgroundPicker = () => {
  const [customBg, setCustomBg] = useState('');

  const onCustomBackgoundHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const onDefaultBgPressed = (BG: Background) => {};

  return (
    <div className="BackgroundPicker">
      <div className="BackgroundPicker-title">Background</div>
      <div className="BackgroundPicker-defaultContainer">
        <div className="BackgroundPicker-defaultBg" onClick={() => onDefaultBgPressed(Background.BG_1)}>
          <img src={bgThumb1} alt="background 1" className="BackgroundPicker-defaultBgImg" />
        </div>
        <div className="BackgroundPicker-defaultBg" onClick={() => onDefaultBgPressed(Background.BG_2)}>
          <img src={bgThumb2} alt="background 2" className="BackgroundPicker-defaultBgImg" />
        </div>
        <div className="BackgroundPicker-defaultBg" onClick={() => onDefaultBgPressed(Background.BG_3)}>
          <img src={bgThumb3} alt="background 3" className="BackgroundPicker-defaultBgImg" />
        </div>
      </div>
      <form className="BackgroundPicker-form" onSubmit={onCustomBackgoundHandler}>
        <FormInput placeholderText={'URL to an image (jpg, png, gif)'} value={customBg} setValue={setCustomBg} />
      </form>
    </div>
  );
};

export default BackgroundPicker;
