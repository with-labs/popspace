import React, { useState } from 'react';
import clsx from 'clsx';
import LocalVideoPreview from '../LocalVideoPreview';

import WithLogo from '../../images/withLogo.svg';
import './joinRoom.css';

import FormInput from '../FormInput';
import { AvatarSelect } from '../AvatarSelect/AvatarSelect';
import { randomAvatar } from '../AvatarSelect/options';
import { Avatar } from '../Avatar/Avatar';

import { DoublePaneBox } from '../DoublePaneBox/DoublePaneBox';

import useLocalVideoToggle from '../../hooks/useLocalVideoToggle/useLocalVideoToggle';

import ToggleVideoButton from '../../components/Controls/ToggleVideoButton/ToggleVideoButton';
import ToggleAudioButton from '../../components/Controls/ToggleAudioButton/ToggleAudioButton';

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
    //TODO input validation and add stuff here
    if (screenName.length > 0) {
      onJoinSubmitHandler(screenName, password, initialAvatarSrc);
    }
  };

  const login = (
    <DoublePaneBox
      header={
        <div>
          <img src={WithLogo} className="JoinRoom-heading-logo" /> Joining <strong>{roomName}</strong>
        </div>
      }
      leftPane={
        <div className="JoinRoom-avControls u-flex u-flexCol u-flexAlignCenter">
          <div className="JoinRoom-videoPreviewContainer">
            {isVideoEnabled ? (
              <LocalVideoPreview classNames="JoinRoom-videoPreview u-height100Percent" />
            ) : (
              <Avatar name={initialAvatarSrc} onClick={() => toggleIsSelectingAvatar(true)} />
            )}
          </div>
          <div>
            <ToggleVideoButton />
            <ToggleAudioButton />
          </div>
        </div>
      }
      rightPane={
        <form className="JoinRoom-form" onSubmit={onSubmitHandler}>
          <FormInput
            imgAltText={'person image'}
            placeholderText={'Desired screen name'}
            classNames={'JoinRoom-formInputOffset'}
            value={screenName}
            setValue={setScreenName}
          />
          <FormInput
            imgAltText={'password image'}
            placeholderText={'Room password'}
            classNames={'JoinRoom-formInputOffset'}
            value={password}
            setValue={setPassword}
            type="password"
          />
          <button type="submit" className={clsx('JoinRoom-button', { 'is-inactive': screenName.length === 0 })}>
            Join Room
          </button>
          <p className="JoinRoom-analyticsNotice">
            We wanted you to know, we're using product analytics software to track how you use our app. We use that info
            to guide our decisions about how to make the With App better. If you don't want us tracking how you use our
            app, feel free to come back later. We plan on making tracking optional in the future.
          </p>
        </form>
      }
      footer={<img src={WithLogo} className="JoinRoom-endLogo" alt="With logo" />}
    />
  );

  return (
    <div className="JoinRoom">
      <div className={clsx('JoinRoom-login', { 'is-open': !isSelectingAvatar })}>{login}</div>
      <div className={clsx('JoinRoom-avatarSelect', { 'is-open': isSelectingAvatar })}>
        <AvatarSelect
          onAvatarChange={src => setInitialAvatarSrc(src)}
          defaultAvatar={initialAvatarSrc}
          handleClose={() => toggleIsSelectingAvatar(false)}
        />
      </div>
    </div>
  );
};

export default JoinRoom;
