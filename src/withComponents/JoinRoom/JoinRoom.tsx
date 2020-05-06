import React, { useState } from 'react';
import clsx from 'clsx';
import LocalVideoPreview from '../LocalVideoPreview';
import WithLogo from './images/logo_extrasmall.svg';
import './joinRoom.css';

import { FormInputV2 } from '../FormInputV2/FormInputV2';
import { FormButton } from '../FormButton/FormButton';

import { AvatarSelect } from '../AvatarSelect/AvatarSelect';
import { randomAvatar } from '../AvatarSelect/options';
import { Avatar } from '../Avatar/Avatar';

import { AudioToggle } from '../AudioToggle/AudioToggle';
import { VideoToggle } from '../VideoToggle/VideoToggle';

import useLocalVideoToggle from '../../hooks/useLocalVideoToggle/useLocalVideoToggle';

type JoinRoomProps = {
  roomName: string;
  onJoinSubmitHandler: (userName: string, password: string, initialAvatar: string) => void;
};

const JoinRoom = ({ roomName, onJoinSubmitHandler }: JoinRoomProps) => {
  const [screenName, setScreenName] = useState('');
  const [password, setPassword] = useState('');
  const [initialAvatarSrc, setInitialAvatarSrc] = useState(randomAvatar().name);
  const [isVideoEnabled] = useLocalVideoToggle();
  const [isSelectingAvatar, toggleIsSelectingAvatar] = useState(false);

  const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO input validation and add stuff here
    // We currently dont allow people into a room without a password and dont have
    // any error messaging really hooked up, so only allow them in if username and password
    // are filled out
    if (screenName.length > 0 && password.length > 0) {
      onJoinSubmitHandler(screenName, password, initialAvatarSrc);
    }
  };

  const joiningRoomText = <div className="JoinRoom-text u-flex u-flexAlignItemsCenter">Joining {roomName}</div>;

  const header = (
    <div className="u-flex u-flexRow u-flexAlignItemsCenter">
      <div>
        <img className="JoinRoom-logo" alt="With Logo" src={WithLogo} />
      </div>
      {joiningRoomText}
    </div>
  );

  const userAvatarCameraSelect = (
    <div className="JoinRoom-avControls u-flex u-flexCol u-flexAlignItemsCenter">
      <div className="JoinRoom-videoPreviewContainer">
        {isVideoEnabled ? (
          <LocalVideoPreview classNames="JoinRoom-videoPreview u-height100Percent" />
        ) : (
          <Avatar name={initialAvatarSrc} onClick={() => toggleIsSelectingAvatar(true)} />
        )}
      </div>
      <div className="u-flex">
        <div className="JoinRoom-avControls-item">
          <VideoToggle />
        </div>
        <div className="JoinRoom-avControls-item">
          <AudioToggle />
        </div>
      </div>
    </div>
  );

  const userLoginForm = (
    <form className="JoinRoom-form u-flex u-flexCol" onSubmit={onSubmitHandler}>
      <FormInputV2
        placeholderText={'Desired screen name'}
        classNames={'JoinRoom-formInputOffset u-marginBottom8'}
        value={screenName}
        onChangeHandler={setScreenName}
      />
      <FormInputV2
        placeholderText={'Room password'}
        classNames={'JoinRoom-formInputOffset u-marginBottom16'}
        value={password}
        onChangeHandler={setPassword}
        type="password"
      />
      <FormButton text="Join Room" btnType={'submit'} isActive={screenName.length > 0 && password.length > 0} />
      <div className="u-marginTop16 u-marginBottom16">
        We use analytics software to improve With. Please feel free to come back later, when we made it optional.
      </div>
    </form>
  );

  return (
    <div className="JoinRoom u-width100Percent u-flex u-flexJustifyCenter u-flexAlignItemsCenter">
      <div className="JoinRoom-container u-positionRelative u-size8of10 u-sm-sizeFull u-margin8">
        <div
          className={clsx('JoinRoom-header u-flex u-sm-displayNone u-marginBottom24', {
            'is-open': !isSelectingAvatar,
          })}
        >
          {header}
        </div>
        <div className={clsx('JoinRoom-userInfo u-flex u-flexRow u-sm-flexCol', { 'is-open': !isSelectingAvatar })}>
          <div className="JointRoom-title u-sm-flex u-md-displayNone u-lg-displayNone u-flexJustifyCenter u-flexAlignItemsCenter">
            {joiningRoomText}
          </div>
          <div className="joinRoom-videoPreviewContainer u-size1of2 u-sm-sizeFull u-flex u-flexCol u-flexAlignItemsCenter">
            {userAvatarCameraSelect}
          </div>
          <div className="joinRoom-formContainer u-size1of2 u-sm-sizeFull">{userLoginForm}</div>
        </div>
        <div className={clsx('JoinRoom-avatarSelect', { 'is-open': isSelectingAvatar })}>
          <AvatarSelect
            onAvatarChange={src => setInitialAvatarSrc(src)}
            defaultAvatar={initialAvatarSrc}
            handleClose={() => toggleIsSelectingAvatar(false)}
          />
        </div>
        <div className="u-sm-flex u-md-displayNone u-lg-displayNone u-flexJustifyCenter u-flexAlignItemsCenter">
          <img className="JoinRoom-logo" alt="header-logo" src={WithLogo} />
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
