import React, { useState } from 'react';
import Header from '../Header';

import clsx from 'clsx';
import './index.css';
import LocalVideoPreview from '../LocalVideoPreview';
import Controls from '../../components/Controls/Controls';

import FormInputV2 from '../FormInputV2';
import FormButton from '../FormButton';

import screenNameImg from './images/screen_name.svg';
import passwordImg from './images/password.svg';

import WithLogo from '../../images/withLogo.svg';

type JoinRoomProps = {
  roomName: string;
  onJoinSubmitHandler: (userName: string, password: string) => void;
};

const JoinRoom = ({ roomName, onJoinSubmitHandler }: JoinRoomProps) => {
  const [screenName, setScreenName] = useState('');
  const [password, setPassword] = useState('');

  const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //TODO input validation and add stuff here
    if (screenName.length > 0) {
      onJoinSubmitHandler(screenName, password);
    }
  };

  return (
    <div className="JoinRoom u-flex u-flexJustifyCenter u-flexAlignItemsCenter">
      <div className="JoinRoom-container u-size8of10 u-sm-sizeFull">
        <div className="JoinRoom-header u-sm-displayNone">
          <Header roomName={roomName} />
        </div>
        <div className="JoinRoom-userInfo u-flex u-flexRow u-sm-flexCol">
          <div className="JointRoom-title u-displayNone u-sm-flex u-flexJustifyCenter u-flexAlignItemsCenter">
            Joining {roomName}
          </div>
          <div className="joinRoom-videoPreviewContainer u-size1of2 u-sm-sizeFull u-flex u-flexCol u-flexAlignItemsCenter">
            <LocalVideoPreview classNames={'JoinRoom-videoPreview'} />
          </div>
          <div className="joinRoom-formContainer u-size1of2 u-sm-sizeFull">
            <form className="JoinRoom-form u-flex u-flexCol" onSubmit={onSubmitHandler}>
              <FormInputV2
                placeholderText={'Desired screen name'}
                classNames={'JoinRoom-formInputOffset'}
                value={screenName}
                onChangeHandler={setScreenName}
              />
              <FormInputV2
                placeholderText={'Room password'}
                classNames={'JoinRoom-formInputOffset'}
                value={password}
                onChangeHandler={setPassword}
                type="password"
              />
              <FormButton text="Join Room" />
              <div>
                We use analytics software to improve With. Please feel free to come back later, when we made it
                optional.
              </div>
            </form>
          </div>
        </div>
        <div className="u-displayNone u-sm-flex u-flexJustifyCenter u-flexAlignItemsCenter">
          <img className="JoinRoom-logo" alt="header-logo" src={WithLogo} />
        </div>
      </div>

      {/* <div className="JoinRoom-videoPreviewContainer">
        <LocalVideoPreview classNames={'JoinRoom-videoPreview'} />
      </div>
      <div className="JoinRoom-joinTitle">Joining {roomName}</div>
      <form className="JoinRoom-form" onSubmit={onSubmitHandler}>
        <FormInput
          imgSrc={screenNameImg}
          imgAltText={'person image'}
          placeholderText={'Screen name'}
          classNames={'JoinRoom-formInputOffset'}
          value={screenName}
          setValue={setScreenName}
        />
        <FormInput
          imgSrc={passwordImg}
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
      <div className="JoinRoom-controls">
        <Controls />
      </div> */}
    </div>
  );
};

export default JoinRoom;
